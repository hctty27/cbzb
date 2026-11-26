import { dist } from '../core/CoordTransform';
import { MapEdgeDef, MapNodeDef } from '../data/Types';

export interface PolyPoint {
  x: number;
  y: number;
}

interface InternalEdge {
  to: string;
  length: number;
  /** Polyline vertices strictly between `from` and `to` (excluding endpoints). */
  midPoints: PolyPoint[];
}

export class GraphNav {
  private readonly nodes = new Map<string, MapNodeDef>();
  private readonly edges: MapEdgeDef[];
  private readonly adj = new Map<string, InternalEdge[]>();

  constructor(nodeDefs: MapNodeDef[], edgeDefs: MapEdgeDef[]) {
    this.edges = edgeDefs;
    for (const n of nodeDefs) {
      this.nodes.set(n.id, n);
      this.adj.set(n.id, []);
    }
    for (const e of edgeDefs) {
      const a = this.nodes.get(e.from);
      const b = this.nodes.get(e.to);
      if (!a || !b) continue;
      const fwdPts = [{ x: a.flashX, y: a.flashY }, ...e.waypoints, { x: b.flashX, y: b.flashY }];
      let len = 0;
      for (let i = 1; i < fwdPts.length; i++) {
        len += dist(fwdPts[i - 1].x, fwdPts[i - 1].y, fwdPts[i].x, fwdPts[i].y);
      }
      this.adj.get(e.from)!.push({ to: e.to, length: len, midPoints: [...e.waypoints] });
      this.adj.get(e.to)!.push({ to: e.from, length: len, midPoints: [...e.waypoints].reverse() });
    }
  }

  getNode(id: string): MapNodeDef | undefined {
    return this.nodes.get(id);
  }

  /** Finds nearest traversable graph node (excluding BuildSites unless specified) to a Flash point. */
  findNearestRoadNode(flashX: number, flashY: number, includeBuildSites = false): MapNodeDef {
    let best: MapNodeDef | null = null;
    let bestD = Infinity;
    for (const n of this.nodes.values()) {
      if (!includeBuildSites && n.kind === 'BuildSite') continue;
      const d = dist(flashX, flashY, n.flashX, n.flashY);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    return best!;
  }

  /** Computes shortest node-id sequence via Dijkstra between two road nodes. */
  findNodePath(startId: string, goalId: string): string[] {
    if (startId === goalId) return [startId];
    const distMap = new Map<string, number>();
    const prev = new Map<string, string>();
    const unvisited = new Set<string>(this.nodes.keys());

    for (const id of unvisited) distMap.set(id, Infinity);
    distMap.set(startId, 0);

    while (unvisited.size > 0) {
      let u: string | null = null;
      let uDist = Infinity;
      for (const id of unvisited) {
        const d = distMap.get(id)!;
        if (d < uDist) {
          uDist = d;
          u = id;
        }
      }
      if (!u || uDist === Infinity || u === goalId) break;
      unvisited.delete(u);

      for (const edge of this.adj.get(u) ?? []) {
        if (!unvisited.has(edge.to)) continue;
        const alt = uDist + edge.length;
        if (alt < distMap.get(edge.to)!) {
          distMap.set(edge.to, alt);
          prev.set(edge.to, u);
        }
      }
    }

    if (!prev.has(goalId)) return [startId, goalId];
    const seq: string[] = [];
    let cur: string | undefined = goalId;
    while (cur) {
      seq.push(cur);
      cur = prev.get(cur);
    }
    return seq.reverse();
  }

  /**
   * Computes full Flash-coordinate polyline waypoints from `(fromX, fromY)` to target node or arbitrary Flash point.
   */
  buildPath(fromX: number, fromY: number, toX: number, toY: number, targetNodeId?: string): PolyPoint[] {
    const startNode = this.findNearestRoadNode(fromX, fromY);
    const goalNode = targetNodeId && this.nodes.has(targetNodeId)
      ? this.nodes.get(targetNodeId)!
      : this.findNearestRoadNode(toX, toY);

    // BuildSite snaps visually near its parent stronghold; use road graph to nearest road node then final point
    const resolvedGoalNode = goalNode.kind === 'BuildSite'
      ? this.findNearestRoadNode(goalNode.flashX, goalNode.flashY, false)
      : goalNode;

    const nodeSeq = this.findNodePath(startNode.id, resolvedGoalNode.id);
    const pts: PolyPoint[] = [];

    const pushUnique = (p: PolyPoint) => {
      if (pts.length === 0) {
        if (dist(fromX, fromY, p.x, p.y) > 4) pts.push({ x: p.x, y: p.y });
      } else {
        const last = pts[pts.length - 1];
        if (dist(last.x, last.y, p.x, p.y) > 4) pts.push({ x: p.x, y: p.y });
      }
    };

    // Include start node only if squad is > 12px away from it and first segment doesn't immediately backtrack
    if (nodeSeq.length === 1) {
      pushUnique({ x: resolvedGoalNode.flashX, y: resolvedGoalNode.flashY });
    } else {
      if (dist(fromX, fromY, startNode.flashX, startNode.flashY) > 14) {
        pushUnique({ x: startNode.flashX, y: startNode.flashY });
      }
      for (let i = 0; i < nodeSeq.length - 1; i++) {
        const u = nodeSeq[i];
        const v = nodeSeq[i + 1];
        const edge = (this.adj.get(u) ?? []).find((e) => e.to === v);
        if (edge) {
          for (const wp of edge.midPoints) pushUnique(wp);
        }
        const vNode = this.nodes.get(v)!;
        pushUnique({ x: vNode.flashX, y: vNode.flashY });
      }
    }

    if (!targetNodeId && dist(resolvedGoalNode.flashX, resolvedGoalNode.flashY, toX, toY) > 10) {
      pushUnique({ x: toX, y: toY });
    }
    return pts;
  }
}
