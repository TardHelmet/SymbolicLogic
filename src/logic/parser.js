// Recursive-descent parser for Hurley notation.
//
// Grammar (binary connectives have no precedence: at most one unbracketed
// binary connective per level, as Hurley requires):
//
//   argument ::= [formula {',' formula}] SEP formula
//   formula  ::= unary [BINOP unary]
//   unary    ::= NOT unary | quant unary | BOX unary | DIA unary | primary
//   quant    ::= '(' VAR ')' | '(' (∃|∀) VAR ')' | '(' 'E' VAR ')' <if a formula follows>
//              | (∃|∀) VAR
//   primary  ::= PRED {term} | term '=' term | term '≠' term | '(' formula ')'
//
// '(Ex)' is read as a quantifier exactly when a formula begins right after
// the ')'. The tokens that can begin a formula and the tokens that can follow
// a complete one are disjoint, so this is decided by one token of lookahead
// and is never a guess.

import * as A from './ast.js';
import { tokenize, ParseError, MATCHING, BINOP_KINDS, KIND_TO_TYPE } from './notation.js';
import { print } from './printer.js';

const FIRST = new Set(['NOT', 'OPEN', 'UPPER', 'LOWER', 'EX', 'ALL', 'BOX', 'DIA']);
const META_LETTERS = new Set(['p', 'q', 'r', 's']);
const OP_GLYPH = { AND: '•', OR: '∨', IF: '⊃', IFF: '≡' };

class Parser {
  constructor(text, opts = {}) {
    this.text = text;
    this.opts = opts;
    this.toks = tokenize(text);
    this.i = 0;
  }

  peek(k = 0) { return this.toks[Math.min(this.i + k, this.toks.length - 1)]; }
  next() { return this.toks[this.i++]; }

  error(msg, tok = this.peek(), extra) {
    throw new ParseError(msg, tok.pos, tok.end, extra);
  }

  isVarTok(t) { return t.kind === 'LOWER' && A.isVar(t.value); }
  isMetaTok(t) { return this.opts.schema && t.kind === 'LOWER' && META_LETTERS.has(t.value); }

  formula() {
    const left = this.unary();
    if (!BINOP_KINDS.has(this.peek().kind)) return left;
    const opTok = this.next();
    const right = this.unary();
    if (BINOP_KINDS.has(this.peek().kind)) this.chainError(left, opTok, right);
    return A.binary(KIND_TO_TYPE[opTok.kind], left, right);
  }

  chainError(left, op1, right) {
    const op2 = this.next();
    const third = this.unary();
    const t1 = KIND_TO_TYPE[op1.kind];
    const t2 = KIND_TO_TYPE[op2.kind];
    const a = print(A.binary(t2, A.binary(t1, left, right), third));
    const b = print(A.binary(t1, left, A.binary(t2, right, third)));
    let msg = `Two connectives (${OP_GLYPH[op1.kind]} and ${OP_GLYPH[op2.kind]}) share one level. ` +
      'Add brackets to say which one is the main operator.';
    if (op1.kind === op2.kind && (op1.kind === 'AND' || op1.kind === 'OR')) {
      msg += ' The two bracketings are different formulas; the rule Assoc is what relates them.';
    }
    throw new ParseError(msg, op2.pos, op2.end, { suggestions: [a, b] });
  }

  unary() {
    const t = this.peek();
    switch (t.kind) {
      case 'NOT':
        this.next();
        return A.not(this.unary());
      case 'BOX':
      case 'DIA':
        if (!this.opts.modal) this.error('□ and ◇ belong to modal logic, introduced in Part III.');
        this.next();
        return A.unary(t.kind === 'BOX' ? 'box' : 'dia', this.unary());
      case 'EX':
      case 'ALL': {
        this.next();
        const v = this.peek();
        if (!this.isVarTok(v)) this.error('A quantifier must bind a variable: x, y or z.', v);
        this.next();
        return A.quant(t.kind === 'EX' ? 'some' : 'all', v.value, this.unary());
      }
      case 'OPEN':
        return this.open();
      case 'UPPER':
        return this.atom();
      case 'LOWER':
        if (this.isMetaTok(t)) { this.next(); return A.meta(t.value); }
        return this.identity();
      case 'EOF':
        return this.error('The formula ends too soon: a formula is missing here.', t, this.danglingV());
      case 'CLOSE':
        return this.error('A closing bracket appears where a formula should begin.');
      default:
        if (BINOP_KINDS.has(t.kind)) {
          return this.error(`“${t.text}” connects two formulas, but there is no formula before it.`);
        }
        return this.error(`Unexpected “${t.text}”.`);
    }
  }

  // Hint for "Fv"-style input, where lowercase v was meant as a constant.
  danglingV() {
    const prev = this.toks[this.i - 1];
    const before = this.toks[this.i - 2];
    if (prev && prev.kind === 'OR' && prev.text === 'v' && before && before.end === prev.pos) {
      return { hint: 'Lowercase “v” is always the wedge (∨). Individual constants are a–u and w.' };
    }
    return {};
  }

  open() {
    const [t1, t2, t3, t4] = [this.peek(1), this.peek(2), this.peek(3), this.peek(4)];
    const openTok = this.peek();

    // (x)
    if (this.isVarTok(t1) && t2.kind === 'CLOSE') {
      this.next(); this.next(); this.closeMatching(openTok);
      return A.all(t1.value, this.unary());
    }
    // (∃x) / (∀x)
    if ((t1.kind === 'EX' || t1.kind === 'ALL') && t3.kind === 'CLOSE') {
      if (!this.isVarTok(t2)) this.error('A quantifier must bind a variable: x, y or z.', t2);
      this.next(); this.next(); this.next(); this.closeMatching(openTok);
      return A.quant(t1.kind === 'EX' ? 'some' : 'all', t2.value, this.unary());
    }
    // (Ex) followed by a formula: the ASCII existential quantifier.
    if (t1.kind === 'UPPER' && t1.value === 'E' && this.isVarTok(t2) && t3.kind === 'CLOSE' && FIRST.has(t4.kind)) {
      this.next(); this.next(); this.next(); this.closeMatching(openTok);
      return A.some(t2.value, this.unary());
    }
    // (a) — an attempt to quantify over a constant
    if (t1.kind === 'LOWER' && A.isConst(t1.value) && t2.kind === 'CLOSE' && FIRST.has(t3.kind)) {
      this.error('A quantifier binds a variable (x, y or z), not a constant.', t1);
    }

    this.next();
    const inner = this.formula();
    const close = this.peek();
    if (close.kind !== 'CLOSE') {
      if (FIRST.has(close.kind)) this.error('Two formulas sit side by side with no connective between them.', close);
      this.error('This bracket is never closed.', openTok);
    }
    this.closeMatching(openTok);
    if (inner.type === 'atom' && inner.terms.length === 0 && t2.kind === 'CLOSE' && FIRST.has(this.peek().kind)) {
      this.error('Quantifier variables are lowercase: x, y or z.', t1);
    }
    return inner;
  }

  closeMatching(openTok) {
    const close = this.peek();
    if (close.kind !== 'CLOSE') this.error('This bracket is never closed.', openTok);
    if (MATCHING[openTok.text] !== close.text) {
      this.error(`“${openTok.text}” is closed by “${close.text}”; brackets must match in kind.`, close);
    }
    this.next();
  }

  atom() {
    const pred = this.next();
    const terms = [];
    while (this.peek().kind === 'LOWER' && !this.isMetaTok(this.peek())) {
      terms.push(this.next().value);
    }
    return A.atom(pred.value, terms);
  }

  identity() {
    const left = this.next();
    const op = this.peek();
    if (op.kind !== 'EQ' && op.kind !== 'NEQ') {
      this.error(
        `“${left.value}” names an individual. An atomic formula starts with an uppercase letter, as in F${left.value}.`,
        left,
      );
    }
    this.next();
    const right = this.peek();
    if (right.kind !== 'LOWER') this.error('Identity relates two individuals, as in a = b.', right);
    this.next();
    const node = A.eq(left.value, right.value);
    return op.kind === 'NEQ' ? A.not(node) : node;
  }

  trailing() {
    const t = this.peek();
    if (t.kind === 'EQ') {
      this.error('“=” is identity between individuals (a = b). For “if and only if”, use ≡.', t);
    }
    if (t.kind === 'UPPER' && t.value === 'V') {
      this.error('Unexpected “V”. For “or”, use the wedge: lowercase v or ∨.', t);
    }
    if (t.kind === 'CLOSE') this.error('This closing bracket has no opening partner.', t);
    if (FIRST.has(t.kind)) this.error('Two formulas sit side by side with no connective between them.', t);
    this.error(`Unexpected “${t.text}” after a complete formula.`, t);
  }
}

function wrap(fn) {
  try {
    return fn();
  } catch (e) {
    if (e instanceof ParseError) {
      return {
        ok: false,
        error: { message: e.message, pos: e.pos, end: e.end, hint: e.hint, suggestions: e.suggestions },
      };
    }
    throw e;
  }
}

/**
 * Parse one formula.
 * opts.schema: p q r s are formula metavariables
 * opts.modal: allow □ and ◇
 * opts.closed: reject free variables
 */
export function parseFormula(text, opts = {}) {
  return wrap(() => {
    const p = new Parser(text, opts);
    if (p.peek().kind === 'EOF') p.error('Nothing to read yet.');
    const ast = p.formula();
    if (p.peek().kind !== 'EOF') p.trailing();
    const problem = checkFormula(ast, opts);
    if (problem) return { ok: false, error: problem };
    return { ok: true, ast };
  });
}

/** Parse "P1, P2, … / C". A conclusion alone ("/ C") is allowed. */
export function parseArgument(text, opts = {}) {
  return wrap(() => {
    const p = new Parser(text, opts);
    const premises = [];
    if (p.peek().kind !== 'SEP') {
      premises.push(p.formula());
      while (p.peek().kind === 'COMMA') { p.next(); premises.push(p.formula()); }
    }
    if (p.peek().kind !== 'SEP') p.error('Mark the conclusion with “/” (or ∴).');
    p.next();
    const conclusion = p.formula();
    if (p.peek().kind !== 'EOF') p.trailing();
    for (const f of [...premises, conclusion]) {
      const problem = checkFormula(f, opts);
      if (problem) return { ok: false, error: problem };
    }
    const arity = checkArity([...premises, conclusion]);
    if (arity) return { ok: false, error: arity };
    return { ok: true, premises, conclusion };
  });
}

/** Parse a comma-separated list of formulas. */
export function parseList(text, opts = {}) {
  return wrap(() => {
    const p = new Parser(text, opts);
    const items = [p.formula()];
    while (p.peek().kind === 'COMMA') { p.next(); items.push(p.formula()); }
    if (p.peek().kind !== 'EOF') p.trailing();
    for (const f of items) {
      const problem = checkFormula(f, opts);
      if (problem) return { ok: false, error: problem };
    }
    const arity = checkArity(items);
    if (arity) return { ok: false, error: arity };
    return { ok: true, items };
  });
}

function checkFormula(ast, opts) {
  if (opts.closed) {
    const free = [...A.freeVars(ast)];
    if (free.length) {
      return {
        message: `The variable ${free[0]} is free: every variable in a sentence must be bound by a quantifier.`,
        pos: 0, end: 0,
      };
    }
  }
  if (opts.letters) {
    const allowed = new Set(opts.letters);
    for (const [n] of A.subformulas(ast)) {
      if (n.type === 'atom' && !allowed.has(n.pred)) {
        return { message: `“${n.pred}” is not in this exercise's dictionary (${opts.letters.join(', ')}).`, pos: 0, end: 0 };
      }
    }
  }
  return checkArity([ast]);
}

/** Each letter must be used with one arity throughout. */
export function checkArity(asts) {
  const seen = new Map();
  for (const ast of asts) {
    for (const [n] of A.subformulas(ast)) {
      if (n.type !== 'atom') continue;
      const prev = seen.get(n.pred);
      if (prev !== undefined && prev !== n.terms.length) {
        const say = (k) => (k === 0 ? 'a statement letter' : `a ${k}-place predicate`);
        return {
          message: `“${n.pred}” is used both as ${say(prev)} and as ${say(n.terms.length)}.`,
          pos: 0, end: 0,
        };
      }
      seen.set(n.pred, n.terms.length);
    }
  }
  return null;
}

/** Parse or throw; for trusted content (rule schemas, course keys). */
export function f(text, opts = {}) {
  const r = parseFormula(text, opts);
  if (!r.ok) throw new Error(`Bad formula “${text}”: ${r.error.message}`);
  return r.ast;
}

/** Parse a schema: p q r s are metavariables. */
export function schema(text) {
  return f(text, { schema: true });
}
