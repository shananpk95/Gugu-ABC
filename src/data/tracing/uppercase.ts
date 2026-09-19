import type { TraceLetter, TracePoint, TraceStroke } from '@/types/tracing';

function p(x: number, y: number): TracePoint {
  return { x, y };
}

function path(id: string, points: TracePoint[]): TraceStroke {
  return { id, kind: 'path', points };
}

function letter(character: string, letterCase: TraceLetter['letterCase'], strokes: TraceStroke[]): TraceLetter {
  return {
    id: `${letterCase}-${character}`,
    character,
    letterCase,
    strokes,
  };
}

export const UPPERCASE_LETTERS: TraceLetter[] = [
  letter('A', 'uppercase', [
    path('a1', [p(50, 14), p(18, 112)]),
    path('a2', [p(50, 14), p(82, 112)]),
    path('a3', [p(32, 72), p(68, 72)]),
  ]),
  letter('B', 'uppercase', [
    path('b1', [p(22, 14), p(22, 112)]),
    path('b2', [p(22, 14), p(58, 14), p(74, 24), p(74, 44), p(58, 56), p(22, 56)]),
    path('b3', [p(22, 56), p(62, 56), p(80, 70), p(80, 96), p(62, 112), p(22, 112)]),
  ]),
  letter('C', 'uppercase', [
    path('c1', [
      p(80, 32),
      p(68, 16),
      p(46, 12),
      p(26, 24),
      p(18, 48),
      p(18, 78),
      p(26, 102),
      p(46, 114),
      p(68, 110),
      p(80, 94),
    ]),
  ]),
  letter('D', 'uppercase', [
    path('d1', [p(22, 14), p(22, 112)]),
    path('d2', [p(22, 14), p(54, 14), p(78, 32), p(84, 62), p(78, 94), p(54, 112), p(22, 112)]),
  ]),
  letter('E', 'uppercase', [
    path('e1', [p(24, 14), p(24, 112)]),
    path('e2', [p(24, 14), p(80, 14)]),
    path('e3', [p(24, 62), p(66, 62)]),
    path('e4', [p(24, 112), p(80, 112)]),
  ]),
  letter('F', 'uppercase', [
    path('f1', [p(24, 14), p(24, 112)]),
    path('f2', [p(24, 14), p(80, 14)]),
    path('f3', [p(24, 62), p(64, 62)]),
  ]),
  letter('G', 'uppercase', [
    path('g1', [
      p(80, 32),
      p(68, 16),
      p(46, 12),
      p(26, 24),
      p(18, 48),
      p(18, 78),
      p(26, 102),
      p(48, 114),
      p(70, 106),
      p(82, 86),
      p(82, 66),
      p(56, 66),
    ]),
  ]),
  letter('H', 'uppercase', [
    path('h1', [p(22, 14), p(22, 112)]),
    path('h2', [p(78, 14), p(78, 112)]),
    path('h3', [p(22, 62), p(78, 62)]),
  ]),
  letter('I', 'uppercase', [
    path('i1', [p(30, 14), p(70, 14)]),
    path('i2', [p(50, 14), p(50, 112)]),
    path('i3', [p(30, 112), p(70, 112)]),
  ]),
  letter('J', 'uppercase', [
    path('j1', [p(38, 14), p(82, 14)]),
    path('j2', [p(70, 14), p(70, 90), p(58, 112), p(34, 104)]),
  ]),
  letter('K', 'uppercase', [
    path('k1', [p(24, 14), p(24, 112)]),
    path('k2', [p(78, 14), p(24, 62)]),
    path('k3', [p(42, 50), p(80, 112)]),
  ]),
  letter('L', 'uppercase', [
    path('l1', [p(24, 14), p(24, 112)]),
    path('l2', [p(24, 112), p(80, 112)]),
  ]),
  letter('M', 'uppercase', [
    path('m1', [p(16, 112), p(16, 14)]),
    path('m2', [p(16, 14), p(50, 78)]),
    path('m3', [p(50, 78), p(84, 14)]),
    path('m4', [p(84, 14), p(84, 112)]),
  ]),
  letter('N', 'uppercase', [
    path('n1', [p(22, 112), p(22, 14)]),
    path('n2', [p(22, 14), p(78, 112)]),
    path('n3', [p(78, 112), p(78, 14)]),
  ]),
  letter('O', 'uppercase', [
    path('o1', [
      p(50, 12),
      p(28, 20),
      p(16, 42),
      p(16, 84),
      p(28, 108),
      p(50, 116),
      p(72, 108),
      p(84, 84),
      p(84, 42),
      p(72, 20),
      p(50, 12),
    ]),
  ]),
  letter('P', 'uppercase', [
    path('p1', [p(24, 14), p(24, 112)]),
    path('p2', [p(24, 14), p(62, 14), p(78, 26), p(78, 48), p(62, 62), p(24, 62)]),
  ]),
  letter('Q', 'uppercase', [
    path('q1', [
      p(50, 12),
      p(28, 20),
      p(16, 42),
      p(16, 80),
      p(28, 104),
      p(50, 112),
      p(72, 104),
      p(84, 80),
      p(84, 42),
      p(72, 20),
      p(50, 12),
    ]),
    path('q2', [p(60, 86), p(84, 116)]),
  ]),
  letter('R', 'uppercase', [
    path('r1', [p(24, 14), p(24, 112)]),
    path('r2', [p(24, 14), p(62, 14), p(78, 26), p(78, 48), p(62, 62), p(24, 62)]),
    path('r3', [p(50, 62), p(80, 112)]),
  ]),
  letter('S', 'uppercase', [
    path('s1', [
      p(76, 30),
      p(64, 16),
      p(42, 12),
      p(24, 24),
      p(24, 42),
      p(40, 54),
      p(62, 62),
      p(78, 76),
      p(76, 98),
      p(58, 114),
      p(34, 112),
      p(20, 96),
    ]),
  ]),
  letter('T', 'uppercase', [
    path('t1', [p(18, 14), p(82, 14)]),
    path('t2', [p(50, 14), p(50, 112)]),
  ]),
  letter('U', 'uppercase', [
    path('u1', [p(20, 14), p(20, 78), p(32, 108), p(50, 116), p(68, 108), p(80, 78), p(80, 14)]),
  ]),
  letter('V', 'uppercase', [
    path('v1', [p(16, 14), p(50, 112), p(84, 14)]),
  ]),
  letter('W', 'uppercase', [
    path('w1', [p(10, 14), p(28, 112), p(50, 46), p(72, 112), p(90, 14)]),
  ]),
  letter('X', 'uppercase', [
    path('x1', [p(20, 14), p(80, 112)]),
    path('x2', [p(80, 14), p(20, 112)]),
  ]),
  letter('Y', 'uppercase', [
    path('y1', [p(18, 14), p(50, 62)]),
    path('y2', [p(82, 14), p(50, 62)]),
    path('y3', [p(50, 62), p(50, 112)]),
  ]),
  letter('Z', 'uppercase', [
    path('z1', [p(20, 14), p(80, 14)]),
    path('z2', [p(80, 14), p(20, 112)]),
    path('z3', [p(20, 112), p(80, 112)]),
  ]),
];
