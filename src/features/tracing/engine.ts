import type { TraceLetter, TracePoint, TraceStroke } from '@/types/tracing';

export const PATH_TOLERANCE = 12;
export const DOT_TOLERANCE = 14;
export const START_RADIUS = 12;
export const END_RADIUS = 14;
export const MAX_FINGER_JUMP = 22;
export const BACKWARD_SLACK = 8;
export const COMPLETION_RATIO = 0.9;
export const SAMPLE_SPACING = 2.4;

export type StrokeRuntime = {
  stroke: TraceStroke;
  samples: TracePoint[];
  length: number;
  progress: number;
  covered: number;
  complete: boolean;
};

export type TracingEngineState = {
  strokeIndex: number;
  strokes: StrokeRuntime[];
  hint: string | null;
  letterComplete: boolean;
  gestureActive: boolean;
  catchingUp: boolean;
  lastFinger: TracePoint | null;
};

function distance(a: TracePoint, b: TracePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function densify(points: TracePoint[], spacing = SAMPLE_SPACING): TracePoint[] {
  if (points.length === 0) return [];
  const output: TracePoint[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const length = Math.max(distance(start, end), 0.01);
    const steps = Math.max(1, Math.ceil(length / spacing));
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      output.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      });
    }
  }
  output.push(points[points.length - 1]);
  return output;
}

function pathLength(samples: TracePoint[]): number {
  let total = 0;
  for (let i = 1; i < samples.length; i += 1) {
    total += distance(samples[i - 1], samples[i]);
  }
  return total;
}

function pointAtLength(samples: TracePoint[], target: number): TracePoint {
  if (samples.length === 0) return { x: 0, y: 0 };
  if (target <= 0) return samples[0];
  let walked = 0;
  for (let i = 0; i < samples.length - 1; i += 1) {
    const span = distance(samples[i], samples[i + 1]);
    if (walked + span >= target) {
      const t = span === 0 ? 0 : (target - walked) / span;
      return {
        x: samples[i].x + (samples[i + 1].x - samples[i].x) * t,
        y: samples[i].y + (samples[i + 1].y - samples[i].y) * t,
      };
    }
    walked += span;
  }
  return samples[samples.length - 1];
}

function projectOnPath(samples: TracePoint[], point: TracePoint): { s: number; dist: number } {
  let bestDist = Number.POSITIVE_INFINITY;
  let bestS = 0;
  let walked = 0;

  for (let i = 0; i < samples.length - 1; i += 1) {
    const start = samples[i];
    const end = samples[i + 1];
    const abx = end.x - start.x;
    const aby = end.y - start.y;
    const span = Math.hypot(abx, aby) || 0.0001;
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * abx + (point.y - start.y) * aby) / (span * span)));
    const qx = start.x + abx * t;
    const qy = start.y + aby * t;
    const dist = Math.hypot(point.x - qx, point.y - qy);
    if (dist < bestDist) {
      bestDist = dist;
      bestS = walked + span * t;
    }
    walked += span;
  }

  return { s: bestS, dist: bestDist };
}

function coveredFromProgress(samples: TracePoint[], length: number, progress: number): number {
  if (samples.length === 0 || progress <= 0) return 0;
  const target = progress * length;
  let walked = 0;
  for (let i = 1; i < samples.length; i += 1) {
    walked += distance(samples[i - 1], samples[i]);
    if (walked >= target) return i + 1;
  }
  return samples.length;
}

function cloneState(state: TracingEngineState): TracingEngineState {
  return {
    ...state,
    lastFinger: state.lastFinger ? { ...state.lastFinger } : null,
    strokes: state.strokes.map((item) => ({ ...item })),
  };
}

export function createEngineState(letter: TraceLetter): TracingEngineState {
  return {
    strokeIndex: 0,
    hint: null,
    letterComplete: false,
    gestureActive: false,
    catchingUp: false,
    lastFinger: null,
    strokes: letter.strokes.map((stroke) => {
      const samples = stroke.kind === 'dot' ? [...stroke.points] : densify(stroke.points);
      return {
        stroke,
        samples,
        length: pathLength(samples),
        progress: 0,
        covered: 0,
        complete: false,
      };
    }),
  };
}

function currentStroke(state: TracingEngineState): StrokeRuntime | undefined {
  return state.strokes[state.strokeIndex];
}

function maybeAdvanceLetter(state: TracingEngineState) {
  const stroke = currentStroke(state);
  if (!stroke?.complete) return;
  state.gestureActive = false;
  state.catchingUp = false;
  state.lastFinger = null;
  if (state.strokeIndex < state.strokes.length - 1) {
    state.strokeIndex += 1;
    state.hint = null;
    return;
  }
  state.letterComplete = true;
  state.hint = null;
}

function completeStroke(state: TracingEngineState, stroke: StrokeRuntime) {
  stroke.progress = 1;
  stroke.covered = stroke.samples.length;
  stroke.complete = true;
  maybeAdvanceLetter(state);
}

function applyProgress(stroke: StrokeRuntime, progress: number) {
  stroke.progress = Math.max(0, Math.min(1, progress));
  stroke.covered = coveredFromProgress(stroke.samples, stroke.length, stroke.progress);
}

function canComplete(stroke: StrokeRuntime): boolean {
  if (stroke.progress < COMPLETION_RATIO) return false;
  const end = stroke.samples[stroke.samples.length - 1];
  const at = pointAtLength(stroke.samples, stroke.progress * stroke.length);
  return distance(at, end) <= END_RADIUS || stroke.progress >= 0.97;
}

export function beginTrace(state: TracingEngineState, point: TracePoint): TracingEngineState {
  if (state.letterComplete) return state;
  const stroke = currentStroke(state);
  if (!stroke || stroke.complete) return state;

  const next = cloneState(state);
  const active = next.strokes[next.strokeIndex];
  next.gestureActive = false;
  next.catchingUp = false;
  next.lastFinger = null;

  if (active.stroke.kind === 'dot') {
    if (distance(point, active.samples[0]) <= DOT_TOLERANCE) {
      completeStroke(next, active);
    } else {
      next.hint = 'Start at the first dot';
    }
    return next;
  }

  const start = active.samples[0];
  if (distance(point, start) > START_RADIUS) {
    next.hint = 'Start at the first dot';
    return next;
  }

  applyProgress(active, active.progress);
  next.gestureActive = true;
  next.catchingUp = active.progress > 0.02;
  next.lastFinger = point;
  next.hint = null;
  return next;
}

export function moveTrace(state: TracingEngineState, point: TracePoint): TracingEngineState {
  if (state.letterComplete || !state.gestureActive || !state.lastFinger) return state;
  const stroke = currentStroke(state);
  if (!stroke || stroke.complete) return state;
  if (stroke.stroke.kind === 'dot') return state;

  const next = cloneState(state);
  const active = next.strokes[next.strokeIndex];
  const lastFinger = next.lastFinger;
  if (!lastFinger) return next;

  const fingerTravel = distance(lastFinger, point);
  if (fingerTravel > MAX_FINGER_JUMP) {
    next.hint = 'Follow the dotted line';
    return next;
  }

  const projection = projectOnPath(active.samples, point);
  if (projection.dist > PATH_TOLERANCE) {
    next.hint = 'Try again 😊';
    return next;
  }

  const currentS = active.progress * active.length;
  if (next.catchingUp && projection.s + BACKWARD_SLACK < currentS) {
    next.lastFinger = point;
    next.hint = null;
    return next;
  }
  next.catchingUp = false;

  if (projection.s + BACKWARD_SLACK < currentS) {
    next.hint = 'Try again 😊';
    return next;
  }

  const maxAdvance = currentS + Math.max(fingerTravel * 1.25, SAMPLE_SPACING);
  const nextS = Math.min(projection.s, maxAdvance);
  if (nextS + 0.01 < currentS) {
    return next;
  }

  applyProgress(active, active.length === 0 ? 1 : nextS / active.length);
  next.lastFinger = point;

  if (canComplete(active)) {
    completeStroke(next, active);
  } else {
    next.hint = null;
  }

  return next;
}

export function endTrace(state: TracingEngineState): TracingEngineState {
  if (state.letterComplete) return state;
  const next = cloneState(state);
  next.gestureActive = false;
  next.catchingUp = false;
  next.lastFinger = null;
  const active = next.strokes[next.strokeIndex];
  if (!active || active.complete || active.stroke.kind === 'dot') return next;
  if (canComplete(active)) {
    completeStroke(next, active);
  }
  return next;
}

export function pointsToSvg(points: TracePoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

export function visualStrokePath(points: TracePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const closed = distance(points[0], points[points.length - 1]) < 0.6;
  const pts = closed ? points.slice(0, -1) : points;
  const count = pts.length;
  if (count < 2) return `M ${points[0].x} ${points[0].y}`;

  const at = (index: number) => {
    if (closed) return pts[(index + count) % count];
    return pts[Math.max(0, Math.min(count - 1, index))];
  };

  let d = `M ${pts[0].x} ${pts[0].y}`;
  const last = closed ? count : count - 1;
  for (let i = 0; i < last; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export function arrowPoints(from: TracePoint, to: TracePoint, size = 4): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const left = {
    x: from.x + size * Math.cos(angle + Math.PI * 0.82),
    y: from.y + size * Math.sin(angle + Math.PI * 0.82),
  };
  const right = {
    x: from.x + size * Math.cos(angle - Math.PI * 0.82),
    y: from.y + size * Math.sin(angle - Math.PI * 0.82),
  };
  return `${to.x},${to.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

export function arrowTip(samples: TracePoint[]): TracePoint | null {
  if (samples.length < 2) return null;
  return samples[samples.length - 1];
}

export function directionArrow(samples: TracePoint[]): string | null {
  if (samples.length < 2) return null;
  const length = pathLength(samples);
  const from = pointAtLength(samples, Math.max(0, length - 7));
  const to = samples[samples.length - 1];
  if (distance(from, to) < 1) return null;
  return arrowPoints(from, to, 4.2);
}

export function samplesForProgress(samples: TracePoint[], progress: number): TracePoint[] {
  if (samples.length < 2 || progress <= 0) return [];
  if (progress >= 0.995) return samples;
  const total = pathLength(samples);
  const target = progress * total;
  const output: TracePoint[] = [samples[0]];
  let walked = 0;
  for (let i = 1; i < samples.length; i += 1) {
    const span = distance(samples[i - 1], samples[i]);
    if (walked + span >= target) {
      const t = span === 0 ? 0 : (target - walked) / span;
      output.push({
        x: samples[i - 1].x + (samples[i].x - samples[i - 1].x) * t,
        y: samples[i - 1].y + (samples[i].y - samples[i - 1].y) * t,
      });
      return output;
    }
    walked += span;
    output.push(samples[i]);
  }
  return output;
}

export function spacedPathDots(samples: TracePoint[], gap = 20): TracePoint[] {
  if (samples.length === 0) return [];
  const tip = arrowTip(samples);
  const dots: TracePoint[] = [];
  let last: TracePoint | null = null;
  for (const point of samples) {
    if (tip && distance(point, tip) < 9) continue;
    if (!last || distance(point, last) >= gap) {
      dots.push(point);
      last = point;
    }
  }
  return dots;
}

export function remainingGuideDots(samples: TracePoint[], progress: number, complete: boolean, gap = 18): TracePoint[] {
  if (complete || progress >= 0.995 || samples.length === 0) return [];
  const tip = arrowTip(samples);
  const total = pathLength(samples);
  const tracedUntil = progress <= 0 ? -1 : total * progress;
  const dots: TracePoint[] = [];
  let last: TracePoint | null = null;
  let walked = 0;
  for (let i = 0; i < samples.length; i += 1) {
    if (i > 0) walked += distance(samples[i - 1], samples[i]);
    if (i === 0) continue;
    if (tracedUntil >= 0 && walked <= tracedUntil) continue;
    if (tip && distance(samples[i], tip) < 10) continue;
    if (!last || distance(samples[i], last) >= gap) {
      dots.push(samples[i]);
      last = samples[i];
    }
  }
  return dots;
}
