import * as core from './core.js'
// TODO:
//
//  - assignments to self (x = x) turn into no-ops
//  - constant folding
//  - Conditionals with constant tests collapse into a single arm
//  - Unrolling loops
//  - Dead code elimination (if a variable is never read, it can be removed)
//  - Dead code elimination (if a loop is never entered, it can be removed)
//  - Dead code elimination (if a conditional has no statements, it can be removed)

export default function optimize(node) {
  return optimizers[node.constructor.name](node) ?? node
}

const truthy = (e) => ({
  [core.List]: (cond) => cond.length > 0,
  [core.Obj]: (cond) => cond.length > 0,
  [core.Str]: (cond) => cond.length > 0,
  [core.Num]: (cond) => cond !== 0,
  [core.Bool]: (cond) => cond,
  [core.Nil]: (_cond) => false,
}[e.constructor] ?? (() => undefined))(e.val)

const optimizers = {
  Block(b) {
    if (b.statements.length === 0) {
      return []
    } // TODO this might cause bugs - to test, optimize then run an empty block

    b.statements = b.statements.flatMap((statement) => optimize(statement))
    return b
  },
  VarDec(v) {
    v.exp = optimize(v.exp)
    return v
  },
  Assign(a) {
    if (a.exp instanceof core.Var && a.var.id === a.exp.id) {
      return []
    }

    a.exp = optimize(a.exp)
    return a
  },
  ReturnStatement(r) {
    r.exp = optimize(r.exp)
    return r
  },
  Ternary(t) {
    const trueBlock = t.block.statements > 0 ? optimize(t.block) : []
    const falseBlock = t.alt ? optimize(t.alt) : []
    const trueCond = truthy(t.cond)
    return trueCond ? trueBlock : trueCond === undefined ? t : falseBlock
  },
  BinaryExp(b) {
    if (b.op === '.') {
      const left = b.left.constructor
      if (
        {
          nil: left === core.Nil,
          bool: left === core.Bool,
          num: left === core.Num,
          str: left === core.Str,
          obj: left === core.Obj,
          list: left === core.List,
        }[b.right]
      ) {
        return optimize(b.left)
      }

      if (b.right === 'loop' && truthy(b.left) === false) {
        return []
        // TODO loop unrolling
        // if the conditional returns true, DO NOT replace it with true (that will create an infinite loop)
      }
    }
    // TODO constant folding for ||, &&
    b.left = optimize(b.left)
    if (typeof b.right !== 'string') { 
      b.right = optimize(b.right)
    }
    return b
  },
  NaryExp(n) {
    // TODO equality comparisons with constants (remember that it's nary!)
    // TODO constant folding for +, -, *, /, %, **
    return n
  },
  UnaryExp(u) {
    return (
      {
        '!': () => {
          return (
            {
              [core.List]: () => new Bool(u.exp.val.length > 0),
              [core.Obj]: () => new Bool(u.exp.val.size > 0),
              [core.Str]: () => new Bool(u.exp.val.length > 0),
              [core.Num]: () => new Bool(u.exp.val !== 0),
              [core.Bool]: () => new Bool(!u.exp.val),
              [core.Nil]: () => new Bool(false),
            }[u.exp.constructor] ?? (() => u)
          )()
        },
        '-': () => {
          return (
            {
              [core.List]: () => new core.List(u.exp.val.reverse()),
              [core.Obj]: () => new core.Obj(u.exp.val.reverse()),
              [core.Str]: () => new core.Str([...u.exp].reverse().join('')),
              [core.Num]: () => new core.Num(-u.exp.val),
              [core.Bool]: () => new core.Bool(!u.exp.val),
            }[u.exp.constructor] ?? (() => u)
          )()
        },
        '...': () => {
          throw new Error('Spread operator not implemented')
        },
      }[u.op] ?? u
    )
  },
  Call(c) {
    c.id = optimize(c.id)

    if (
      [core.List, core.Obj, core.Str, core.Num, core.Bool, core.Nil].includes(
        c.id.constructor
      )
    ) {
      return c.id
    }

    c.args = optimize(c.args)
    return c
  },
  Var(v) {
    return v
  },
  VarSubscript(v) {
    return v
  },
  Subscription(s) {
    return s
  },
  Func(f) {
    f.block = optimize(f.block)
    return f
  },
  Params(p) {
    return p
  },
  KeywordParam(k) {
    return k
  },
  Args(a) {
    a.args = a.args.flatMap(optimize)
    return a
  },
  KeywordArg(k) {
    return k
  },
  Obj(o) {
    return o
  },
  ObjField(o) {
    return o
  },
  List(l) {
    return l
  },
  Str(s) {
    return s
  },
  FormattedStr(f) {
    return f
  },
  Num(n) {
    return n
  },
  Bool(b) {
    return b
  },
  MatchExp(m) {
    return m
  },
  MatchBlock(m) {
    return m
  },
  MatchCase(m) {
    return m
  },
  DefaultMatchCase(d) {
    return d
  },
  Nil(n) {
    return n
  },
  PostIncrement(p) {
    // TODO
    return p
  },
  PostDecrement(p) {
    // TODO
    return p
  },
  PreIncrement(p) {
    // TODO
    return p
  },
  PreDecrement(p) {
    // TODO
    return p
  },
  Array(a) {
    return a.map(optimize)
  },
}
