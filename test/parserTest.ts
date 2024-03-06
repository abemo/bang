import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import { parse } from '../src/parser'
import {
  AdditiveExpression,
  Block,
  NegativeExpression,
  ReturnStatement,
  StatementExpression,
  Variable,
  VariableAssignment,
} from '../src/core/core'
import { FunctionLiteral, ListLiteral, NumberLiteral, ObjectLiteral, StringLiteral } from '../src/core/types'
import { tokenize } from '../src/lexer'

const x = new Variable('x', false, false)
const localX = new Variable('x', true, false)

const programs = [
  ['number assignment', 'x = 5', new Block([new VariableAssignment(x, '=', new NumberLiteral(5))])],
  [
    'negative number assignment',
    'x = -5',
    new Block([new VariableAssignment(x, '=', new NegativeExpression(new NumberLiteral(5)))]),
  ],
  [
    'string assignment (single quote)',
    `x = 'hello world'`,
    new Block([new VariableAssignment(x, '=', new StringLiteral('hello world'))]),
  ],
  [
    'string assignment (double quote)',
    `x = "hello world"`,
    new Block([new VariableAssignment(x, '=', new StringLiteral('hello world'))]),
  ],
  ['new line string', `x = '\\n'`, new Block([new VariableAssignment(x, '=', new StringLiteral('\\n'))])],
  [
    'variable to variable assignment',
    'x = y',
    new Block([new VariableAssignment(x, '=', new Variable('y', false, false))]),
  ],
  ['empty list assignment', 'x = []', new Block([new VariableAssignment(x, '=', new ListLiteral([]))])],
  [
    'empty list assignment with whitespace',
    'x = [  ]',
    new Block([new VariableAssignment(x, '=', new ListLiteral([]))]),
  ],
  [
    'list assignment with one number',
    'x = [ 5 ]',
    new Block([new VariableAssignment(x, '=', new ListLiteral([new NumberLiteral(5)]))]),
  ],
  [
    'list assignment with string and number',
    'x = [5,   "hello world" ]',
    new Block([
      new VariableAssignment(x, '=', new ListLiteral([new NumberLiteral(5), new StringLiteral('hello world')])),
    ]),
  ],
  ['empty object assignment', 'x = {}', new Block([new VariableAssignment(x, '=', new ObjectLiteral([]))])],
  [
    'empty object assignment with whitespace',
    'x = {  }',
    new Block([new VariableAssignment(x, '=', new ObjectLiteral([]))]),
  ],
  [
    'object assignment with one key-val pair',
    `x = { 'one': 1 }`,
    new Block([new VariableAssignment(x, '=', new ObjectLiteral([[new StringLiteral('one'), new NumberLiteral(1)]]))]),
  ],
  [
    'object assignment with two key-val pairs',
    `x = { 'one': 1, " two": '2' }`,
    new Block([
      new VariableAssignment(
        x,
        '=',
        new ObjectLiteral([
          [new StringLiteral('one'), new NumberLiteral(1)],
          [new StringLiteral(' two'), new StringLiteral('2')],
        ])
      ),
    ]),
  ],
  ['implicit number return', '5', new Block([new ReturnStatement(new NumberLiteral(5))])],
  [
    'number addition',
    '5 + 3',
    new Block([new ReturnStatement(new AdditiveExpression([new NumberLiteral(5), '+', new NumberLiteral(3)]))]),
  ],
  [
    'parenthesized number addition',
    '(5 + 3)',
    new Block([new ReturnStatement(new AdditiveExpression([new NumberLiteral(5), '+', new NumberLiteral(3)]))]),
  ],
  // [
  //   'identity function with parentheses',
  //   '(x) -> { x }',
  //   new Block([new ReturnStatement(new FunctionLiteral([localX], [new ReturnStatement(localX)]))]),
  // ],
  // identity function (no parentheses)
  // empty function
  // identity function with {}
  // indentity function (no {})
  // function w/ 2 params
  // function w/ 2 statements
  // functions that span multiple lines
]

chai.use(chaiExclude)

for (const [scenario, program, expected] of programs) {
  const actual = parse(tokenize(program as string))
  try {
    // @ts-expect-error
    chai.assert.deepEqualExcludingEvery(actual, expected, ['srcCode'])
  } catch {
    console.log('Expected:')
    console.dir(expected, { depth: null })
    console.log('But got:')
    console.dir(actual, { depth: null })
    throw new Error(`${scenario} failed`)
  }
  console.log(`${scenario} passes`)
}
