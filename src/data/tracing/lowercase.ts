import type { TraceLetter, TracePoint, TraceStroke } from '@/types/tracing';

function p(x: number, y: number): TracePoint {
  return { x, y };
}

function path(id: string, points: TracePoint[]): TraceStroke {
  return { id, kind: 'path', points };
}

function dot(id: string, x: number, y: number): TraceStroke {
  return { id, kind: 'dot', points: [p(x, y)] };
}

function letter(character: string, strokes: TraceStroke[]): TraceLetter {
  return {
    id: `lowercase-${character}`,
    character,
    letterCase: 'lowercase',
    strokes,
  };
}

export const LOWERCASE_LETTERS: TraceLetter[] = [
  letter('a', [
    path('a1', [
      p(68, 48),
      p(56, 36),
      p(40, 36),
      p(28, 48),
      p(26, 66),
      p(36, 82),
      p(52, 86),
      p(66, 76),
      p(70, 58),
    ]),
    path('a2', [p(70, 40), p(70, 88)]),
  ]),
  letter('b', [
    path('b1', [p(28, 12), p(28, 88)]),
    path('b2', [p(28, 50), p(48, 38), p(66, 44), p(74, 60), p(68, 78), p(50, 88), p(28, 84)]),
  ]),
  letter('c', [
    path('c1', [p(72, 46), p(58, 36), p(40, 36), p(26, 50), p(26, 72), p(40, 86), p(58, 86), p(72, 74)]),
  ]),
  letter('d', [
    path('d1', [p(72, 12), p(72, 88)]),
    path('d2', [p(72, 50), p(52, 38), p(34, 44), p(26, 60), p(32, 78), p(50, 88), p(72, 84)]),
  ]),
  letter('e', [
    path('e1', [p(26, 62), p(72, 62), p(70, 44), p(52, 34), p(32, 42), p(26, 60), p(32, 80), p(52, 88), p(70, 78)]),
  ]),
  letter('f', [
    path('f1', [p(64, 22), p(52, 12), p(40, 18), p(38, 34), p(38, 92)]),
    path('f2', [p(24, 48), p(56, 48)]),
  ]),
  letter('g', [
    path('g1', [
      p(70, 42),
      p(54, 34),
      p(36, 38),
      p(28, 54),
      p(34, 72),
      p(52, 80),
      p(70, 72),
    ]),
    path('g2', [p(70, 36), p(70, 96), p(58, 116), p(36, 112)]),
  ]),
  letter('h', [
    path('h1', [p(28, 12), p(28, 90)]),
    path('h2', [p(28, 50), p(48, 38), p(66, 46), p(70, 60), p(70, 90)]),
  ]),
  letter('i', [path('i1', [p(50, 40), p(50, 88)]), dot('i2', 50, 22)]),
  letter('j', [
    path('j1', [p(58, 40), p(58, 96), p(46, 116), p(30, 108)]),
    dot('j2', 58, 22),
  ]),
  letter('k', [
    path('k1', [p(30, 12), p(30, 90)]),
    path('k2', [p(68, 40), p(30, 60)]),
    path('k3', [p(46, 54), p(70, 90)]),
  ]),
  letter('l', [path('l1', [p(48, 12), p(48, 90)])]),
  letter('m', [
    path('m1', [p(18, 88), p(18, 42)]),
    path('m2', [p(18, 52), p(34, 38), p(48, 52), p(48, 88)]),
    path('m3', [p(48, 52), p(64, 38), p(80, 52), p(80, 88)]),
  ]),
  letter('n', [
    path('n1', [p(28, 88), p(28, 42)]),
    path('n2', [p(28, 52), p(48, 38), p(66, 50), p(68, 88)]),
  ]),
  letter('o', [
    path('o1', [
      p(50, 36),
      p(32, 42),
      p(24, 58),
      p(30, 78),
      p(50, 88),
      p(70, 78),
      p(76, 58),
      p(68, 42),
      p(50, 36),
    ]),
  ]),
  letter('p', [
    path('p1', [p(28, 40), p(28, 118)]),
    path('p2', [p(28, 48), p(50, 36), p(68, 44), p(74, 60), p(66, 78), p(48, 86), p(28, 80)]),
  ]),
  letter('q', [
    path('q1', [p(72, 40), p(72, 118)]),
    path('q2', [p(72, 48), p(50, 36), p(32, 44), p(26, 60), p(34, 78), p(52, 86), p(72, 80)]),
  ]),
  letter('r', [
    path('r1', [p(32, 88), p(32, 42)]),
    path('r2', [p(32, 52), p(50, 38), p(68, 44)]),
  ]),
  letter('s', [
    path('s1', [
      p(68, 44),
      p(54, 34),
      p(36, 38),
      p(30, 50),
      p(42, 58),
      p(60, 64),
      p(70, 76),
      p(58, 88),
      p(38, 88),
      p(28, 76),
    ]),
  ]),
  letter('t', [
    path('t1', [p(48, 16), p(48, 78), p(56, 90), p(70, 84)]),
    path('t2', [p(32, 40), p(64, 40)]),
  ]),
  letter('u', [
    path('u1', [p(28, 40), p(28, 70), p(40, 86), p(56, 86), p(68, 70), p(68, 40)]),
    path('u2', [p(68, 70), p(68, 88)]),
  ]),
  letter('v', [path('v1', [p(24, 40), p(50, 88), p(76, 40)])]),
  letter('w', [path('w1', [p(14, 40), p(30, 88), p(50, 50), p(70, 88), p(86, 40)])]),
  letter('x', [
    path('x1', [p(26, 40), p(72, 88)]),
    path('x2', [p(72, 40), p(26, 88)]),
  ]),
  letter('y', [
    path('y1', [p(26, 40), p(50, 78)]),
    path('y2', [p(74, 40), p(50, 78), p(36, 116)]),
  ]),
  letter('z', [
    path('z1', [p(26, 40), p(72, 40)]),
    path('z2', [p(72, 40), p(26, 88)]),
    path('z3', [p(26, 88), p(72, 88)]),
  ]),
];
