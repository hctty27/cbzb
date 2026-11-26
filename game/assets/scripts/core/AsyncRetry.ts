export interface RetryOptions {
  maxAttempts?: number;
  timeoutMs?: number;
  baseDelayMs?: number;
  label?: string;
  onRetry?: (nextAttempt: number, maxAttempts: number, err: unknown) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withTimeout<T>(factory: () => Promise<T>, timeoutMs: number, label: string): Promise<T> {
  if (timeoutMs <= 0) return factory();
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    factory()
      .then((res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function retryAsync<T>(fn: (attempt: number) => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const maxAttempts = Math.max(1, Math.floor(opts.maxAttempts ?? 3));
  const timeoutMs = opts.timeoutMs ?? 12000;
  const baseDelayMs = Math.max(0, opts.baseDelayMs ?? 400);
  const label = opts.label ?? 'operation';

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await withTimeout(() => fn(attempt), timeoutMs, label);
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts) break;
      opts.onRetry?.(attempt + 1, maxAttempts, err);
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }
  throw lastErr;
}
