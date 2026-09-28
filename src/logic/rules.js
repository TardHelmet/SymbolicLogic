// Copi's nineteen rules (Introduction to Logic, 15th ed., §§9.2 and 9.6): nine
// elementary valid argument forms, or rules of inference, which apply to whole
// lines only, and ten rules of replacement, plus quantifier negation, which
// apply anywhere inside a line. The structural, quantifier and identity rules
// are checked in proof.js. Internal ids are short (MP, DM, CQ); `label` is
// Copi's abbreviation, shown to students. Hurley's system is the same without
// Absorption.

import * as A from './ast.js';
import { schema } from './parser.js';
import { print } from './printer.js';
import { match, instantiate } from './match.js';
import { isSentential, validity, equivalence, showRow } from './semantics.js';

const S = schema;

export const IMPLICATION = {
  MP: { name: 'Modus ponens', premises: ['p ⊃ q', 'p'], conclusion: 'q' },
  MT: { name: 'Modus tollens', premises: ['p ⊃ q', '~q'], conclusion: '~p' },
  HS: { name: 'Hypothetical syllogism', premises: ['p ⊃ q', 'q ⊃ r'], conclusion: 'p ⊃ r' },
  DS: { name: 'Disjunctive syllogism', premises: ['p ∨ q', '~p'], conclusion: 'q' },
  CD: { name: 'Constructive dilemma', premises: ['(p ⊃ q) • (r ⊃ s)', 'p ∨ r'], conclusion: 'q ∨ s' },
  Abs: { name: 'Absorption', premises: ['p ⊃ q'], conclusion: 'p ⊃ (p • q)' },
  Simp: { name: 'Simplification', premises: ['p • q'], conclusion: 'p' },
  Conj: { name: 'Conjunction', premises: ['p', 'q'], conclusion: 'p • q' },
  Add: { name: 'Addition', premises: ['p'], conclusion: 'p ∨ q' },
};

export const REPLACEMENT = {
  DM: { name: "De Morgan's rule", forms: [['~(p • q)', '~p ∨ ~q'], ['~(p ∨ q)', '~p • ~q']] },
  Com: { name: 'Commutativity', forms: [['p ∨ q', 'q ∨ p'], ['p • q', 'q • p']] },
  Assoc: { name: 'Associativity', forms: [['p ∨ (q ∨ r)', '(p ∨ q) ∨ r'], ['p • (q • r)', '(p • q) • r']] },
  Dist: { name: 'Distribution', forms: [['p • (q ∨ r)', '(p • q) ∨ (p • r)'], ['p ∨ (q • r)', '(p ∨ q) • (p ∨ r)']] },
  DN: { name: 'Double negation', forms: [['p', '~~p']] },
  Trans: { name: 'Transposition', forms: [['p ⊃ q', '~q ⊃ ~p']] },
  Impl: { name: 'Material implication', forms: [['p ⊃ q', '~p ∨ q']] },
  Equiv: { name: 'Material equivalence', forms: [['p ≡ q', '(p ⊃ q) • (q ⊃ p)'], ['p ≡ q', '(p • q) ∨ (~p • ~q)']] },
  Exp: { name: 'Exportation', forms: [['(p • q) ⊃ r', 'p ⊃ (q ⊃ r)']] },
  Taut: { name: 'Tautology', forms: [['p', 'p ∨ p'], ['p', 'p • p']] },
};

for (const r of Object.values(IMPLICATION)) {
  r.kind = 'implication';
  r.premisePats = r.premises.map(S);
  r.conclusionPat = S(r.conclusion);
  r.display = `${r.premises.join(', ')} ∴ ${r.conclusion}`;
}
for (const r of Object.values(REPLACEMENT)) {
  r.kind = 'replacement';
  r.formPats = r.forms.map(([l, rt]) => [S(l), S(rt)]);
  r.display = r.forms.map(([l, rt]) => `${l} :: ${rt}`);
}

// Change of quantifier. ?x stands for the bound variable, F for the body.
const F = A.meta('F');
REPLACEMENT.CQ = {
  kind: 'replacement',
  name: 'Change of quantifier',
  formPats: [
    [A.all('?x', F), A.not(A.some('?x', A.not(F)))],
    [A.some('?x', F), A.not(A.all('?x', A.not(F)))],
    [A.not(A.all('?x', F)), A.some('?x', A.not(F))],
    [A.not(A.some('?x', F)), A.all('?x', A.not(F))],
  ],
  display: ['(x)ℱx :: ~(∃x)~ℱx', '(∃x)ℱx :: ~(x)~ℱx', '~(x)ℱx :: (∃x)~ℱx', '~(∃x)ℱx :: (x)~ℱx'],
};
REPLACEMENT.CQ.name = 'Quantifier negation';

// Symmetry of identity, used when Id cites a single line.
export const ID_SYMMETRY = {
  kind: 'replacement',
  name: 'Identity (symmetry)',
  formPats: [[A.eq('?t', '?u'), A.eq('?u', '?t')]],
  display: ['a = b :: b = a'],
};

export const OTHER = {
  ACP: { kind: 'structural', name: 'Assumption for conditional proof' },
  AIP: { kind: 'structural', name: 'Assumption for indirect proof' },
  Asm: { kind: 'structural', name: 'Assumption, discharged by CP or IP' },
  CP: { kind: 'structural', name: 'Conditional proof' },
  IP: { kind: 'structural', name: 'Indirect proof' },
  UI: { kind: 'quantifier', name: 'Universal instantiation', display: '(x)ℱx ∴ ℱy  or  ℱa' },
  UG: { kind: 'quantifier', name: 'Universal generalization', display: 'ℱy ∴ (x)ℱx' },
  EI: { kind: 'quantifier', name: 'Existential instantiation', display: '(∃x)ℱx ∴ ℱa' },
  EG: { kind: 'quantifier', name: 'Existential generalization', display: 'ℱa  or  ℱy ∴ (∃x)ℱx' },
  Id: { kind: 'identity', name: 'Identity', display: ['ℱa, a = b ∴ ℱb  or  ℱb, a = b ∴ ℱa', 'ℱa, ~ℱb ∴ ~(a = b)', 'a = b ∴ b = a', '∴ a = a'] },
};

// Copi's abbreviations, as they appear in his proofs.
const LABELS = {
  MP: 'M.P.', MT: 'M.T.', HS: 'H.S.', DS: 'D.S.', CD: 'C.D.', Abs: 'Abs.', Simp: 'Simp.', Conj: 'Conj.', Add: 'Add.',
  DM: 'De M.', Com: 'Com.', Assoc: 'Assoc.', Dist: 'Dist.', DN: 'D.N.', Trans: 'Trans.', Impl: 'Impl.', Equiv: 'Equiv.',
  Exp: 'Exp.', Taut: 'Taut.', CQ: 'Q.N.',
  ACP: 'Assumption (C.P.)', AIP: 'Assumption (I.P.)', Asm: 'Assumption', CP: 'C.P.', IP: 'I.P.',
  UI: 'U.I.', UG: 'U.G.', EI: 'E.I.', EG: 'E.G.', Id: 'Id.',
};
for (const [id, label] of Object.entries(LABELS)) (IMPLICATION[id] ?? REPLACEMENT[id] ?? OTHER[id]).label = label;

/** Copi's abbreviation for a rule id. */
export const labelOf = (id) => LABELS[id] ?? id;

export const ALL_RULES = { ...IMPLICATION, ...REPLACEMENT, ...OTHER };

const ALIASES = {
  mp: 'MP', modusponens: 'MP',
  mt: 'MT', modustollens: 'MT',
  hs: 'HS', hypotheticalsyllogism: 'HS', hypsyl: 'HS',
  ds: 'DS', disjunctivesyllogism: 'DS', disjsyl: 'DS',
  cd: 'CD', constructivedilemma: 'CD',
  abs: 'Abs', absorption: 'Abs',
  simp: 'Simp', simplification: 'Simp',
  conj: 'Conj', conjunction: 'Conj',
  add: 'Add', addition: 'Add',
  dm: 'DM', dem: 'DM', demorgan: 'DM', demorgans: 'DM',
  com: 'Com', comm: 'Com', commutativity: 'Com',
  assoc: 'Assoc', association: 'Assoc', associativity: 'Assoc',
  dist: 'Dist', distribution: 'Dist',
  dn: 'DN', doublenegation: 'DN',
  trans: 'Trans', transposition: 'Trans', contra: 'Trans', contrap: 'Trans', contraposition: 'Trans',
  impl: 'Impl', mi: 'Impl', materialimplication: 'Impl',
  equiv: 'Equiv', me: 'Equiv', materialequivalence: 'Equiv',
  exp: 'Exp', exportation: 'Exp',
  taut: 'Taut', tautology: 'Taut',
  acp: 'ACP', aip: 'AIP', cp: 'CP', ip: 'IP',
  assumptioncp: 'ACP', asscp: 'ACP', assumptionip: 'AIP', assip: 'AIP',
  assumption: 'Asm', assume: 'Asm', asm: 'Asm', assum: 'Asm',
  ui: 'UI', ug: 'UG', ei: 'EI', eg: 'EG',
  cq: 'CQ', qn: 'CQ', changeofquantifier: 'CQ', quantifiernegation: 'CQ',
  id: 'Id', identity: 'Id',
};

function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

/** Resolve a typed rule name. Returns { id } or { error, suggestion }. */
export function resolveRule(text) {
  const k = text.toLowerCase().replace(/[\s.'’_-]/g, '');
  if (ALIASES[k]) return { id: ALIASES[k] };
  let best = null;
  for (const alias of Object.keys(ALIASES)) {
    const dist = editDistance(k, alias);
    if (!best || dist < best.dist) best = { dist, id: ALIASES[alias] };
  }
  const suggestion = best && best.dist <= 2 ? best.id : null;
  return { error: `“${text}” is not a rule name.`, suggestion };
}

// ---------------------------------------------------------------------------
// Rules of implication

function permutations(xs) {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

/** Does target follow from the cited lines (in any order) by rule id? */
export function fitsImplication(id, cited, target) {
  const rule = IMPLICATION[id];
  if (cited.length !== rule.premisePats.length) return false;
  for (const order of permutations(cited)) {
    let s = new Map();
    for (let i = 0; i < order.length && s; i++) s = match(rule.premisePats[i], order[i], s);
    if (s && match(rule.conclusionPat, target, s)) return true;
  }
  return false;
}

/** What the rule yields from the cited lines, when that is determined. */
export function implicationOutputs(id, cited) {
  const rule = IMPLICATION[id];
  if (cited.length !== rule.premisePats.length) return [];
  const out = [];
  for (const order of permutations(cited)) {
    let s = new Map();
    for (let i = 0; i < order.length && s; i++) s = match(rule.premisePats[i], order[i], s);
    if (!s) continue;
    const c = instantiate(rule.conclusionPat, s);
    if (c && !out.some((o) => A.equal(o, c))) out.push(c);
  }
  return out;
}

const FALLACIES = [
  {
    rule: 'MP', premises: ['p ⊃ q', 'q'], conclusion: 'p',
    say: 'This is affirming the consequent, a fallacy: from p ⊃ q and q, nothing follows about p. MP needs the antecedent, not the consequent.',
  },
  {
    rule: 'MT', premises: ['p ⊃ q', '~p'], conclusion: '~q',
    say: 'This is denying the antecedent, a fallacy: p ⊃ q and ~p leave q open. MT needs the negation of the consequent.',
  },
  {
    rule: 'Simp', premises: ['p • q'], conclusion: 'q',
    say: 'Simp yields only the left conjunct (so in Copi and in Hurley). Use Com first to move this conjunct to the left.',
  },
  {
    rule: 'DS', premises: ['p ∨ q', '~q'], conclusion: 'p',
    say: 'DS needs the negation of the left disjunct (so in Copi and in Hurley). Use Com on the disjunction first.',
  },
  {
    rule: 'DS', premises: ['p ∨ q', 'p'], conclusion: '~q',
    say: 'That reads “or” exclusively. The wedge is inclusive: p ∨ q and p are consistent with q.',
  },
  {
    rule: 'Add', premises: ['p'], conclusion: 'q ∨ p',
    say: 'Add places the new disjunct on the right (p / p ∨ q). Add first, then use Com.',
  },
  {
    rule: 'Abs', premises: ['p ⊃ q'], conclusion: 'p ⊃ (q • p)',
    say: 'Absorption puts the antecedent first in the new conjunction: from p ⊃ q, p ⊃ (p • q). Use Com on the consequent afterwards.',
  },
  {
    rule: 'HS', premises: ['p ⊃ q', 'p ⊃ r'], conclusion: 'q ⊃ r',
    say: 'HS chains conditionals: the consequent of one must be the antecedent of the other.',
  },
  {
    rule: 'MP', premises: ['p ⊃ q', '~p'], conclusion: '~q',
    say: 'This is denying the antecedent, and it is not MP: MP needs the antecedent itself.',
  },
].map((x) => ({ ...x, premisePats: x.premises.map(S), conclusionPat: S(x.conclusion) }));

function fitsPattern(p, cited, target) {
  if (cited.length !== p.premisePats.length) return false;
  for (const order of permutations(cited)) {
    let s = new Map();
    for (let i = 0; i < order.length && s; i++) s = match(p.premisePats[i], order[i], s);
    if (s && match(p.conclusionPat, target, s)) return true;
  }
  return false;
}

/** Explain why an implication-rule step fails. Returns an array of messages. */
export function diagnoseImplication(id, cited, target, lineNos = []) {
  const rule = IMPLICATION[id];
  const msgs = [];
  const fallacy = FALLACIES.find((p) => p.rule === id && fitsPattern(p, cited, target));
  if (fallacy) msgs.push(fallacy.say);

  // Missing double negation, on the output or on a premise.
  if (!fallacy) {
    if (fitsImplication(id, cited, A.not(A.not(target)))) {
      msgs.push(`${id} gives ${print(A.not(A.not(target)))} here. Write that line, then use DN.`);
    } else if (target.type === 'not' && target.arg.type === 'not' && fitsImplication(id, cited, target.arg.arg)) {
      msgs.push(`${id} gives ${print(target.arg.arg)} here, without the double negation.`);
    } else {
      for (let i = 0; i < cited.length; i++) {
        const swapped = cited.map((c, j) => (j === i ? A.not(A.not(c)) : c));
        if (fitsImplication(id, swapped, target)) {
          const where = lineNos[i] ? ` line ${lineNos[i]}` : '';
          msgs.push(`${id} would need ${print(A.not(A.not(cited[i])))}. Get it from${where} by DN first.`);
          break;
        }
      }
    }
  }

  // An implication rule used on part of a line.
  if (cited.length === 1 && !fallacy && partOfLine(id, cited[0], target)) {
    msgs.push('Rules of implication apply only to whole lines. To work inside a line you need a rule of replacement.');
  }

  const outs = implicationOutputs(id, cited).filter((o) => !A.equal(o, target));
  if (outs.length && !fallacy) {
    msgs.push(`${id} applied to ${lineNos.length ? `line${lineNos.length > 1 ? 's' : ''} ${lineNos.join(', ')}` : 'those lines'} gives ${outs.map((o) => print(o)).join(' or ')}.`);
  } else if (!outs.length && !fallacy && cited.length === rule.premisePats.length) {
    msgs.push(`The cited lines do not have the shape ${id} needs: ${rule.display}.`);
  }
  msgs.push(...semanticVerdict(cited, target, id));
  return dedupe(msgs);
}

function atSafe(n, path) {
  let cur = n;
  for (const i of path) {
    const kids = A.children(cur);
    if (i >= kids.length) return null;
    cur = kids[i];
  }
  return cur;
}

// Does target come from c by applying a one-premise rule to a proper part of c?
function partOfLine(id, c, target) {
  for (const [sub, path] of A.subformulas(c)) {
    if (!path.length) continue;
    const t = atSafe(target, path);
    if (!t || !A.equal(A.replaceAt(c, path, t), target)) continue;
    if (fitsImplication(id, [sub], t)) return true;
  }
  return false;
}

function dedupe(xs) {
  return [...new Set(xs)];
}

/** Would some other rule license this step? */
export function otherRules(cited, target) {
  const found = [];
  for (const id of Object.keys(IMPLICATION)) if (fitsImplication(id, cited, target)) found.push(id);
  if (cited.length === 1) {
    for (const id of Object.keys(REPLACEMENT)) {
      if (!A.equal(cited[0], target) && replacementCost(id, cited[0], target) < Infinity) found.push(id);
    }
  }
  return found;
}

// Truth-table verdict for sentential steps: follows-but-not-by-this-rule
// versus does-not-follow, with a counterexample row.
function semanticVerdict(cited, target, id) {
  if (![...cited, target].every(isSentential)) return [];
  const others = otherRules(cited, target).filter((r) => r !== id);
  if (others.length) return [`The step is valid, but by ${others.join(' or ')}, not ${id}.`];
  const v = validity(cited, target);
  if (v.valid) return ['The line does follow from the cited lines, but not in one step by this rule.'];
  return [`The line does not follow from the cited lines: when ${showRow(v.counterexamples[0])}, the cited lines are true and this line is false.`];
}

// ---------------------------------------------------------------------------
// Rules of replacement: minimum number of applications, anywhere in the line.

function sameLabel(s, t) {
  if (s.type !== t.type) return false;
  if (A.isQuant(s)) return s.v === t.v;
  return A.isBinary(s) || A.isUnary(s);
}

function costWith(rule, s, t, memo) {
  if (A.equal(s, t)) return 0;
  let row = memo.get(s);
  if (!row) { row = new Map(); memo.set(s, row); }
  if (row.has(t)) return row.get(t);
  row.set(t, Infinity); // guard; every recursive pair is strictly smaller anyway
  let best = Infinity;
  for (const [l, r] of rule.formPats) {
    for (const [x, y] of [[l, r], [r, l]]) {
      const sx = match(x, s);
      if (!sx) continue;
      const ty = match(y, t);
      if (!ty) continue;
      let total = 1;
      for (const [k, sv] of sx) {
        const tv = ty.get(k);
        if (typeof sv === 'string') {
          if (sv !== tv) { total = Infinity; break; }
          continue;
        }
        if (!tv) { total = Infinity; break; }
        total += costWith(rule, sv, tv, memo);
        if (total >= best) break;
      }
      best = Math.min(best, total);
    }
  }
  if (sameLabel(s, t)) {
    const sk = A.children(s);
    const tk = A.children(t);
    let total = 0;
    for (let i = 0; i < sk.length && total < best; i++) total += costWith(rule, sk[i], tk[i], memo);
    best = Math.min(best, total);
  }
  row.set(t, best);
  return best;
}

function ruleObject(id) {
  return id === 'IdSym' ? ID_SYMMETRY : REPLACEMENT[id];
}

/** Minimum applications of replacement rule id turning s into t (Infinity if impossible). */
export function replacementCost(id, s, t) {
  return costWith(ruleObject(id), s, t, new Map());
}

/** Every formula reachable from s by exactly one application of rule id. */
export function oneStep(id, s) {
  const rule = ruleObject(id);
  const out = [];
  for (const [sub, path] of A.subformulas(s)) {
    for (const [l, r] of rule.formPats) {
      for (const [x, y] of [[l, r], [r, l]]) {
        const sx = match(x, sub);
        if (!sx) continue;
        const res = instantiate(y, sx);
        if (!res) continue;
        const whole = A.replaceAt(s, path, res);
        if (!out.some((o) => A.equal(o, whole))) out.push(whole);
      }
    }
  }
  return out;
}

/** Explain why a replacement step fails. */
export function diagnoseReplacement(id, s, t) {
  if (A.equal(s, t)) return ['This line is identical to the cited line; the rule changes nothing here.'];
  const msgs = [];
  const others = Object.keys(REPLACEMENT).filter((r) => r !== id && replacementCost(r, s, t) < Infinity);
  if (others.length) {
    msgs.push(`That rewrite is valid, but it is ${others.join(' or ')}, not ${id}.`);
    return msgs;
  }
  // Two rules in sequence?
  outer: for (const r1 of Object.keys(REPLACEMENT)) {
    for (const mid of oneStep(r1, s)) {
      for (const r2 of Object.keys(REPLACEMENT)) {
        if (replacementCost(r2, mid, t) < Infinity) {
          msgs.push(`This takes two steps: ${r1} gives ${print(mid)}, then ${r2} gives your line. Write each step on its own line.`);
          break outer;
        }
      }
    }
  }
  if (id !== 'IdSym' && REPLACEMENT[id]) {
    const options = oneStep(id, s).slice(0, 3);
    if (options.length) msgs.push(`${id} applied to the cited line can give ${options.map((o) => print(o)).join('; or ')}.`);
    else msgs.push(`${id} does not apply anywhere in the cited line. Its forms: ${REPLACEMENT[id].display.join('; ')}.`);
  }
  if (isSentential(s) && isSentential(t)) {
    const e = equivalence(s, t);
    msgs.push(e.equivalent
      ? 'The two lines are logically equivalent, but not by a single use of this rule.'
      : `The two lines are not even equivalent: when ${showRow(e.row)}, the cited line is ${e.values[0] ? 'true' : 'false'} and yours is ${e.values[1] ? 'true' : 'false'}.`);
  }
  return dedupe(msgs);
}

// ---------------------------------------------------------------------------
// Directions of the rules that an intuitionist rejects (the lesson on intuitionism). Each entry
// is a rule and the direction [from, to] as schema strings.

export const INTUITIONISTICALLY_REJECTED = [
  { rule: 'DN', from: '~~p', to: 'p' },
  { rule: 'DM', from: '~(p • q)', to: '~p ∨ ~q' },
  { rule: 'Impl', from: 'p ⊃ q', to: '~p ∨ q' },
  { rule: 'Trans', from: '~q ⊃ ~p', to: 'p ⊃ q' },
  { rule: 'Equiv', from: 'p ≡ q', to: '(p • q) ∨ (~p • ~q)' },
].map((x) => ({ ...x, fromPat: S(x.from), toPat: S(x.to) }));
