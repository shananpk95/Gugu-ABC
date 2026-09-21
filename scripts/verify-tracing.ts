import { UPPERCASE_LETTERS } from '../src/data/tracing/uppercase';
import {
  beginTrace,
  createEngineState,
  endTrace,
  moveTrace,
  type TracingEngineState,
} from '../src/features/tracing/engine';
import type { TracePoint } from '../src/types/tracing';

function letter(character: string) {
  const found = UPPERCASE_LETTERS.find((item) => item.character === character);
  if (!found) throw new Error(`missing ${character}`);
  return found;
}

function lerp(a: TracePoint, b: TracePoint, t: number): TracePoint {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function along(state: TracingEngineState, strokeIndex: number, t: number): TracePoint {
  const samples = state.strokes[strokeIndex].samples;
  const start = samples[0];
  const end = samples[samples.length - 1];
  return lerp(start, end, t);
}

function drag(state: TracingEngineState, strokeIndex: number, from: number, to: number, steps: number) {
  let next = state;
  for (let i = 0; i <= steps; i += 1) {
    const t = from + ((to - from) * i) / steps;
    next = moveTrace(next, along(next, strokeIndex, t));
  }
  return next;
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const f = letter('F');
let state = createEngineState(f);
const s0 = state.strokes[0];

// TEST 1: tap 3rd visual-ish point
state = beginTrace(state, along(state, 0, 0.4));
state = moveTrace(state, along(state, 0, 0.4));
state = endTrace(state);
assert(!state.gestureActive, 'test1 gesture');
assert(state.strokes[0].progress === 0, `test1 progress ${state.strokes[0].progress}`);
assert(!state.strokes[0].complete, 'test1 complete');

// TEST 2: tap last
state = createEngineState(f);
state = beginTrace(state, along(state, 0, 1));
state = moveTrace(state, along(state, 0, 1));
state = endTrace(state);
assert(!state.strokes[0].complete, 'test2 complete');
assert(state.strokes[0].progress === 0, 'test2 progress');

// TEST 3: start and drag halfway
state = createEngineState(f);
state = beginTrace(state, along(state, 0, 0));
state = drag(state, 0, 0, 0.5, 20);
assert(state.strokes[0].progress > 0.35 && state.strokes[0].progress < 0.7, `test3 ${state.strokes[0].progress}`);
assert(!state.strokes[0].complete, 'test3 complete');

// TEST 4: full stroke
state = createEngineState(f);
state = beginTrace(state, along(state, 0, 0));
state = drag(state, 0, 0, 1, 30);
state = endTrace(state);
assert(state.strokes[0].complete, 'test4 stroke1');
assert(state.strokeIndex === 1, 'test4 active stroke2');

// TEST 5: backward
state = createEngineState(f);
state = beginTrace(state, along(state, 0, 0));
state = drag(state, 0, 0, 0.55, 18);
const mid = state.strokes[0].progress;
state = drag(state, 0, 0.55, 0, 12);
assert(state.strokes[0].progress <= mid + 0.02, `test5 ${state.strokes[0].progress} vs ${mid}`);
assert(!state.strokes[0].complete, 'test5 complete');

// TEST 6: jump start to end
state = createEngineState(f);
state = beginTrace(state, along(state, 0, 0));
state = moveTrace(state, along(state, 0, 1));
assert(state.strokes[0].progress < 0.2, `test6 ${state.strokes[0].progress}`);
assert(!state.strokes[0].complete, 'test6 complete');

// TEST 7: complete first of F, second becomes active
state = createEngineState(f);
state = beginTrace(state, along(state, 0, 0));
state = drag(state, 0, 0, 1, 30);
assert(state.strokeIndex === 1, 'test7');
assert(state.strokes[1].progress === 0, 'test7 stroke2 progress');
assert(!state.strokes[1].complete, 'test7 stroke2');

// TEST 8: cannot trace stroke 2 first
state = createEngineState(f);
const stroke2Start = state.strokes[1].samples[0];
const stroke2End = state.strokes[1].samples[state.strokes[1].samples.length - 1];
state = beginTrace(state, stroke2Start);
// F stroke2 start equals stroke1 start, so this MAY start stroke 1
state = beginTrace(createEngineState(f), lerp(stroke2Start, stroke2End, 0.6));
assert(state.strokes[1].progress === 0, 'test8 stroke2');
assert(!state.strokes[1].complete, 'test8 stroke2 complete');
assert(state.strokeIndex === 0, 'test8 still stroke1');

// TEST 9: all F strokes
state = createEngineState(f);
for (let index = 0; index < 3; index += 1) {
  state = beginTrace(state, along(state, index, 0));
  state = drag(state, index, 0, 1, 28);
  state = endTrace(state);
}
assert(state.letterComplete, 'test9 letter');
assert(state.strokes.every((stroke) => stroke.complete), 'test9 all strokes');

// TEST 10: reset
state = createEngineState(f);
assert(state.strokeIndex === 0 && state.strokes.every((stroke) => stroke.progress === 0), 'test10');

// TEST 11: lift mid-stroke then resume from progress (not first dot)
state = createEngineState(f);
state = beginTrace(state, along(state, 0, 0));
state = drag(state, 0, 0, 0.45, 18);
const paused = state.strokes[0].progress;
assert(paused > 0.3, `test11 paused ${paused}`);
state = endTrace(state);
assert(!state.gestureActive, 'test11 pause');
assert(Math.abs(state.strokes[0].progress - paused) < 0.001, 'test11 progress kept');
// Touching first dot again must NOT reset — should ask to continue / not activate from start
const afterWrongStart = beginTrace(state, along(state, 0, 0));
assert(afterWrongStart.strokes[0].progress === paused, 'test11 no reset on first-dot touch');
assert(!afterWrongStart.gestureActive, 'test11 not restarting at first dot');
// Resume near paused point
state = beginTrace(state, along(state, 0, paused));
assert(state.gestureActive, 'test11 resume active');
assert(Math.abs(state.strokes[0].progress - paused) < 0.02, `test11 resume progress ${state.strokes[0].progress}`);
state = drag(state, 0, paused, 1, 24);
state = endTrace(state);
assert(state.strokes[0].complete, 'test11 finish after resume');

console.log('tracing engine tests passed');
