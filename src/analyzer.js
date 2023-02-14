import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const bangGrammar = ohm.grammar(fs.readFileSync("src/bang.ohm"))
const d = { LIST: 'list', OBJ: 'object', STR: 'string', NUM: 'number', BOOL: 'boolean', NIL: 'nil', FUNC: 'function' }

// TODO: function to get type

function check(condition, message, node) {
  if (!condition) core.error(message, node)
}

function checkNotType(e, types) {
  const t = e?.type
  check(!types.includes(t), `Unexpected type ${t}`)
}

function checkSameTypes(e0, e1) {
  const [t0, t1] = [e0?.type, e1?.type]
  check(t0 === t1, `${t0} can never be equal to ${t1}`)
}

function isVar(e) {
  return e instanceof core.Var
}

function isList(e) {
  return e.type === d.LIST
}

function isObj(e) {
  return e.type === d.OBJ
}

function isStr(e) {
  return e.type === d.STR
}

function isNum(e) {
  return e.type === d.NUM
}

function isBool(e) {
  return e.type === d.BOOL
}

// TODO: is this needed?
function isNil(e) {
  return e.type === d.NIL
}

function isFunc(e) {
  return e.type === d.FUNC
}

function checkType(e, types) {
  check(types.includes(e?.type), `Unexpected type ${e?.type}`)
}

// function checkNotUndefined(e, name) {
//   check(e, `Variable may not have been initialized`)
// }

function checkNotLiteral(e) {
  const lits = [core.Str, core.Num, core.Bool, core.Nil]
  check(!lits.some(l => e instanceof l), 'Cannot mutate a literal')
}

function checkInBlock(context) {
  check(context.function, 'Cannot return outside a function')
}

// function checkBool(e) {
//   check(e.type.constructor === core.BoolType, 'Expected boolean')
// }

// function checkNum(e) {
//   check(e.type.constructor === core.NumType, 'Expected number')
// }

// function isList(e) {
//   return e.type.constructor === core.ListType
// }

// function isVar(e) {
//   return e.constructor === core.Var
// }

function coerceToBool(e) {
  return new core.Bool(!e?.equals(e?.default))
}

function mapOps(elements) {
  return elements.reduce(
    (map, val, i) => (typeof val === 'string' ? { ...map, [val]: [elements[i - 1], elements[i + 1]] } : map),
    {}
  )
}

// function isPreIncrement(e) {
//   return e instanceof core.UnaryExp
//     && e.op === '++'
//     && !e.postOp
// }

// function isPreDecrement(e) {
//   return e instanceof core.UnaryExp
//     && e.op === '--'
//     && !e.postOp
// }

// TODO: should be able to say break from inside a block that's nested in a loop
// TODO: should be able to say return from inside a loop that's nested in a block
class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, block: b = null }) {
    Object.assign(this, { parent, locals, inLoop, block: b })
  }

  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }

  lookup(name) {
    const entity = this.locals.get(name)
    return entity ? entity : this.parent?.lookup(name)
  }

  add(name, entity) {
    // check(
    //   !(!entity.local && entity.readOnly && this.locals.has(name)), 
    //   `Cannot assign to constant variable ${name}`, 
    //   node
    // )
    if (!entity.local && this.lookup(name)?.readOnly) {
      core.error(`Cannot assign to constant variable ${name}`)
    }
    // entity.local ? `_${name}` : name
    this.locals.set(name, entity)
    // return entity
  }

  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  }
}

export default function analyze(sourceCode) {
  let context = new Context({})

  const analyzer = bangGrammar.createSemantics().addOperation("rep", {
    Program(body) {
      return body.rep()
    },
    Block(_n0, statements, statement, _n1) {
      return new core.Block([...(statements.rep()), ...statement.rep()])
    },
    StatementNewLine(statement, _space, _n) {
      return statement.rep()
    },
    Statement_varDec(local, readOnly, id, op, exp) {
      let [e, o] = [exp.rep(), op.sourceString]
      let v

      if (op.sourceString === '=') {
        v = new core.Var(
          id.sourceString,
          local.sourceString === 'local',
          readOnly.sourceString === 'const',
          e.type ?? e.exp?.type
        )
        context.add(id.sourceString, v)
      } else {
        // Designed to only get here if variable dec is using an eval assignment
        v = id.rep()
        if (!v) {
          v = new core.Var(
            id.sourceString,
            local.sourceString === 'local',
            readOnly.sourceString === 'const',
            e.type
          )

          context.add(id.sourceString, v)
          e = new core.NaryExp([e.default, o.charAt(0), e])
        } else {
          e = new core.NaryExp([v, o.charAt(0), e])
        }
      }

      return new core.VarDec(v, '=', e)
    },
    Statement_localVar(_local, id) {
      const v = new core.Var(
        id.sourceString,
        true,
        false
      )
      context.add(id.sourceString, v)
      return new core.VarDec(v)
    },
    Statement_varAssignment(variable, op, exp) {
      // Designed to only get here for variable subscription/selection
      const v = variable.rep()
      return new core.VarDec(v, op.sourceString, exp.rep())
    },
    Statement_return(_return, exp) {
      // Can only explicitly use 'return' keyword inside a function
      checkInBlock(context)
      return new core.ReturnStatement(...exp.rep())
    },
    Statement_impliedReturn(exp) {
      const e = exp.rep()
      const noReturn = [core.Ternary, core.PreIncrement, core.PreDecrement, core.PostIncrement, core.PostDecrement]
      return noReturn.some(r => e instanceof r) ? e : new core.ReturnStatement(e)
    },
    Exp_ternary(cond, _qMark, block, _c, alt) {
      const c = coerceToBool(cond.rep())
      return new core.Ternary(c, block.rep(), ...alt.rep())
    },
    Exp1_equality(left, right) {
      const elements = [...left.rep(), right.rep()].flat()
      const pieces = mapOps(elements)

      for (const [o, [l, r]] of Object.entries(pieces)) {
        if (o === '==') {
          // checkSameTypes(l, r) // TODO: probably don't want to throw error on this - just want to replace with false
        }
        if (o.includes('<') || o.includes('>')) {
          checkNotType(l, [d.FUNC])
          checkNotType(r, [d.FUNC])
        }
      }

      return new core.NaryExp(elements)
    },
    Exp2_or(left, or, right) {
      const [l, op, rs] = [left.rep(), or.sourceString, right.rep()]
      let x = coerceToBool(l)

      for (let r of rs) {
        const y = coerceToBool(r)
        x = new core.BinaryExp(x, op, y)
      }

      return x
    },
    Exp3_and(left, and, right) {
      const [l, op, rs] = [left.rep(), and.sourceString, right.rep()]
      let x = coerceToBool(l)

      for (let r of rs) {
        const y = coerceToBool(r)
        x = new core.BinaryExp(x, op, y)
      }

      return x
    },
    Exp4_addSubtract(left, op, rest) {
      const elements = [left.rep(), op.sourceString, ...rest.asIteration().rep()]
      const pieces = mapOps(elements)

      for (const [o, [l, r]] of Object.entries(pieces)) {
        if (o === '-') {
          if (r instanceof core.PreDecrement) {
            core.error('Expected parentheses around pre-decrement operation on the right side of a subtraction')
          } else if (l instanceof core.PostDecrement) {
            core.error('Expected parentheses around post-decrement operation on the left side of a subtraction')
          }
        } else if (o === '+') {
          if (r instanceof core.PreIncrement) {
            core.error('Expected parentheses around pre-increment operation on the right side of an addition')
          } else if (l instanceof core.PostIncrement) {
            core.error('Expected parentheses around post-increment operation on the left side of an addition')
          }
        }
      }

      return new core.NaryExp(elements)
    },
    Exp5_multiplyDivideMod(left, op, rest) {
      const pieces = [left.rep(), op.sourceString, ...rest.asIteration().rep()]
      pieces.filter(e => typeof e !== 'string').forEach(e => checkNotType(e, [d.FUNC]))
      // TODO: see language design photos

      return new core.NaryExp(pieces)
    },
    // TODO implement eval order (l -> r)
    Exp6_exponent(left, op, right) {
      const [l, o, r] = [left.rep(), op.sourceString, right.rep()]
      checkNotType(l, [d.FUNC])
      checkNotType(r, [d.FUNC])
      return new core.BinaryExp(l, o, r)
    },
    Exp6_negate(negative, right) {
      const [op, r] = [negative.sourceString, right.rep()]
      if (r instanceof core.PreDecrement) {
        core.error('Expected parentheses around pre-decrement operation with a negation')
      }
      // -string
      // -[]
      // -{}
      return new core.UnaryExp(r, op)
    },
    Exp6_spread(spread, right) {
      const [o, r] = [spread.sourceString, right.rep()]
      checkType(r, [d.OBJ, d.LIST])

      return new core.UnaryExp(r, o)
    },
    Exp7_postFix(exp, op) {
      let [e, o] = [exp.rep(), op.sourceString]
      if (!e) {
        e = new core.Var(exp.sourceString, false, false, 'number')
        context.add(exp.sourceString, e)
      }
      checkNotLiteral(e)

      return o.includes('+') ? new core.PostIncrement(e) : new core.PostDecrement(e)
    },
    Exp7_preFix(op, exp) {
      let [e, o] = [exp.rep(), op.sourceString]
      if (!e) {
        e = new core.Var(exp.sourceString, false, false, 'number')
        context.add(exp.sourceString, e)
      }
      checkNotLiteral(e)

      return o.includes('+') ? new core.PreIncrement(e) : new core.PreDecrement(e)
    },
    Exp8_call(exp, _space, params) {
      const [e, p] = [exp.rep(), params.rep()]
      check(e, 'Variable may not have been initialized')
      // checkNotUndefined(e) // TODO: does this prevent 0()

      return new core.Call(e, p)
    },
    Exp8_subscript(exp, _open, selector, _close) {
      const [e, s] = [exp.rep(), selector.rep()]
      // TODO: don't think this is right because it doesn't allow built-in functions
      checkType(e, [d.OBJ, d.LIST])
      checkType(s, [d.NUM, d.STR, d.BOOL])
      // TODO how to check context? to see if selector exists/needs to be created

      return new core.VarSubscript(e, s)
    },
    Exp8_select(exp, _dot, selector) {
      const [e, s] = [exp.rep(), selector.rep()]
      
      checkNotType(e, [d.FUNC])
      // TODO: how to check s?
      // TODO do we allow list.1 as indexing?
      // if so, need to allow list type for x
      return new core.VarSelect(e, s)
    },
    Exp8_negative(negate, exp) {
      // TODO: probably can't use on objects, function literals,
      // unless we save it as a unary exp so it applies the negative to the result after the function gets called?
      // does using it on a boolean toggle the boolean? or does it turn to -1 * boolean (this one makes more sense probably)
      // -string? probably not allowed (unless it can be coerced to a number

      return new core.UnaryExp(exp.rep(), negate.sourceString)
    },
    Exp8_unwrap(exp, unwrap) {
      return new core.UnaryExp(exp.rep(), unwrap.sourceString)
    },
    Exp9_enclosed(_open, exp, _close) {
      return exp.rep()
    },
    LeftCompare(exp, op) {
      return [exp.rep(), op.sourceString]
    },
    BangFunc(_open, block, _close) {
      return block.rep()
    },
    VarAssignment_subscript(exp, _open, selector, _close) {
      return new core.VarSubscript(exp.rep(), selector.rep())
    },
    VarAssignment_select(exp, _dot, selector) {
      // TODO: set exp type to object?
      return new core.VarSelect(exp.rep(), selector.rep())
    },
    FuncLit(exp, _arrow, block) {
      const e = exp.rep()

      const b = new core.Block()
      context = context.newChildContext({ inLoop: false, block: b })
      const f = block.rep()
      context = context.parent

      return new core.Func(e, f)
    },
    Params(_open, params, _close) {
      return new core.Params(params.asIteration().rep())
    },
    Args(_open, args, _close) {
      return new core.Args(args.asIteration().rep())
    },
    Arg(arg) {
      return arg.rep()
    },
    Param(param) {
      const p = param.rep()
      const x = new core.Var(
        p ? p.id : param.sourceString,
        true,
        false,
        p ? p.type : undefined
      )

      context.add(x.id, x)
      return x
    },
    PositionalArg(exp) {
      return exp.rep()
    },
    KeywordArg(id, _e, exp) {
      return new core.KeywordParam(id.rep(), exp.rep())
    },
    oneParam(id) {
      const x = new core.Var(
        id.sourceString,
        true,
        false
      )

      context.add(id.sourceString, x)
      return new core.Params([x])
      // return new core.KeywordParam(id.rep(), exp.rep())
    },
    Obj(_open, fields, _close) {
      // TODO: create new context?
      return new core.Obj(fields.asIteration().rep())
    },
    ObjField(key, _c, exp) {
      return new core.ObjField(key.rep(), exp.rep())
    },
    key(str) {
      return str.rep()
    },
    ListLit(_open, list, _close) {
      return new core.List([...list.asIteration().rep()])
    },
    Str(str) {
      return str.rep()
    },
    strLit(_open, chars, _close) {
      return new core.Str(chars.rep().join(''))
    },
    FormattedStr(_open, chars, _close) {
      return new core.FormattedStr(chars.rep())
    },
    FSingleSubstr(exp) {
      return exp.rep()
    },
    FDoubleSubstr(exp) {
      return exp.rep()
    },
    FStrExp(_open, exp, _close) {
      return exp.rep()
    },
    fSingleStrChar(char) {
      return char.rep()
    },
    fDoubleStrChar(char) {
      return char.rep()
    },
    singleStrChar_escaped(escape, char) {
      return `${escape.sourceString}${char.rep()}`
    },
    singleStrChar(char) {
      return char.rep()
    },
    doubleStrChar_escaped(escape, char) {
      return `${escape.sourceString}${char.rep()}`
    },
    doubleStrChar(char) {
      return char.rep()
    },
    lineContinuation(escape, newLine) {
      return `${escape.sourceString}${newLine.rep()}`
    },
    id(_first, _rest) {
      return context.lookup(this.sourceString) // TODO is returning undefined
    },
    boolLit(bool) {
      return new core.Bool(bool.sourceString)
    },
    num(_whole, _dot, _fraction, _e, _sign, _exponent) {
      return new core.Num(this.sourceString)
    },
    compareOp(_o0, _o1) {
      return this.sourceString
    },
    MatchExp(_match, id, block) {
      return new core.MatchExp(id.sourceString, block.rep())
    },
    MatchBlock(_open, cases, defaultCase, _close) {
      return new core.MatchBlock([...cases.rep(), ...defaultCase.rep()])
    },
    CaseClause(_case, matches, _colon, block) {
      return new core.MatchCase(matches.asIteration().rep(), block.rep())
    },
    DefaultClause(_default, _colon, block) {
      return new core.DefaultMatchCase(block.rep())
    },
    nil(_nil) {
      return undefined
    },
    _terminal() {
      return this.sourceString
    },
    _iter(...children) {
      return children.map(child => child.rep())
    },
  })

  const match = bangGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return analyzer(match).rep()
}