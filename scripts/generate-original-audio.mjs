#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Mp3Encoder } from '../tools/audio-synth/node_modules/@breezystack/lamejs/dist/lamejs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'game', 'assets', 'resources', 'audio');
const SR = 22050;

// Deterministic PRNG (Mulberry32)
function makeRng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function rng() {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo = -1, hi = 1) {
  return v < lo ? lo : v > hi ? hi : v;
}

function adsr(t, dur, a = 0.008, d = 0.08, s = 0.4, r = 0.08) {
  if (t < 0 || t >= dur) return 0;
  const relStart = Math.max(0, dur - r);
  let g = 1;
  if (t < a) {
    g = t / Math.max(1e-5, a);
  } else if (t < a + d) {
    const k = (t - a) / Math.max(1e-5, d);
    g = 1 - (1 - s) * k;
  } else if (t < relStart) {
    g = s;
  } else {
    const k = (t - relStart) / Math.max(1e-5, dur - relStart);
    g = s * (1 - k);
  }
  return clamp(g, 0, 1);
}

function normalizeAndFade(buf, targetPeak = 0.88, fadeOutSec = 0.025) {
  let maxAbs = 0;
  for (let i = 0; i < buf.length; i++) {
    const a = Math.abs(buf[i]);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs > 1e-6) {
    const gain = targetPeak / maxAbs;
    for (let i = 0; i < buf.length; i++) buf[i] *= gain;
  }
  const fadeSamples = Math.min(buf.length, Math.floor(fadeOutSec * SR));
  for (let i = 0; i < fadeSamples; i++) {
    buf[buf.length - 1 - i] *= i / fadeSamples;
  }
  const fadeIn = Math.min(buf.length, Math.floor(0.004 * SR));
  for (let i = 0; i < fadeIn; i++) {
    buf[i] *= i / fadeIn;
  }
  return buf;
}

function addFeedbackReverb(buf, delayMs = 38, feedback = 0.28, mix = 0.22) {
  const d1 = Math.floor((delayMs / 1000) * SR);
  const d2 = Math.floor(((delayMs * 1.47) / 1000) * SR);
  const wet = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const v1 = i >= d1 ? buf[i - d1] + wet[i - d1] * feedback : 0;
    const v2 = i >= d2 ? buf[i - d2] + wet[i - d2] * feedback : 0;
    wet[i] = 0.5 * (v1 + v2);
  }
  for (let i = 0; i < buf.length; i++) {
    buf[i] = buf[i] * (1 - mix * 0.5) + wet[i] * mix;
  }
}

// Mix a Karplus-Strong plucked Chinese guzheng/qin note
function mixPluck(out, startSec, freq, durSec, amp, bright = 0.65, rng) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  const period = Math.max(4, Math.round(SR / freq));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) {
    ring[i] = (rng() * 2 - 1) * 0.8 + 0.2 * Math.sin((2 * Math.PI * i) / period);
  }
  let idx = 0;
  let prev = 0;
  const damp = 0.992 - (1 - bright) * 0.015;
  for (let n = 0; n < len && start + n < out.length; n++) {
    const cur = ring[idx];
    const nextIdx = (idx + 1) % period;
    const filtered = damp * (bright * 0.5 * (cur + ring[nextIdx]) + (1 - bright) * 0.5 * (cur + prev));
    ring[idx] = filtered;
    prev = cur;
    idx = nextIdx;
    const t = n / SR;
    const env = t < 0.004 ? t / 0.004 : Math.max(0, 1 - (t / durSec) * 0.35);
    out[start + n] += cur * amp * env;
  }
}

// Mix bronze bell / bianzhong chime
function mixBell(out, startSec, freq, durSec, amp) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  const ratios = [1.0, 2.0, 2.41, 3.01, 4.12];
  const weights = [1.0, 0.52, 0.32, 0.22, 0.14];
  for (let n = 0; n < len && start + n < out.length; n++) {
    const t = n / SR;
    const att = t < 0.006 ? t / 0.006 : 1;
    let v = 0;
    for (let k = 0; k < ratios.length; k++) {
      const decay = Math.exp(-t * (1.8 + k * 1.4) * (1.8 / Math.max(0.4, durSec)));
      v += weights[k] * decay * Math.sin(2 * Math.PI * freq * ratios[k] * t);
    }
    out[start + n] += v * amp * att * 0.45;
  }
}

// Mix war drum hit
function mixDrum(out, startSec, baseFreq = 95, endFreq = 42, durSec = 0.36, amp = 0.85, snapNoise = 0.25, rng) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  let phase = 0;
  let lp = 0;
  for (let n = 0; n < len && start + n < out.length; n++) {
    const t = n / SR;
    const env = (t < 0.005 ? t / 0.005 : 1) * Math.exp(-t * (5.8 / Math.max(0.15, durSec)));
    const f = endFreq + (baseFreq - endFreq) * Math.exp(-t * 28);
    phase += (2 * Math.PI * f) / SR;
    const body = Math.sin(phase) + 0.25 * Math.sin(phase * 2.05) * Math.exp(-t * 16);
    lp = lp * 0.65 + (rng() * 2 - 1) * 0.35;
    const click = lp * snapNoise * Math.exp(-t * 36);
    out[start + n] += Math.tanh((body + click) * 1.2) * amp * env;
  }
}

// Mix filtered noise burst (slash, wind, thunder, breath, poison hiss)
function mixNoiseBurst(out, startSec, durSec, amp, lpAlpha = 0.25, hpAlpha = 0, rng, decayRate = 5) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  let lp = 0;
  let hp = 0;
  let prevRaw = 0;
  for (let n = 0; n < len && start + n < out.length; n++) {
    const t = n / SR;
    const raw = rng() * 2 - 1;
    lp = lp + lpAlpha * (raw - lp);
    hp = hpAlpha > 0 ? hpAlpha * (hp + lp - prevRaw) : lp;
    prevRaw = lp;
    const env = adsr(t, durSec, 0.005, durSec * 0.2, 0.5, durSec * 0.45) * Math.exp(-t * decayRate);
    out[start + n] += (hpAlpha > 0 ? hp : lp) * amp * env;
  }
}

// Mix FM metallic or horn tone
function mixFm(out, startSec, durSec, f0, f1, modRatio, modIdx, amp, attack = 0.015, decay = 3) {
  const start = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  let cPhase = 0;
  let mPhase = 0;
  for (let n = 0; n < len && start + n < out.length; n++) {
    const t = n / SR;
    const prog = t / Math.max(1e-4, durSec);
    const f = f0 + (f1 - f0) * prog;
    cPhase += (2 * Math.PI * f) / SR;
    mPhase += (2 * Math.PI * f * modRatio) / SR;
    const idx = modIdx * Math.exp(-t * decay * 0.7);
    const sig = Math.sin(cPhase + idx * Math.sin(mPhase));
    const env = adsr(t, durSec, attack, durSec * 0.25, 0.55, durSec * 0.35) * Math.exp(-t * decay * 0.4);
    out[start + n] += sig * amp * env;
  }
}

function synthBgmMenu(rng) {
  // D minor pentatonic / Yu mode: D, F, G, A, C (desolate heroic ShanHai court)
  const dur = 16.0;
  const out = new Float32Array(Math.floor(dur * SR));
  const scale = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0, 440.0, 523.25];

  // Slow drone pad (loop-seamless via dual cosine envelope)
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const pad =
      0.55 * Math.sin(2 * Math.PI * 73.42 * t) +
      0.28 * Math.sin(2 * Math.PI * 110.0 * t) +
      0.14 * Math.sin(2 * Math.PI * 146.83 * t);
    const swell = 0.65 + 0.35 * Math.sin((2 * Math.PI * t) / dur);
    out[i] += pad * 0.18 * swell;
  }

  // Guzheng 32-step sparse pentatonic phrase (each beat = 0.5s)
  const melodyIdx = [
    5, -1, 7, 8, 7, -1, 5, 3,
    4, -1, 5, 3, 2, -1, 0, -1,
    5, 7, 8, -1, 9, 8, 7, 5,
    4, 5, 3, -1, 2, 0, -1, -1,
  ];
  for (let step = 0; step < melodyIdx.length; step++) {
    const ni = melodyIdx[step];
    if (ni < 0) continue;
    const t = step * 0.5;
    mixPluck(out, t, scale[ni], 2.2, 0.38, 0.7, rng);
    if (step % 8 === 0) {
      mixBell(out, t, scale[ni % 5] * 2, 2.8, 0.32);
    }
  }
  // Distant court taigu drum pulse every 2 seconds
  for (let b = 0; b < 8; b++) {
    mixDrum(out, b * 2.0, 82, 46, 0.55, 0.28, 0.08, rng);
  }
  addFeedbackReverb(out, 62, 0.35, 0.28);
  return normalizeAndFade(out, 0.78, 0.06);
}

function synthBgmBattle(rng) {
  // Intense ancient war march (D-A-G-F-D pentatonic battle ostinato, 16.0s loop)
  const dur = 16.0;
  const out = new Float32Array(Math.floor(dur * SR));
  const beat = 0.25; // 120 BPM eighth-notes -> 64 steps
  const bassNotes = [73.42, 73.42, 110.0, 87.31, 98.0, 73.42, 65.41, 73.42];

  // Marching war drums & chimes
  for (let s = 0; s < 64; s++) {
    const t = s * beat;
    const barStep = s % 8;
    if (barStep === 0 || barStep === 3 || barStep === 6) {
      mixDrum(out, t, 108, 44, 0.34, barStep === 0 ? 0.58 : 0.42, 0.22, rng);
    } else if (barStep === 4) {
      mixDrum(out, t, 165, 85, 0.16, 0.28, 0.32, rng); // rim/wooden clack
    }
    if (s % 2 === 0) {
      const bf = bassNotes[Math.floor(s / 8) % bassNotes.length];
      mixPluck(out, t, bf * 2, 0.75, 0.28, 0.78, rng);
    }
  }

  // Bronze war horn calls on bars 1 and 5
  mixFm(out, 0.0, 2.4, 146.83, 149.0, 1.0, 1.8, 0.26, 0.12, 1.0);
  mixFm(out, 8.0, 2.4, 174.61, 146.83, 1.0, 2.0, 0.26, 0.12, 1.0);

  // Rapid heroic pipa/guzheng battle motif
  const lead = [
    293.66, 349.23, 392.0, 440.0, 392.0, 349.23, 293.66, 261.63,
    293.66, 440.0, 523.25, 440.0, 392.0, 349.23, 293.66, 220.0,
  ];
  for (let i = 0; i < 32; i++) {
    const t = i * 0.5;
    if (i % 4 !== 3) {
      mixPluck(out, t, lead[i % lead.length], 0.65, 0.32, 0.82, rng);
    }
  }

  addFeedbackReverb(out, 42, 0.28, 0.2);
  return normalizeAndFade(out, 0.82, 0.05);
}

const GENERATORS = {
  music_menu: synthBgmMenu,
  music_battle: synthBgmBattle,

  ui_click: (rng) => {
    const out = new Float32Array(Math.floor(0.14 * SR));
    mixBell(out, 0, 1180, 0.12, 0.65);
    mixDrum(out, 0, 420, 220, 0.06, 0.45, 0.25, rng);
    return normalizeAndFade(out, 0.82, 0.015);
  },
  ui_hover: (rng) => {
    const out = new Float32Array(Math.floor(0.09 * SR));
    mixBell(out, 0, 1520, 0.08, 0.4);
    mixNoiseBurst(out, 0, 0.04, 0.18, 0.45, 0.7, rng, 18);
    return normalizeAndFade(out, 0.6, 0.015);
  },

  send_soldiers: (rng) => {
    const out = new Float32Array(Math.floor(0.65 * SR));
    mixDrum(out, 0.0, 110, 48, 0.32, 0.8, 0.25, rng);
    mixDrum(out, 0.18, 125, 52, 0.28, 0.7, 0.28, rng);
    mixFm(out, 0.05, 0.48, 220, 293.66, 1.0, 1.4, 0.35, 0.04, 2.2);
    return normalizeAndFade(out, 0.85);
  },
  send_horses: (rng) => {
    const out = new Float32Array(Math.floor(0.75 * SR));
    for (let i = 0; i < 6; i++) {
      mixDrum(out, i * 0.1, 210 + (i % 2) * 40, 85, 0.09, 0.65 - i * 0.06, 0.4, rng);
    }
    mixFm(out, 0.04, 0.42, 440, 620, 1.5, 2.2, 0.25, 0.03, 3.0);
    return normalizeAndFade(out, 0.85);
  },
  send_siege: (rng) => {
    const out = new Float32Array(Math.floor(0.85 * SR));
    mixDrum(out, 0.0, 75, 34, 0.55, 0.9, 0.15, rng);
    mixNoiseBurst(out, 0.05, 0.6, 0.45, 0.18, 0.85, rng, 2.5);
    mixFm(out, 0.12, 0.55, 110, 88, 1.4, 1.8, 0.35, 0.05, 2.5);
    return normalizeAndFade(out, 0.86);
  },
  send_bots: (rng) => {
    const out = new Float32Array(Math.floor(0.65 * SR));
    mixBell(out, 0.0, 392, 0.45, 0.5);
    mixFm(out, 0.05, 0.5, 520, 780, 2.5, 2.2, 0.4, 0.02, 4.0);
    return normalizeAndFade(out, 0.84);
  },
  send_reptiles: (rng) => {
    const out = new Float32Array(Math.floor(0.7 * SR));
    mixFm(out, 0.0, 0.55, 165, 92, 1.37, 3.5, 0.6, 0.04, 2.6);
    mixNoiseBurst(out, 0.05, 0.45, 0.45, 0.35, 0.6, rng, 3.5);
    return normalizeAndFade(out, 0.85);
  },

  attack_sword: (rng) => {
    const out = new Float32Array(Math.floor(0.35 * SR));
    mixNoiseBurst(out, 0, 0.14, 0.5, 0.65, 0.5, rng, 14);
    mixFm(out, 0.01, 0.26, 1380, 960, 1.73, 4.2, 0.65, 0.004, 10);
    return normalizeAndFade(out, 0.85);
  },
  attack_bow: (rng) => {
    const out = new Float32Array(Math.floor(0.32 * SR));
    mixPluck(out, 0, 240, 0.2, 0.5, 0.7, rng);
    mixNoiseBurst(out, 0.02, 0.22, 0.55, 0.55, 0.65, rng, 9);
    return normalizeAndFade(out, 0.84);
  },
  hit_arrow: (rng) => {
    const out = new Float32Array(Math.floor(0.2 * SR));
    mixDrum(out, 0, 260, 95, 0.09, 0.7, 0.45, rng);
    mixNoiseBurst(out, 0, 0.08, 0.4, 0.4, 0.7, rng, 20);
    return normalizeAndFade(out, 0.82);
  },
  attack_siege: (rng) => {
    const out = new Float32Array(Math.floor(0.85 * SR));
    mixDrum(out, 0, 90, 28, 0.7, 0.95, 0.35, rng);
    mixNoiseBurst(out, 0.02, 0.72, 0.75, 0.16, 0, rng, 3.2);
    addFeedbackReverb(out, 45, 0.25, 0.22);
    return normalizeAndFade(out, 0.88);
  },
  attack_ogre: (rng) => {
    const out = new Float32Array(Math.floor(0.55 * SR));
    mixDrum(out, 0, 115, 36, 0.42, 0.9, 0.3, rng);
    mixFm(out, 0.02, 0.42, 135, 78, 1.28, 3.2, 0.5, 0.02, 3.5);
    return normalizeAndFade(out, 0.86);
  },
  attack_magic: (rng) => {
    const out = new Float32Array(Math.floor(0.5 * SR));
    mixFm(out, 0, 0.45, 680, 1120, 2.0, 2.6, 0.5, 0.01, 5);
    mixBell(out, 0.03, 880, 0.4, 0.4);
    addFeedbackReverb(out, 36, 0.3, 0.25);
    return normalizeAndFade(out, 0.84);
  },
  attack_gun: (rng) => {
    const out = new Float32Array(Math.floor(0.38 * SR));
    mixDrum(out, 0, 280, 42, 0.25, 0.9, 0.65, rng);
    mixNoiseBurst(out, 0, 0.3, 0.8, 0.55, 0.4, rng, 9);
    return normalizeAndFade(out, 0.88);
  },

  build_farm: (rng) => {
    const out = new Float32Array(Math.floor(0.55 * SR));
    mixDrum(out, 0.0, 150, 75, 0.16, 0.75, 0.35, rng);
    mixDrum(out, 0.18, 180, 90, 0.16, 0.65, 0.35, rng);
    mixPluck(out, 0.26, 440, 0.28, 0.4, 0.65, rng);
    return normalizeAndFade(out, 0.84);
  },
  build_mine: (rng) => {
    const out = new Float32Array(Math.floor(0.6 * SR));
    mixFm(out, 0.0, 0.25, 1150, 1120, 1.82, 3.0, 0.55, 0.005, 8);
    mixFm(out, 0.2, 0.32, 1320, 1280, 1.82, 2.8, 0.6, 0.005, 7);
    return normalizeAndFade(out, 0.84);
  },
  build_obelisk: (rng) => {
    const out = new Float32Array(Math.floor(0.8 * SR));
    mixBell(out, 0.0, 523.25, 0.72, 0.6);
    mixBell(out, 0.14, 783.99, 0.62, 0.5);
    addFeedbackReverb(out, 45, 0.32, 0.26);
    return normalizeAndFade(out, 0.85);
  },
  build_graveyard: (rng) => {
    const out = new Float32Array(Math.floor(0.75 * SR));
    mixDrum(out, 0, 82, 36, 0.45, 0.8, 0.2, rng);
    mixFm(out, 0.06, 0.62, 196, 130, 1.41, 3.0, 0.45, 0.04, 2.5);
    return normalizeAndFade(out, 0.84);
  },
  capture_stronghold: (rng) => {
    const out = new Float32Array(Math.floor(1.25 * SR));
    mixDrum(out, 0.0, 95, 42, 0.5, 0.85, 0.25, rng);
    mixBell(out, 0.05, 293.66, 0.9, 0.55);
    mixBell(out, 0.22, 440.0, 0.9, 0.55);
    mixBell(out, 0.4, 587.33, 0.8, 0.6);
    mixFm(out, 0.1, 0.95, 293.66, 440.0, 1.0, 1.6, 0.35, 0.06, 1.5);
    addFeedbackReverb(out, 55, 0.35, 0.28);
    return normalizeAndFade(out, 0.88);
  },

  dead_man: (rng) => {
    const out = new Float32Array(Math.floor(0.42 * SR));
    mixFm(out, 0, 0.34, 230, 115, 1.15, 2.2, 0.6, 0.02, 5);
    mixDrum(out, 0.12, 110, 52, 0.22, 0.55, 0.2, rng);
    return normalizeAndFade(out, 0.82);
  },
  dead_undead: (rng) => {
    const out = new Float32Array(Math.floor(0.5 * SR));
    mixNoiseBurst(out, 0, 0.4, 0.6, 0.45, 0.5, rng, 6);
    mixFm(out, 0.03, 0.38, 480, 140, 1.61, 3.8, 0.5, 0.01, 5);
    return normalizeAndFade(out, 0.82);
  },
  dead_horse: (rng) => {
    const out = new Float32Array(Math.floor(0.52 * SR));
    mixFm(out, 0, 0.4, 580, 240, 1.4, 3.2, 0.55, 0.02, 4.5);
    mixDrum(out, 0.18, 95, 44, 0.26, 0.65, 0.22, rng);
    return normalizeAndFade(out, 0.82);
  },
  dead_siege: (rng) => {
    const out = new Float32Array(Math.floor(0.75 * SR));
    mixDrum(out, 0, 88, 32, 0.55, 0.85, 0.35, rng);
    mixNoiseBurst(out, 0.04, 0.62, 0.7, 0.28, 0.4, rng, 4.2);
    return normalizeAndFade(out, 0.86);
  },
  dead_ogre: (rng) => {
    const out = new Float32Array(Math.floor(0.8 * SR));
    mixFm(out, 0, 0.6, 160, 58, 1.25, 3.5, 0.65, 0.03, 3.0);
    mixDrum(out, 0.28, 78, 30, 0.45, 0.85, 0.2, rng);
    return normalizeAndFade(out, 0.86);
  },
  dead_bot: (rng) => {
    const out = new Float32Array(Math.floor(0.55 * SR));
    mixFm(out, 0, 0.45, 760, 160, 2.71, 4.5, 0.6, 0.005, 5.5);
    mixNoiseBurst(out, 0.05, 0.35, 0.45, 0.5, 0.5, rng, 7);
    return normalizeAndFade(out, 0.84);
  },
  dead_reptile: (rng) => {
    const out = new Float32Array(Math.floor(0.5 * SR));
    mixNoiseBurst(out, 0, 0.42, 0.55, 0.6, 0.6, rng, 5.5);
    mixFm(out, 0.02, 0.4, 340, 125, 1.33, 3.0, 0.5, 0.02, 4.5);
    return normalizeAndFade(out, 0.82);
  },

  spell_lords_judgement: (rng) => {
    const out = new Float32Array(Math.floor(1.1 * SR));
    mixDrum(out, 0, 120, 30, 0.85, 0.9, 0.5, rng);
    mixNoiseBurst(out, 0, 0.95, 0.85, 0.42, 0, rng, 3.0);
    mixBell(out, 0.04, 440, 0.9, 0.55);
    addFeedbackReverb(out, 48, 0.35, 0.28);
    return normalizeAndFade(out, 0.88);
  },
  spell_stoneworms: (rng) => {
    const out = new Float32Array(Math.floor(0.95 * SR));
    mixDrum(out, 0.0, 82, 32, 0.65, 0.85, 0.35, rng);
    mixDrum(out, 0.22, 96, 38, 0.5, 0.75, 0.35, rng);
    mixNoiseBurst(out, 0.05, 0.78, 0.7, 0.22, 0, rng, 3.0);
    return normalizeAndFade(out, 0.86);
  },
  spell_disentomb: (rng) => {
    const out = new Float32Array(Math.floor(1.0 * SR));
    mixNoiseBurst(out, 0, 0.85, 0.65, 0.35, 0.45, rng, 2.8);
    mixFm(out, 0.05, 0.85, 150, 290, 1.41, 3.2, 0.5, 0.06, 2.2);
    return normalizeAndFade(out, 0.84);
  },
  ultimate_cataclysm: (rng) => {
    const out = new Float32Array(Math.floor(1.5 * SR));
    mixDrum(out, 0.0, 95, 26, 0.9, 0.9, 0.55, rng);
    mixDrum(out, 0.35, 110, 30, 0.8, 0.85, 0.5, rng);
    mixNoiseBurst(out, 0.0, 1.35, 0.85, 0.35, 0, rng, 2.0);
    mixFm(out, 0.05, 1.1, 220, 75, 1.5, 4.0, 0.45, 0.03, 1.8);
    addFeedbackReverb(out, 55, 0.35, 0.28);
    return normalizeAndFade(out, 0.9);
  },
  spell_ice_blast: (rng) => {
    const out = new Float32Array(Math.floor(0.85 * SR));
    mixNoiseBurst(out, 0, 0.72, 0.65, 0.7, 0.7, rng, 4.2);
    mixBell(out, 0.02, 1480, 0.65, 0.5);
    mixBell(out, 0.1, 1975, 0.55, 0.4);
    addFeedbackReverb(out, 40, 0.3, 0.26);
    return normalizeAndFade(out, 0.86);
  },
  spell_frost_enchant: (rng) => {
    const out = new Float32Array(Math.floor(0.8 * SR));
    mixBell(out, 0.0, 1046.5, 0.65, 0.45);
    mixBell(out, 0.1, 1318.5, 0.6, 0.45);
    mixBell(out, 0.2, 1567.98, 0.55, 0.5);
    addFeedbackReverb(out, 45, 0.3, 0.25);
    return normalizeAndFade(out, 0.84);
  },
  ultimate_transformation: (rng) => {
    const out = new Float32Array(Math.floor(1.35 * SR));
    mixFm(out, 0, 1.2, 260, 780, 1.5, 3.2, 0.55, 0.08, 1.6);
    mixBell(out, 0.15, 587.33, 1.0, 0.5);
    mixBell(out, 0.35, 880.0, 0.9, 0.5);
    addFeedbackReverb(out, 55, 0.35, 0.28);
    return normalizeAndFade(out, 0.88);
  },
  spell_terror: (rng) => {
    const out = new Float32Array(Math.floor(0.9 * SR));
    mixFm(out, 0, 0.8, 310, 118, 1.618, 4.2, 0.6, 0.03, 2.2);
    mixNoiseBurst(out, 0.05, 0.75, 0.5, 0.4, 0.65, rng, 3.0);
    return normalizeAndFade(out, 0.85);
  },
  ultimate_undead: (rng) => {
    const out = new Float32Array(Math.floor(1.3 * SR));
    mixDrum(out, 0, 74, 28, 0.9, 0.85, 0.25, rng);
    mixFm(out, 0.06, 1.1, 130, 210, 1.414, 3.8, 0.55, 0.08, 1.8);
    mixNoiseBurst(out, 0.1, 1.05, 0.55, 0.3, 0.5, rng, 2.2);
    addFeedbackReverb(out, 60, 0.38, 0.3);
    return normalizeAndFade(out, 0.86);
  },
  unit_frozen: (rng) => {
    const out = new Float32Array(Math.floor(0.45 * SR));
    mixBell(out, 0, 1760, 0.38, 0.5);
    mixNoiseBurst(out, 0.02, 0.3, 0.4, 0.65, 0.7, rng, 8);
    return normalizeAndFade(out, 0.82);
  },
  unit_feared: (rng) => {
    const out = new Float32Array(Math.floor(0.45 * SR));
    mixFm(out, 0, 0.38, 420, 240, 1.5, 3.0, 0.5, 0.02, 4.5);
    return normalizeAndFade(out, 0.8);
  },
  squad_level_up: (rng) => {
    const out = new Float32Array(Math.floor(0.75 * SR));
    mixBell(out, 0.0, 440, 0.45, 0.5);
    mixBell(out, 0.11, 587.33, 0.45, 0.5);
    mixBell(out, 0.22, 880, 0.5, 0.6);
    return normalizeAndFade(out, 0.85);
  },
  banner_set: (rng) => {
    const out = new Float32Array(Math.floor(0.5 * SR));
    mixNoiseBurst(out, 0, 0.25, 0.45, 0.5, 0.5, rng, 7);
    mixDrum(out, 0.03, 130, 58, 0.3, 0.75, 0.25, rng);
    mixBell(out, 0.06, 523.25, 0.38, 0.4);
    return normalizeAndFade(out, 0.84);
  },
  banner_remove: (rng) => {
    const out = new Float32Array(Math.floor(0.35 * SR));
    mixNoiseBurst(out, 0, 0.28, 0.45, 0.45, 0.5, rng, 7);
    mixFm(out, 0, 0.26, 420, 210, 1.2, 1.5, 0.35, 0.01, 6);
    return normalizeAndFade(out, 0.8);
  },
  unit_heroic: (rng) => {
    const out = new Float32Array(Math.floor(0.7 * SR));
    mixFm(out, 0, 0.6, 293.66, 440, 1.0, 1.8, 0.45, 0.04, 2.5);
    mixBell(out, 0.08, 659.25, 0.55, 0.5);
    return normalizeAndFade(out, 0.85);
  },
  ultimate_avatar: (rng) => {
    const out = new Float32Array(Math.floor(1.25 * SR));
    mixDrum(out, 0, 92, 34, 0.8, 0.85, 0.25, rng);
    mixBell(out, 0.05, 293.66, 1.0, 0.55);
    mixBell(out, 0.2, 587.33, 0.9, 0.55);
    mixFm(out, 0.08, 1.0, 146.83, 293.66, 1.0, 2.0, 0.4, 0.06, 1.6);
    addFeedbackReverb(out, 50, 0.35, 0.28);
    return normalizeAndFade(out, 0.88);
  },
  chest_open: (rng) => {
    const out = new Float32Array(Math.floor(0.55 * SR));
    mixDrum(out, 0, 160, 72, 0.18, 0.7, 0.35, rng);
    mixNoiseBurst(out, 0.04, 0.24, 0.35, 0.4, 0.65, rng, 8);
    mixBell(out, 0.14, 987.77, 0.36, 0.45);
    return normalizeAndFade(out, 0.84);
  },
  chest_gold: (rng) => {
    const out = new Float32Array(Math.floor(0.65 * SR));
    const freqs = [1318.5, 1567.98, 1975.53, 2349.32, 2637.02];
    for (let i = 0; i < freqs.length; i++) {
      mixBell(out, i * 0.06, freqs[i], 0.35, 0.42);
    }
    return normalizeAndFade(out, 0.84);
  },
};

function encodeMp3(floatSamples, kbps = 56) {
  const pcm = new Int16Array(floatSamples.length);
  for (let i = 0; i < floatSamples.length; i++) {
    const s = clamp(floatSamples[i], -1, 1);
    pcm[i] = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
  }
  const encoder = new Mp3Encoder(1, SR, kbps);
  const blockSize = 1152;
  const chunks = [];
  for (let i = 0; i < pcm.length; i += blockSize) {
    const slice = pcm.subarray(i, i + blockSize);
    const mp3buf = encoder.encodeBuffer(slice);
    if (mp3buf.length > 0) chunks.push(Buffer.from(mp3buf));
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(Buffer.from(end));
  return Buffer.concat(chunks);
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12);
}

function main() {
  const keys = Object.keys(GENERATORS);
  const existingFiles = fs
    .readdirSync(AUDIO_DIR)
    .filter((f) => f.endsWith('.mp3'))
    .map((f) => f.replace(/\.mp3$/, ''))
    .sort();

  const missing = existingFiles.filter((k) => !GENERATORS[k]);
  if (missing.length > 0) {
    throw new Error(`Missing audio generators for: ${missing.join(', ')}`);
  }

  let beforeBytes = 0;
  let afterBytes = 0;
  const report = [];

  for (const key of keys) {
    const filePath = path.join(AUDIO_DIR, `${key}.mp3`);
    const prevBuf = fs.existsSync(filePath) ? fs.readFileSync(filePath) : Buffer.alloc(0);
    const prevHash = prevBuf.length ? sha256(prevBuf) : 'none';
    beforeBytes += prevBuf.length;

    const rng = makeRng(`shanhai-fenghuo:${key}:v1`);
    const samples = GENERATORS[key](rng);
    const kbps = key.startsWith('music_') ? 64 : 48;
    const mp3Buf = encodeMp3(samples, kbps);

    if (mp3Buf.length < 128 || mp3Buf[0] !== 0xff || (mp3Buf[1] & 0xe0) !== 0xe0) {
      throw new Error(`Invalid MP3 header generated for ${key}`);
    }

    fs.writeFileSync(filePath, mp3Buf);
    afterBytes += mp3Buf.length;
    const nextHash = sha256(mp3Buf);
    if (prevHash === nextHash) {
      throw new Error(`Audio hash unchanged for ${key}`);
    }
    report.push({
      key,
      file: `game/assets/resources/audio/${key}.mp3`,
      prevBytes: prevBuf.length,
      bytes: mp3Buf.length,
      durationSec: Number((samples.length / SR).toFixed(2)),
      sha256Prefix: nextHash,
    });
  }

  console.log(
    `AUDIO_SYNTH_OK count=${report.length} beforeKB=${(beforeBytes / 1024).toFixed(1)} afterKB=${(afterBytes / 1024).toFixed(1)}`,
  );
  const summaryPath = path.join(ROOT, 'docs', 'shanhai', '.audio-synth-report.json');
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
}

main();
