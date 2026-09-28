// Tokenizer for formulas written in Copi's notation (Hurley's is the same), with generous ASCII and
// modern-notation aliases. The tokenizer never guesses at structure; all
// disambiguation happens in the parser.

export const GLYPH = {
  copi: { not: '~', and: '•', or: '∨', imp: '⊃', iff: '≡', box: '□', dia: '◇', some: '∃', all: '' },
  // Principia Mathematica, as Langer writes it: a dot for "and", and dots as brackets.
  principia: { not: '~', and: '.', or: '∨', imp: '⊃', iff: '≡', box: '□', dia: '◇', some: '∃', all: '' },
  modern: { not: '¬', and: '∧', or: '∨', imp: '→', iff: '↔', box: '□', dia: '◇', some: '∃', all: '∀' },
};
GLYPH.hurley = GLYPH.copi;

/** The notations: 'copi' (Hurley's is the same), 'principia', 'modern'. */
export function normalizeNotation(n) {
  return n === 'modern' || n === 'principia' ? n : 'copi';
}

// Multi-character aliases, longest first.
const MULTI = [
  ['<->', 'IFF'], ['<=>', 'IFF'], ['->', 'IF'], ['=>', 'IF'], ['==', 'IFF'],
  ['!=', 'NEQ'], ['[]', 'BOX'], ['<>', 'DIA'], ['/∴', 'SEP'], ['//', 'SEP'], ['\\/', 'OR'], ['/\\', 'AND'],
];

const SINGLE = {
  '~': 'NOT', '¬': 'NOT', '∼': 'NOT', '˜': 'NOT', '-': 'NOT', '!': 'NOT',
  '•': 'AND', '·': 'AND', '⋅': 'AND', '∙': 'AND', '∧': 'AND', '&': 'AND', '*': 'AND', '^': 'AND', '.': 'AND',
  '∨': 'OR', '|': 'OR',
  '⊃': 'IF', '→': 'IF', '⇒': 'IF', '>': 'IF',
  '≡': 'IFF', '↔': 'IFF', '⇔': 'IFF',
  '=': 'EQ', '≠': 'NEQ',
  '□': 'BOX', '◻': 'BOX', '☐': 'BOX',
  '◇': 'DIA', '◊': 'DIA', '♢': 'DIA',
  '∃': 'EX', '∀': 'ALL',
  '(': 'OPEN', '[': 'OPEN', '{': 'OPEN',
  ')': 'CLOSE', ']': 'CLOSE', '}': 'CLOSE',
  ',': 'COMMA',
  '/': 'SEP', '∴': 'SEP', '⊢': 'SEP', ':': 'SEP',
};

export const MATCHING = { '(': ')', '[': ']', '{': '}' };

export const BINOP_KINDS = new Set(['AND', 'OR', 'IF', 'IFF']);
export const KIND_TO_TYPE = { AND: 'and', OR: 'or', IF: 'imp', IFF: 'iff' };

export class ParseError extends Error {
  constructor(message, pos, end, extra = {}) {
    super(message);
    this.pos = pos;
    this.end = end ?? pos + 1;
    Object.assign(this, extra);
  }
}

export function tokenize(input) {
  const src = input.normalize('NFC');
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }

    const multi = MULTI.find(([s]) => src.startsWith(s, i));
    if (multi) {
      tokens.push({ kind: multi[1], text: multi[0], pos: i, end: i + multi[0].length });
      i += multi[0].length;
      continue;
    }
    if (/[A-Z]/.test(ch)) {
      tokens.push({ kind: 'UPPER', text: ch, value: ch, pos: i, end: i + 1 });
      i++;
      continue;
    }
    if (/[xyz]/.test(ch)) {
      // Variables may carry a subscript (x1, x₁) or primes (x′) when x, y, z run out.
      const m = /^[xyz](?:[0-9₀-₉]+|['′]+)?/.exec(src.slice(i));
      const value = m[0].replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080)).replace(/′/g, "'");
      tokens.push({ kind: 'LOWER', text: m[0], value, pos: i, end: i + m[0].length });
      i += m[0].length;
      continue;
    }
    if (/[a-z]/.test(ch)) {
      // Lowercase v is always the wedge, as in Copi and Hurley.
      tokens.push(ch === 'v'
        ? { kind: 'OR', text: ch, pos: i, end: i + 1 }
        : { kind: 'LOWER', text: ch, value: ch, pos: i, end: i + 1 });
      i++;
      continue;
    }
    const kind = SINGLE[ch];
    if (!kind) {
      throw new ParseError(`“${ch}” is not a symbol of this notation.`, i, i + 1);
    }
    tokens.push({ kind, text: ch, pos: i, end: i + 1 });
    i++;
  }
  tokens.push({ kind: 'EOF', text: '', pos: src.length, end: src.length });
  return tokens;
}
