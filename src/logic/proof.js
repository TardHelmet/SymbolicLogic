// Proof checker for Hurley-style natural deduction.
//
// A proof is { premises: [ast], conclusion: ast, lines: [{ text, just }] }.
// Premises are lines 1..k. Students never indent: block structure comes
// from the justifications. ACP/AIP opens a block; CP/IP must cite exactly
// the innermost open block and closes it.

import * as A from './ast.js';
import { parseFormula } from './parser.js';
import { print } from './printer.js';
import {
  IMPLICATION, REPLACEMENT, OTHER, resolveRule, fitsImplication, diagnoseImplication,
  replacementCost, diagnoseReplacement, implicationOutputs,
} from './rules.js';

// Convention switches, pending confirmation against Hurley & Watson 13e.
export const DEFAULTS = {
  maxApps: Infinity,              // applications of one replacement rule per line
  ipDirect: false,                // may IP discharge ~A's assumption as A (skipping DN)?
  contradictionEitherOrder: true, // accept ~q • q as well as q • ~q to close IP
  allowedRules: null,             // restrict the rules an exercise may use
};

const STRUCTURAL = new Set(['ACP', 'AIP', 'CP', 'IP']);

// ---------------------------------------------------------------------------
// Justifications: "1, 2, MP", "MP 1 2", "3–5 CP", "ACP"

export function parseJustification(text) {
  const src = (text ?? '').trim().replace(/[–—‐−]/g, '-');
  if (!src) return { error: 'Give a justification: the line numbers and the rule, as in “1, 2, MP”.' };
  const refs = [];
  const words = [];
  const re = /(\d+)\s*-\s*(\d+)|(\d+)|([A-Za-z][A-Za-z.'’]*)|([,;\s]+)|(.)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1]) refs.push({ from: +m[1], to: +m[2] });
    else if (m[3]) refs.push({ from: +m[3], to: +m[3], single: true });
    else if (m[4]) words.push(m[4]);
    else if (m[6]) return { error: `Unexpected “${m[6]}” in the justification.` };
  }
  if (!words.length) return { error: 'Name the rule, as in “1, 2, MP”.' };
  const name = words.join('');
  if (/^(pr|prem|premise|p)$/i.test(name)) return { error: 'Premises are given at the top; new lines need a rule.' };
  const r = resolveRule(name);
  if (r.error) return { error: r.error + (r.suggestion ? ` Did you mean ${r.suggestion}?` : '') };
  return { rule: r.id, refs };
}

// ---------------------------------------------------------------------------

function substitutes(P, T, a, b, bound = new Set()) {
  if (P.type !== T.type) return -1;
  const pair = (p, t) => {
    if (p === t) return 0;
    if (p === a && t === b && !(A.isVar(a) && bound.has(a)) && !(A.isVar(b) && bound.has(b))) return 1;
    return -1;
  };
  switch (P.type) {
    case 'atom': {
      if (P.pred !== T.pred || P.terms.length !== T.terms.length) return -1;
      let n = 0;
      for (let i = 0; i < P.terms.length; i++) {
        const c = pair(P.terms[i], T.terms[i]);
        if (c < 0) return -1;
        n += c;
      }
      return n;
    }
    case 'eq': {
      const l = pair(P.left, T.left);
      const r = pair(P.right, T.right);
      return l < 0 || r < 0 ? -1 : l + r;
    }
    case 'all':
    case 'some': {
      if (P.v !== T.v) return -1;
      const had = bound.has(P.v);
      bound.add(P.v);
      const n = substitutes(P.body, T.body, a, b, bound);
      if (!had) bound.delete(P.v);
      return n;
    }
    default: {
      const pk = A.children(P);
      const tk = A.children(T);
      let n = 0;
      for (let i = 0; i < pk.length; i++) {
        const c = substitutes(pk[i], tk[i], a, b, bound);
        if (c < 0) return -1;
        n += c;
      }
      return n;
    }
  }
}

const mainOpName = (n) => ({
  all: 'a universal quantifier', some: 'an existential quantifier', not: 'a tilde', and: 'a dot',
  or: 'a wedge', imp: 'a horseshoe', iff: 'a triple bar', atom: 'nothing (it is atomic)', eq: 'nothing (it is atomic)',
}[n.type] ?? n.type);

function checkQuantifier(rule, [c], target, ctx) {
  const k = ctx.citedNos[0];
  switch (rule) {
    case 'UI': {
      if (c.type !== 'all') {
        const hint = c.type === 'not' && A.isQuant(c.arg) ? ' A negated quantifier must first be changed with CQ.' : '';
        return [`UI applies only to a line whose main operator is a universal quantifier; line ${k}'s main operator is ${mainOpName(c)}.${hint}`];
      }
      const cands = new Set([...A.allTerms(target), c.v]);
      let captured = null;
      for (const t of cands) {
        if (A.equal(A.subst(c.body, c.v, t), target)) {
          if (A.freeFor(c.body, c.v, t)) return [];
          captured = t;
        }
      }
      if (captured) return [`Instantiating ${c.v} to ${captured} here lets another quantifier capture ${captured}; choose a different variable or a name.`];
      return [`This line is not an instance of line ${k}. UI drops the quantifier and replaces every free ${c.v} in its scope with one and the same name or variable.`];
    }
    case 'EG': {
      if (target.type !== 'some') return ['EG produces a line whose main operator is an existential quantifier, such as (∃x)Fx.'];
      const cands = new Set([...A.allTerms(c), target.v]);
      for (const t of cands) {
        if (A.equal(A.subst(target.body, target.v, t), c) && A.freeFor(target.body, target.v, t)) return [];
      }
      return [`This line does not come from line ${k} by EG. EG replaces some or all occurrences of one name (or variable) with a variable bound by the new existential quantifier.`];
    }
    case 'EI': {
      if (c.type !== 'some') {
        const hint = c.type === 'not' && A.isQuant(c.arg) ? ' A negated quantifier must first be changed with CQ.' : '';
        return [`EI applies only to a line whose main operator is an existential quantifier; line ${k}'s main operator is ${mainOpName(c)}.${hint}`];
      }
      if (!A.freeVars(c.body).has(c.v) && A.equal(c.body, target)) return [];
      for (const t of new Set(A.allTerms(target))) {
        if (!A.equal(A.subst(c.body, c.v, t), target)) continue;
        if (A.isVar(t)) return ['EI must instantiate to a constant (a new name), never to a variable: “something is F” does not make every x F.'];
        const where = ctx.constantLine.get(t);
        if (where) return [`EI needs a name that is new to the proof, but ${t} already appears on line ${where}. Pick a letter not used so far.`];
        if (ctx.conclusionConsts.has(t)) return [`EI needs a name that does not appear in the conclusion, and ${t} does. Pick another letter.`];
        ctx.isEI = true;
        return [];
      }
      return [`This line is not an instance of line ${k}. EI drops the quantifier and replaces every free ${c.v} with one new name.`];
    }
    case 'UG': {
      if (target.type !== 'all') return ['UG produces a line whose main operator is a universal quantifier, such as (x)Fx.'];
      const x = target.v;
      const B = target.body;
      if (!A.freeVars(B).has(x) && A.equal(B, c)) return [];
      for (const y of new Set(['x', 'y', 'z', ...A.freeVars(c)])) {
        if (!A.equal(A.subst(B, x, y), c)) continue;
        if (y !== x && A.freeVars(B).has(y)) continue;
        if (!A.freeFor(B, x, y)) continue;
        const errs = [];
        for (const blk of ctx.openBlocks) {
          if (blk.formula && A.freeVars(blk.formula).has(y)) {
            errs.push(`UG cannot generalize on ${y} inside the indented sequence that begins on line ${blk.start}, because ${y} is free in that assumption: ${y} is not arbitrary there.`);
          }
        }
        for (const e of ctx.eiLines) {
          if (A.freeVars(e.formula).has(y)) {
            errs.push(`UG cannot generalize on ${y}: ${y} is free in line ${e.n}, which was obtained by EI, so ${y} is tied to that particular individual.`);
            break;
          }
        }
        return errs;
      }
      for (const a of A.constants(c)) {
        if (A.equal(A.subst(B, x, a), c)) {
          return [`UG generalizes on a variable, never on a constant: ${a} names one particular individual, and what holds of it need not hold of everything.`];
        }
      }
      return [`This line does not come from line ${k} by UG. UG replaces every free occurrence of one variable with the variable of the new universal quantifier.`];
    }
    default:
      return [];
  }
}

function checkIdentity(cited, target, ctx) {
  if (cited.length === 0) {
    if (target.type === 'eq' && target.left === target.right) return [];
    return ['Id with no cited lines yields only a self-identity, such as a = a.'];
  }
  if (cited.length === 1) {
    const cost = replacementCost('IdSym', cited[0], target);
    if (cost === 0) return ['This line is identical to the cited line.'];
    if (cost <= ctx.opts.maxApps) return [];
    return ['Id with one cited line is symmetry: from a = b infer b = a (the identity may sit anywhere in the line).'];
  }
  if (cited.length === 2) {
    for (const [E, P] of [[cited[0], cited[1]], [cited[1], cited[0]]]) {
      if (E.type !== 'eq') continue;
      if (substitutes(P, target, E.left, E.right) > 0) return [];
    }
    for (const [E, P] of [[cited[0], cited[1]], [cited[1], cited[0]]]) {
      if (E.type !== 'eq') continue;
      if (substitutes(P, target, E.right, E.left) > 0) {
        return [`Hurley’s substitution rule replaces the left-hand name of the identity with the right-hand one. Your identity runs the other way (${print(E)}); use Id on it first to get ${E.right} = ${E.left}.`];
      }
    }
    if (!cited.some((c) => c.type === 'eq')) return ['Substitution needs one cited line to be an identity, a = b.'];
    return ['This line does not come from the cited lines by substituting one name for the other.'];
  }
  return ['Id cites at most two lines.'];
}

function checkStep(rule, cited, target, ctx) {
  if (IMPLICATION[rule]) {
    const need = IMPLICATION[rule].premisePats.length;
    if (cited.length !== need) {
      return [`${rule} cites ${need === 1 ? 'one line' : 'two lines'} (${IMPLICATION[rule].premises.join(' and ')}).`];
    }
    return fitsImplication(rule, cited, target) ? [] : diagnoseImplication(rule, cited, target, ctx.citedNos);
  }
  if (REPLACEMENT[rule]) {
    if (cited.length !== 1) return [`${rule} is a rule of replacement: cite exactly one line.`];
    const cost = replacementCost(rule, cited[0], target);
    if (cost === 0) return [`This line is identical to line ${ctx.citedNos[0]}; the rule changes nothing.`];
    if (cost <= ctx.opts.maxApps) return [];
    if (cost < Infinity) return [`That takes ${cost} applications of ${rule}; in this exercise, apply it ${ctx.opts.maxApps === 1 ? 'once' : `at most ${ctx.opts.maxApps} times`} per line.`];
    return diagnoseReplacement(rule, cited[0], target);
  }
  if (['UI', 'UG', 'EI', 'EG'].includes(rule)) {
    if (cited.length !== 1) return [`${rule} cites exactly one line.`];
    return checkQuantifier(rule, cited, target, ctx);
  }
  if (rule === 'Id') return checkIdentity(cited, target, ctx);
  return [`${rule} cannot be used here.`];
}

function isContradiction(n, eitherOrder) {
  if (n.type !== 'and') return false;
  if (n.right.type === 'not' && A.equal(n.right.arg, n.left)) return true;
  return eitherOrder && n.left.type === 'not' && A.equal(n.left.arg, n.right);
}

// ---------------------------------------------------------------------------

export function checkProof({ premises, conclusion, lines }, options = {}) {
  // Options left undefined keep their defaults.
  const given = Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined && v !== null));
  const opts = { ...DEFAULTS, ...given };
  const out = [];
  const stack = []; // open blocks
  let blockId = 0;
  const constantLine = new Map();
  const eiLines = [];
  const conclusionConsts = A.constants(conclusion);
  const note = (formula, n) => {
    for (const c of A.constants(formula)) if (!constantLine.has(c)) constantLine.set(c, n);
  };

  premises.forEach((p, i) => {
    out.push({ n: i + 1, formula: p, text: print(p), just: 'Premise', rule: 'Premise', depth: 0, path: [], refs: [], errors: [], ok: true });
    note(p, i + 1);
  });

  lines.forEach((ln, k) => {
    const n = premises.length + k + 1;
    const info = { n, text: ln.text, just: ln.just ?? '', refs: [], errors: [], depth: stack.length, path: stack.map((b) => b.id) };
    out.push(info);

    if (typeof ln.text === 'string') {
      const parsed = parseFormula(ln.text);
      if (parsed.ok) info.formula = parsed.ast;
      else info.errors.push(`This formula can't be read: ${parsed.error.message}`);
    } else if (ln.text) {
      info.formula = ln.text;
    }
    if (info.formula && !info.text) info.text = print(info.formula);

    const j = parseJustification(info.just);
    if (j.error) {
      info.errors.push(j.error);
      info.ok = false;
      return;
    }
    info.rule = j.rule;
    info.refs = j.refs;
    if (opts.allowedRules && !opts.allowedRules.includes(j.rule)) {
      info.errors.push(`${j.rule} is not available in this exercise. Allowed: ${opts.allowedRules.join(', ')}.`);
    }

    if (j.rule === 'ACP' || j.rule === 'AIP') {
      if (j.refs.length) info.errors.push('An assumption cites no lines.');
      const blk = { id: ++blockId, start: n, kind: j.rule, formula: info.formula };
      stack.push(blk);
      info.depth = stack.length;
      info.path = stack.map((b) => b.id);
    } else if (j.rule === 'CP' || j.rule === 'IP') {
      const blk = stack.at(-1);
      if (!blk) {
        info.errors.push(`There is no open assumption for ${j.rule} to discharge. Begin an indented sequence with ${j.rule === 'CP' ? 'ACP' : 'AIP'}.`);
      } else {
        const r = j.refs;
        if (r.length !== 1 || r[0].from !== blk.start || r[0].to !== n - 1) {
          info.errors.push(`${j.rule} must cite the whole indented sequence: lines ${blk.start}–${n - 1}.`);
        }
        if (j.rule === 'CP' && blk.kind !== 'ACP') info.errors.push(`Line ${blk.start} was assumed for indirect proof (AIP); close it with IP.`);
        if (j.rule === 'IP' && blk.kind !== 'AIP') info.errors.push(`Line ${blk.start} was assumed for conditional proof (ACP); close it with CP.`);
        stack.pop();
        const assumption = out[blk.start - 1].formula;
        const last = out[n - 2]?.formula;
        if (info.formula && assumption && last) {
          if (j.rule === 'CP') {
            const want = A.imp(assumption, last);
            if (!A.equal(info.formula, want)) {
              info.errors.push(`CP yields a conditional whose antecedent is the assumption (line ${blk.start}) and whose consequent is the last line of the sequence (line ${n - 1}): ${print(want)}.`);
            }
          } else {
            if (!isContradiction(last, opts.contradictionEitherOrder)) {
              info.errors.push(`IP needs the indented sequence to end in a contradiction of the form q • ~q; line ${n - 1} is ${print(last)}.`);
            }
            const want = A.not(assumption);
            const direct = opts.ipDirect && assumption.type === 'not' && A.equal(info.formula, assumption.arg);
            if (!A.equal(info.formula, want) && !direct) {
              info.errors.push(`IP yields the negation of the assumption on line ${blk.start}: ${print(want)}.${assumption.type === 'not' ? ' Then use DN.' : ''}`);
            }
          }
        }
      }
      info.depth = stack.length;
      info.path = stack.map((b) => b.id);
    } else {
      const cited = [];
      const nos = [];
      for (const r of j.refs) {
        if (!r.single) { info.errors.push(`Only CP and IP cite a range of lines; ${j.rule} cites single lines.`); continue; }
        const m = r.from;
        if (m >= n) { info.errors.push(`Line ${n} cannot cite line ${m}: a line may cite only earlier lines.`); continue; }
        const target = out[m - 1];
        if (!target) { info.errors.push(`There is no line ${m}.`); continue; }
        const available = target.path.every((id, i) => info.path[i] === id);
        if (!available) {
          info.errors.push(`Line ${m} lies inside an indented sequence that has been closed, so it can no longer be used.`);
          continue;
        }
        if (!target.formula) { info.errors.push(`Line ${m} can't be read, so it can't be cited.`); continue; }
        cited.push(target.formula);
        nos.push(m);
      }
      if (info.formula && cited.length === j.refs.length && !info.errors.length) {
        const ctx = {
          opts, citedNos: nos, constantLine, conclusionConsts, eiLines,
          openBlocks: stack.map((b) => ({ start: b.start, formula: b.formula })),
        };
        info.errors.push(...checkStep(j.rule, cited, info.formula, ctx));
        if (ctx.isEI && !info.errors.length) eiLines.push({ n, formula: info.formula });
      }
    }
    if (info.formula) note(info.formula, n);
    info.ok = info.errors.length === 0;
  });

  // Flag lines that rest on a faulty line.
  for (const info of out) {
    if (!info.ok || info.rule === 'Premise') continue;
    for (const r of info.refs) {
      for (let m = r.from; m <= r.to; m++) {
        const dep = out[m - 1];
        if (dep && (!dep.ok || dep.dependsOn)) { info.dependsOn = m; break; }
      }
      if (info.dependsOn) break;
    }
  }

  const last = out.at(-1);
  const allOk = out.every((i) => i.ok);
  const bad = out.filter((i) => !i.ok).map((i) => i.n);
  const summary = bad.length
    ? `Line${bad.length > 1 ? 's' : ''} ${bad.length > 1 ? `${bad.slice(0, -1).join(', ')} and ${bad.at(-1)}` : bad[0]} ${bad.length > 1 ? 'need' : 'needs'} attention.`
    : null;
  const reached = lines.length > 0 && last.depth === 0 && last.formula && A.equal(last.formula, conclusion);
  const problems = [];
  for (const b of stack) problems.push(`The assumption on line ${b.start} is still open; discharge it with ${b.kind === 'ACP' ? 'CP' : 'IP'}.`);
  if (!reached && allOk && !stack.length) {
    const early = out.find((i) => i.rule !== 'Premise' && i.depth === 0 && i.formula && A.equal(i.formula, conclusion));
    problems.push(early
      ? `You reached the conclusion on line ${early.n}; the proof should end there.`
      : `The proof is not finished: the last line should be the conclusion, ${print(conclusion)}, outside any indented sequence.`);
  }
  if (summary) problems.unshift(summary);
  return { lines: out, complete: allOk && reached && !stack.length, problems };
}

// ---------------------------------------------------------------------------
// Parsing proofs written as text, for authors and the sandbox:
//   1. A ⊃ B
//   2. A          / B
//   3. B          1, 2, MP
// Formula and justification are separated by two or more spaces or a tab.

export function parseProofText(text) {
  const premises = [];
  const lines = [];
  let conclusion = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/^\s*\d+\s*[.)]?\s*/, '').replace(/[|│]/g, ' ').trimEnd();
    if (!line.trim()) continue;
    const [formula, ...rest] = line.trim().split(/\s{2,}|\t+/);
    const just = rest.join(' ').trim();
    if (!lines.length && (!just || just.startsWith('/'))) {
      const slash = line.indexOf('/');
      const body = (slash >= 0 ? line.slice(0, slash) : formula).trim();
      if (body) {
        const p = parseFormula(body);
        if (!p.ok) return { error: `Premise “${body}”: ${p.error.message}` };
        premises.push(p.ast);
      }
      if (slash >= 0) {
        const c = parseFormula(line.slice(slash + 1).trim());
        if (!c.ok) return { error: `Conclusion: ${c.error.message}` };
        conclusion = c.ast;
      }
    } else {
      lines.push({ text: formula, just });
    }
  }
  if (!conclusion) return { error: 'Mark the conclusion with “/” after the last premise.' };
  return { premises, conclusion, lines };
}

// ---------------------------------------------------------------------------
// Goal-directed hints, in tiers: strategy, then tactic.

export function currentGoal(proof, result) {
  let goal = proof.conclusion;
  const stack = [];
  for (const info of result.lines) {
    if (info.rule === 'ACP' || info.rule === 'AIP') stack.push(info);
    if ((info.rule === 'CP' || info.rule === 'IP') && stack.length) stack.pop();
  }
  for (const blk of stack) {
    if (blk.rule === 'AIP') return { kind: 'contradiction' };
    if (goal && goal.type === 'imp' && blk.formula && A.equal(goal.left, blk.formula)) goal = goal.right;
    else return { kind: 'unknown' };
  }
  return { kind: 'formula', goal };
}

export function strategyFor(goal) {
  switch (goal.type) {
    case 'imp': return `The goal ${print(goal)} is a conditional. Try conditional proof: assume the antecedent, ${print(goal.left)} (ACP), and aim for the consequent.`;
    case 'not': return `The goal ${print(goal)} is a negation. Try indirect proof: assume ${print(goal.arg)} (AIP) and derive a contradiction.`;
    case 'and': return `The goal ${print(goal)} is a conjunction. Derive each conjunct on its own line, then use Conj.`;
    case 'or': return `The goal ${print(goal)} is a disjunction. If you can derive ${print(goal.left)}, Add finishes it. Otherwise consider Impl or DM, or indirect proof.`;
    case 'iff': return `The goal ${print(goal)} is a biconditional. Derive both conditionals, conjoin them, and use Equiv.`;
    case 'all': return `The goal ${print(goal)} is universal. Derive an instance with a variable that is not tied to any assumption or EI name, then use UG.`;
    case 'some': return `The goal ${print(goal)} is existential. Derive an instance about some individual, then use EG.`;
    default: return `The goal ${print(goal)} is atomic. Find it in the premises: if it is a consequent, aim for the antecedent (MP); if it is a disjunct, aim for the negation of the other disjunct (DS).`;
  }
}

export function hints(proof, options = {}) {
  const result = checkProof(proof, options);
  const out = [];
  const bad = result.lines.find((l) => !l.ok);
  if (bad) out.push(`First fix line ${bad.n}.`);
  const g = currentGoal(proof, result);
  if (g.kind === 'contradiction') out.push('You are inside an indirect proof: aim for some formula and its negation, then join them with Conj.');
  else if (g.kind === 'formula') out.push(strategyFor(g.goal));

  // Tactics: rule applications on available lines that yield something new.
  const current = result.lines.at(-1)?.path ?? [];
  const avail = result.lines.filter((l) => l.ok && l.formula && l.path.every((id, i) => current[i] === id));
  const have = (f) => avail.some((l) => A.equal(l.formula, f));
  const tactics = [];
  for (const id of ['MP', 'MT', 'DS', 'HS', 'CD', 'Simp']) {
    const n = IMPLICATION[id].premisePats.length;
    for (let i = 0; i < avail.length; i++) {
      for (let j = 0; j < avail.length; j++) {
        if (n === 1 && j > 0) break;
        if (n === 2 && i >= j) continue;
        const cited = n === 1 ? [avail[i].formula] : [avail[i].formula, avail[j].formula];
        for (const o of implicationOutputs(id, cited)) {
          if (!have(o)) tactics.push(`Lines ${n === 1 ? avail[i].n : `${avail[i].n} and ${avail[j].n}`} fit ${id}, giving ${print(o)}.`);
        }
      }
    }
  }
  // Working backward from an atomic or other goal: where could it come from?
  if (g.kind === 'formula') {
    const goal = g.goal;
    for (const l of avail) {
      const f = l.formula;
      if (f.type === 'imp' && A.equal(f.right, goal) && !have(f.left)) {
        tactics.push(`Line ${l.n} has ${print(goal)} as its consequent: if you can get ${print(f.left)}, MP gives the goal.`);
        if (f.left.type === 'or') {
          const d = avail.find((m) => A.equal(m.formula, f.left.left) || A.equal(m.formula, f.left.right));
          if (d) tactics.push(`Line ${d.n} is a disjunct of ${print(f.left)}, so Add (with Com if needed) gives it.`);
        }
      }
      if (f.type === 'or' && (A.equal(f.right, goal) || A.equal(f.left, goal))) {
        const other = A.equal(f.right, goal) ? f.left : f.right;
        tactics.push(`Line ${l.n} is a disjunction containing ${print(goal)}: get ${print(A.not(other))} and use DS (with Com if needed).`);
      }
    }
  }
  out.push(...[...new Set(tactics)].slice(0, 3));
  return out;
}

export { OTHER, STRUCTURAL };
