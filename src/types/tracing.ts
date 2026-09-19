export type TracePoint = {
  x: number;
  y: number;
};

export type LetterCase = 'uppercase' | 'lowercase';

export type TraceStroke = {
  id: string;
  kind: 'path' | 'dot';
  points: TracePoint[];
};

export type TraceLetter = {
  id: string;
  character: string;
  letterCase: LetterCase;
  strokes: TraceStroke[];
};

export const TRACE_VIEWBOX = {
  width: 100,
  height: 130,
} as const;
