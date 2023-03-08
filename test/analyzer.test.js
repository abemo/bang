import util from "util"
import assert from "assert/strict"
import analyze from "../src/analyzer.js"

// TODO const w/out val should error
// TODO: local const w/out val should error
// TODO: changing const val should error
// TODO: x += x++ // x = 0 \n x = x + 1
// -2 ** 2
// 2 ** -2 ** 2
// return outside block
// TODO 1 +++x, 1 ---x

const examples = [
  [
    'numeric variable declaration',
    'x = 1',
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1`
  ],
  [
    'string var dec',
    'x = "str"',
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['string']
   4 | Str val='str'`
  ],
  [
    'string var dec with apostrophes',
    `x = 'str'`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['string']
   4 | Str val='str'`
  ],
  [
    'bool var dec with true',
    'x = true',
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | Bool val=true`
  ],
  [
    'bool var dec with false',
    'x = false',
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | Bool val=false`
  ],
  [
    'list var dec with empty list',
    'x = []',
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | List val=[]`
  ],
  [
    'list var dec with 1-element list',
    'x = [1]',
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | List val=[#5]
   5 | Num val=1`
  ],
  [
    'list var dec with 2-element list',
    'x = [1, "str"]',
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | List val=[#5,#6]
   5 | Num val=1
   6 | Str val='str'`
  ],
  [
    'formatted str var dec',
    `y = 12
    x = $"str{y}ing"`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['number']
   4 | Num val=12
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['string']
   7 | FormattedStr val=['s','t','r',#3,'i','n','g']`
  ],
  [
    'formatted str var dec with apostrophes',
    `y = 12
    x = $'str{y}ing'`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['number']
   4 | Num val=12
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['string']
   7 | FormattedStr val=['s','t','r',#3,'i','n','g']`
  ],
  [
    'empty function literal with no params var dec',
    `x = () -> {}`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['function']
   4 | Func params=#5 block=#6
   5 | Params params=[]
   6 | Block statements=[]`
  ],
  [
    'function literal with enclosed 1 param var dec',
    `x = (i) -> { i }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['function']
   4 | Func params=#5 block=#7
   5 | Params params=[#6]
   6 | Var id='i' local=true readOnly=false type=['any']
   7 | Block statements=[#8]
   8 | ReturnStatement exp=#6`
  ],
  [
    'function literal with 1 param var dec',
    `x = i -> { i }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['function']
   4 | Func params=#5 block=#7
   5 | Params params=[#6]
   6 | Var id='i' local=true readOnly=false type=['any']
   7 | Block statements=[#8]
   8 | ReturnStatement exp=#6`
  ],
  [
    'function literal with no brackets',
    `x = i -> i`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['function']
   4 | Func params=#5 block=#7
   5 | Params params=[#6]
   6 | Var id='i' local=true readOnly=false type=['any']
   7 | Block statements=[#8]
   8 | ReturnStatement exp=#6`
  ],
  [
    '2 arg function call', 
    `add = (y, z) -> { y + z }
    add(2, [false])`, 
    `   1 | Block statements=[#2,#11]
   2 | VarDec var=#3 exp=#4
   3 | Var id='add' local=false readOnly=false type=['function']
   4 | Func params=#5 block=#8
   5 | Params params=[#6,#7]
   6 | Var id='y' local=true readOnly=false type=['any']
   7 | Var id='z' local=true readOnly=false type=['any']
   8 | Block statements=[#9]
   9 | ReturnStatement exp=#10
  10 | NaryExp exp=[#6,'+',#7]
  11 | Call id=#3 args=#12
  12 | Args args=[#13,#14]
  13 | Num val=2
  14 | List val=[#15]
  15 | Bool val=false`
  ],
  [
    'variable to number comparison',
    `x = 1
    x < 2`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | ReturnStatement exp=#6
   6 | NaryExp exp=[#3,'<',#7]
   7 | Num val=2`
  ],
  [
    'number to variable comparison',
    `y = false
    4 > y > -1`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['boolean']
   4 | Bool val=false
   5 | ReturnStatement exp=#6
   6 | NaryExp exp=[#7,'>',#3,'>',#8]
   7 | Num val=4
   8 | UnaryExp exp=#9 op='-'
   9 | Num val=1`
  ],
  [
    'post increment creates a vardec',
    `x++`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | ReturnStatement exp=#6
   6 | PostIncrement exp=#3`
  ],
  [
    'equality check',
    `x += 1
    x == y`,
    `   1 | Block statements=[#2,#5,#10]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['number']
   7 | NaryExp exp=[#8,'+',#9]
   8 | Num val=0
   9 | Num val=1
  10 | ReturnStatement exp=#11
  11 | NaryExp exp=[#6,'==',#3]`
  ],
  [
    'post-increment operator assignment',
    `y = x++`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | PostIncrement exp=#3`
  ],
  [
    'post-decrement operator is not an implied return',
    `x = 0
    x--`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | PostDecrement exp=#3`
  ],
  [
    'pre-increment operator is not an implied return',
    `x = 0
    ++x`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | PreIncrement exp=#3`
  ],
  [
    'pre-decrement operator is not an implied return',
    `x = 0
    --x`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | PreDecrement exp=#3`
  ],
  [
    'postfix op adds a var dec to the correct block',
    `x = {
      y++
    }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Block statements=[#5,#8]
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | Num val=0
   8 | ReturnStatement exp=#9
   9 | PostIncrement exp=#6`
  ],
  [
    'ternary after statement is not an implied return',
    `x = 0
    true ? 1 : 2`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | Ternary cond=#6 block=#7 alt=#10
   6 | Bool val=true
   7 | Block statements=[#8]
   8 | ReturnStatement exp=#9
   9 | Num val=1
  10 | Block statements=[#11]
  11 | ReturnStatement exp=#12
  12 | Num val=2`
  ],
  [
    'ternary followed by statement is not an implied return',
    `true ? 1 : 2
    x = 0`,
    `   1 | Block statements=[#2,#10]
   2 | Ternary cond=#3 block=#4 alt=#7
   3 | Bool val=true
   4 | Block statements=[#5]
   5 | ReturnStatement exp=#6
   6 | Num val=1
   7 | Block statements=[#8]
   8 | ReturnStatement exp=#9
   9 | Num val=2
  10 | VarDec var=#11 exp=#12
  11 | Var id='x' local=false readOnly=false type=['number']
  12 | Num val=0`
  ],
  [
    'ternary on its own is an implied return and does implicit declaration in the correct alternate block',
    `true ? 1 : x`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | Ternary cond=#4 block=#5 alt=#8
   4 | Bool val=true
   5 | Block statements=[#6]
   6 | ReturnStatement exp=#7
   7 | Num val=1
   8 | Block statements=[#9,#12]
   9 | VarDec var=#10 exp=#11
  10 | Var id='x' local=false readOnly=false type=['nil']
  11 | Nil 
  12 | ReturnStatement exp=#10`
  ],
  [
    'ternary does implicit declaration in the correct block',
    `true ? x : 1`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | Ternary cond=#4 block=#5 alt=#10
   4 | Bool val=true
   5 | Block statements=[#6,#9]
   6 | VarDec var=#7 exp=#8
   7 | Var id='x' local=false readOnly=false type=['nil']
   8 | Nil 
   9 | ReturnStatement exp=#7
  10 | Block statements=[#11]
  11 | ReturnStatement exp=#12
  12 | Num val=1`
  ],
  [
    'ternary has correct typing',
    `y = 'str'
    x = true ? 1 : y`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['string']
   4 | Str val='str'
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['number','string']
   7 | Ternary cond=#8 block=#9 alt=#12
   8 | Bool val=true
   9 | Block statements=[#10]
  10 | ReturnStatement exp=#11
  11 | Num val=1
  12 | Block statements=[#13]
  13 | ReturnStatement exp=#3`
  ],
  [
    'implicitly declared var does not get redeclared later',
    `y = x == 1
    x = 'str'`,
    `   1 | Block statements=[#2,#5,#9]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','string']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | NaryExp exp=[#3,'==',#8]
   8 | Num val=1
   9 | Assign var=#3 exp=#10
  10 | Str val='str'`
  ],
  [
    'postfix op',
    `x = 1
    x++`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | PostIncrement exp=#3`
  ],
  [
    'chained addition',
    `1 + 2 + 3`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | NaryExp exp=[#4,'+',#5,'+',#6]
   4 | Num val=1
   5 | Num val=2
   6 | Num val=3`
  ],
  [
    'chained subtraction',
    `4 - 3 - 5 - 1`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | NaryExp exp=[#4,'-',#5,'-',#6,'-',#7]
   4 | Num val=4
   5 | Num val=3
   6 | Num val=5
   7 | Num val=1`
  ],
  [
    'empty obj dec',
    `x = {}`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['object']
   4 | Obj val=[]`
  ],
  [
    'local var dec with value', 
    `local x = 5`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=true readOnly=false type=['number']
   4 | Num val=5`
  ],
  [
    'local var dec without value',
    `local x`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=true readOnly=false type=['nil']
   4 | Nil `
  ],
  [
    'var dec without value',
    `x`,
    `   1 | Block statements=[#2,#3]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['nil']
   4 | Nil `
  ],
  [
    'var as implied return gets recognized as return',
    `x = 1
    x`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | ReturnStatement exp=#3`
  ],
  [
    'const var dec with value',
    `const x = 5`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=true type=['number']
   4 | Num val=5`
  ],
  [
    'local const var dec with value',
    `local const x = 5`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=true readOnly=true type=['number']
   4 | Num val=5`
  ],
  [
    'changing variable value affects previously undefined var type',
    `x
    x = 5
    x`,
    `   1 | Block statements=[#2,#3,#5,#7]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['nil','number']
   4 | Nil 
   5 | Assign var=#3 exp=#6
   6 | Num val=5
   7 | ReturnStatement exp=#3`
  ],
  [
    'changing variable value affects already existing var type',
    `x = 5
    x = 'str'`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','string']
   4 | Num val=5
   5 | Assign var=#3 exp=#6
   6 | Str val='str'`
  ],
  [
    'changing variable value with mutating assignment op',
    `x = 5
    x += 'str'`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','string']
   4 | Num val=5
   5 | Assign var=#3 exp=#6
   6 | NaryExp exp=[#3,'+',#7]
   7 | Str val='str'`
  ],
  [
    '+= op with chained addition on right',
    `x = 5
    x += 'str' + ['alt']`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','list']
   4 | Num val=5
   5 | Assign var=#3 exp=#6
   6 | NaryExp exp=[#3,'+',#7,'+',#8]
   7 | Str val='str'
   8 | List val=[#9]
   9 | Str val='alt'`
  ],
  [
    'y = x++ sets x and y to numbers',
    `y = x++`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | PostIncrement exp=#3`
  ],
  [
    'y = (x++) + [] sets y to a list',
    `y = (x++) + []`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['list']
   7 | NaryExp exp=[#8,'+',#10]
   8 | NaryExp exp=[#9]
   9 | PostIncrement exp=#3
  10 | List val=[]`
  ],
  [
    'x = (x++) + [] sets x to a list',
    `x = (x++) + []`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','list']
   4 | Num val=0
   5 | Assign var=#3 exp=#6
   6 | NaryExp exp=[#7,'+',#9]
   7 | NaryExp exp=[#8]
   8 | PostIncrement exp=#3
   9 | List val=[]`
  ],
  [
    'using post-increment with undefined var points back to same var',
    `x = x++`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | Assign var=#3 exp=#6
   6 | PostIncrement exp=#3`
  ],
  [
    'post increment with undefined var adds to context',
    `x++
    x`,
    `   1 | Block statements=[#2,#5,#6]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | PostIncrement exp=#3
   6 | ReturnStatement exp=#3`
  ],
  [
    '+= does not nest NaryExps',
    `x += 1 + 2`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | NaryExp exp=[#5,'+',#6,'+',#7]
   5 | Num val=0
   6 | Num val=1
   7 | Num val=2`
  ],
  [
    'undefined assignment op defaults to highest type',
    `x += 4 + 'str' + [false]`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'+',#6,'+',#7,'+',#8]
   5 | List val=[]
   6 | Num val=4
   7 | Str val='str'
   8 | List val=[#9]
   9 | Bool val=false`
  ],
  [
    'unseen var inside list gets declared',
    `y = [x]`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['nil']
   4 | Nil 
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['list']
   7 | List val=[#3]`
  ],
  [
    '-= op',
    `x -= 4`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | NaryExp exp=[#5,'-',#6]
   5 | Num val=0
   6 | Num val=4`
  ],
  [
    '-= op with nary exp',
    `x -= 4 + 'str'`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['string']
   4 | NaryExp exp=[#5,'-',#6,'+',#7]
   5 | Str val=''
   6 | Num val=4
   7 | Str val='str'`
  ],
  [
    'chaining additive and multiplicative ops',
    `4 * 'str' + []`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | NaryExp exp=[#4,'+',#7]
   4 | NaryExp exp=[#5,'*',#6]
   5 | Num val=4
   6 | Str val='str'
   7 | List val=[]`
  ],
  [
    'chaining additive then multiplicative ops',
    `4 + 'str' * []`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | NaryExp exp=[#4,'+',#5]
   4 | Num val=4
   5 | NaryExp exp=[#6,'*',#7]
   6 | Str val='str'
   7 | List val=[]`
  ],
  [
    'undefined assignment op with var exp',
    `y = 1
    x += y`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['number']
   7 | NaryExp exp=[#8,'+',#4]
   8 | Num val=0`
  ],
  [
    'shared semantics',
    `x = y`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['nil']
   4 | Nil 
   5 | VarDec var=#6 exp=#4
   6 | Var id='x' local=false readOnly=false type=['nil']`
  ],
  [
    'shared semantics with literals',
    `x = 1
    y = x
    x = 2`,
    `   1 | Block statements=[#2,#5,#7]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#4
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | Assign var=#3 exp=#8
   8 | Num val=2`
  ],
  [
    'shared semantics with implicitly defined var',
    `x = y
    z = y`,
    `   1 | Block statements=[#2,#5,#7]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['nil']
   4 | Nil 
   5 | VarDec var=#6 exp=#4
   6 | Var id='x' local=false readOnly=false type=['nil']
   7 | VarDec var=#8 exp=#4
   8 | Var id='z' local=false readOnly=false type=['nil']`
  ],
  [
    'shared semantics with previously defined var',
    `z = x
    x = 1
    y = x`,
    `   1 | Block statements=[#2,#5,#7,#9]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['nil','number']
   4 | Nil 
   5 | VarDec var=#6 exp=#4
   6 | Var id='z' local=false readOnly=false type=['nil']
   7 | Assign var=#3 exp=#8
   8 | Num val=1
   9 | VarDec var=#10 exp=#8
  10 | Var id='y' local=false readOnly=false type=['number']`
  ],
  [
    'undefined -= op defaults to highest type',
    `const y = 4
    const z = 'str'
    a = [y]
    x -= y + z * a`,
    `   1 | Block statements=[#2,#5,#8,#11]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=true type=['number']
   4 | Num val=4
   5 | VarDec var=#6 exp=#7
   6 | Var id='z' local=false readOnly=true type=['string']
   7 | Str val='str'
   8 | VarDec var=#9 exp=#10
   9 | Var id='a' local=false readOnly=false type=['list']
  10 | List val=[#3]
  11 | VarDec var=#12 exp=#13
  12 | Var id='x' local=false readOnly=false type=['list']
  13 | NaryExp exp=[#14,'-',#3,'+',#15]
  14 | List val=[]
  15 | NaryExp exp=[#6,'*',#9]`
  ],
  [
    'eval assignment op with formatted str',
    `y = 5
    x += $'str{y}'`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['number']
   4 | Num val=5
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['string']
   7 | NaryExp exp=[#8,'+',#9]
   8 | FormattedStr val=[]
   9 | FormattedStr val=['s','t','r',#3]`
  ],
  [
    'formatted string declared previously unseen var',
    `x = $'str{y}'`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['nil']
   4 | Nil 
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['string']
   7 | FormattedStr val=['s','t','r',#3]`
  ],
  [
    'local x does not change type of global x',
    `x = 1
    {
      local x = 'str'
    }`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | ReturnStatement exp=#6
   6 | Block statements=[#7]
   7 | VarDec var=#8 exp=#9
   8 | Var id='x' local=true readOnly=false type=['string']
   9 | Str val='str'`
  ],
  [
    'var type gets set by return type',
    `x = { 1 }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Block statements=[#5]
   5 | ReturnStatement exp=#6
   6 | Num val=1`
  ],
  [
    'var type updates for mutliple return types',
    `x = { 
      y = true
      return y ? 1
      return 'str'
    }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','string']
   4 | Block statements=[#5,#8,#13]
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | Bool val=true
   8 | ReturnStatement exp=#9
   9 | Ternary cond=#6 block=#10 alt=undefined
  10 | Block statements=[#11]
  11 | ReturnStatement exp=#12
  12 | Num val=1
  13 | ReturnStatement exp=#14
  14 | Str val='str'`
  ],
  [
    'var type updates for mutliple return types',
    `x = { 
      y = true
      return y ? 1 : 'str'
    }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','string']
   4 | Block statements=[#5,#8]
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | Bool val=true
   8 | ReturnStatement exp=#9
   9 | Ternary cond=#6 block=#10 alt=#13
  10 | Block statements=[#11]
  11 | ReturnStatement exp=#12
  12 | Num val=1
  13 | Block statements=[#14]
  14 | ReturnStatement exp=#15
  15 | Str val='str'`
  ],
  [
    'explicit return statement defines previously undefined var',
    `{
      return x
    }`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | Block statements=[#4,#7]
   4 | VarDec var=#5 exp=#6
   5 | Var id='x' local=false readOnly=false type=['nil']
   6 | Nil 
   7 | ReturnStatement exp=#5`
  ],
  [
    'local x does not change type of global x',
    `const x = 5
    y = {
      local x = 'str'
      x
    }`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=true type=['number']
   4 | Num val=5
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['string']
   7 | Block statements=[#8,#11]
   8 | VarDec var=#9 exp=#10
   9 | Var id='x' local=true readOnly=false type=['string']
  10 | Str val='str'
  11 | ReturnStatement exp=#9`
  ],
  [
    '+= with block has default value',
    `x += { 1 }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | NaryExp exp=[#5,'+',#6]
   5 | Num val=0
   6 | Block statements=[#7]
   7 | ReturnStatement exp=#8
   8 | Num val=1`
  ],
  [
    'binary exp ==',
    `x = 1
    y = false
    x == y`,
    `   1 | Block statements=[#2,#5,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | Bool val=false
   8 | ReturnStatement exp=#9
   9 | NaryExp exp=[#3,'==',#6]`
  ],
  [
    'chained equality exp',
    `x = 1
    y = false
    z = $'{x}'
    n = x < y <= z == 4 != 'str'`,
    `   1 | Block statements=[#2,#5,#8,#11]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | Bool val=false
   8 | VarDec var=#9 exp=#10
   9 | Var id='z' local=false readOnly=false type=['string']
  10 | FormattedStr val=[#3]
  11 | VarDec var=#12 exp=#13
  12 | Var id='n' local=false readOnly=false type=['boolean']
  13 | NaryExp exp=[#3,'<',#6,'<=',#9,'==',#14,'!=',#15]
  14 | Num val=4
  15 | Str val='str'`
  ],
  [
    'setting vars equal to each other does not link by ids',
    `x = 1
    y = x`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#4
   6 | Var id='y' local=false readOnly=false type=['number']`
  ],
  [
    `binary exp >`,
    `1 > 2`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | NaryExp exp=[#4,'>',#5]
   4 | Num val=1
   5 | Num val=2`
  ],
  [
    'binary exp >=',
    `4 >= false`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | NaryExp exp=[#4,'>=',#5]
   4 | Num val=4
   5 | Bool val=false`
  ],
  [
    '== op has type boolean',
    `x = 1
    y = false
    z = x == y`,
    `   1 | Block statements=[#2,#5,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | Bool val=false
   8 | VarDec var=#9 exp=#10
   9 | Var id='z' local=false readOnly=false type=['boolean']
  10 | NaryExp exp=[#3,'==',#6]`
  ],
  [
    '|| operator has type boolean',
    `x = 1 || []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | BinaryExp left=#5 op='||' right=#6
   5 | Num val=1
   6 | List val=[]`
  ],
  [
    '&& op has type bool',
    `x = 1 && []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | BinaryExp left=#5 op='&&' right=#6
   5 | Num val=1
   6 | List val=[]`
  ],
  [
    '* op',
    `x = 1 * []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'*',#6]
   5 | Num val=1
   6 | List val=[]`
  ],
  [
    '+= with * op',
    `x += 1 * []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'+',#6,'*',#7]
   5 | List val=[]
   6 | Num val=1
   7 | List val=[]`
  ],
  [
    '+= op with () nests nary exps',
    `x += (1 + [])`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'+',#6]
   5 | List val=[]
   6 | NaryExp exp=[#7,'+',#8]
   7 | Num val=1
   8 | List val=[]`
  ],
  [
    '* assignment op',
    `x *= 1`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | NaryExp exp=[#5,'*',#6]
   5 | Num val=0
   6 | Num val=1`
  ],
  [
    '*= with + op does not nest nary exps',
    `x *= 1 + []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'*',#6,'+',#7]
   5 | List val=[]
   6 | Num val=1
   7 | List val=[]`
  ],
  [
    '*= op with () nests nary exps',
    `x *= (1 + [])`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'*',#6]
   5 | List val=[]
   6 | NaryExp exp=[#7,'+',#8]
   7 | Num val=1
   8 | List val=[]`
  ],
  [
    '/ op',
    `x = 1 / []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'/',#6]
   5 | Num val=1
   6 | List val=[]`
  ],
  [
    '/ assignment op',
    `x /= 1`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | NaryExp exp=[#5,'/',#6]
   5 | Num val=0
   6 | Num val=1`
  ],
  [
    '/= with + op does not nest nary exps',
    `x /= 1 + []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'/',#6,'+',#7]
   5 | List val=[]
   6 | Num val=1
   7 | List val=[]`
  ],
  [
    '/= op with () nests nary exps',
    `x /= (1 + [])`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'/',#6]
   5 | List val=[]
   6 | NaryExp exp=[#7,'+',#8]
   7 | Num val=1
   8 | List val=[]`
  ],
  [
    '% op',
    `x = 1 % []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'%',#6]
   5 | Num val=1
   6 | List val=[]`
  ],
  [
    '% assignment op',
    `x %= 1`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | NaryExp exp=[#5,'%',#6]
   5 | Num val=0
   6 | Num val=1`
  ],
  [
    '%= with + op does not nest nary exps',
    `x %= 1 + []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'%',#6,'+',#7]
   5 | List val=[]
   6 | Num val=1
   7 | List val=[]`
  ],
  [
    '%= op with () nests nary exps',
    `x %= (1 + [])`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'%',#6]
   5 | List val=[]
   6 | NaryExp exp=[#7,'+',#8]
   7 | Num val=1
   8 | List val=[]`
  ],
  [
    '** op',
    `x = 1 ** []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'**',#6]
   5 | Num val=1
   6 | List val=[]`
  ],
  [
    '** assignment op',
    `x **= 1`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | NaryExp exp=[#5,'**',#6]
   5 | Num val=0
   6 | Num val=1`
  ],
  [
    '**= with + op does not nest nary exps',
    `x **= 1 + []`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'**',#6,'+',#7]
   5 | List val=[]
   6 | Num val=1
   7 | List val=[]`
  ],
  [
    '**= op with () nests nary exps',
    `x **= (1 + [])`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'**',#6]
   5 | List val=[]
   6 | NaryExp exp=[#7,'+',#8]
   7 | Num val=1
   8 | List val=[]`
  ],
  [
    'chained multiplicative ops',
    `x = 1 * 2 / [3]`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | NaryExp exp=[#5,'*',#6,'/',#7]
   5 | Num val=1
   6 | Num val=2
   7 | List val=[#8]
   8 | Num val=3`
  ],
  [
    '! op returns a bool',
    `x = !1`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | UnaryExp exp=#5 op='!'
   5 | Num val=1`
  ],
  [
    'var dec with nil',
    `x = nil`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['nil']
   4 | Nil `
  ],
  [
    'object literal',
    `y = { "x": 1 }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['object']
   4 | Obj val=[#5]
   5 | ObjField key=#6 val=#7
   6 | Str val='x'
   7 | Num val=1`
  ],
  [
    'var select',
    `y = { "x": 1 }
    z = y.x`,
    `   1 | Block statements=[#2,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['object']
   4 | Obj val=[#5]
   5 | ObjField key=#6 val=#7
   6 | Str val='x'
   7 | Num val=1
   8 | VarDec var=#9 exp=#10
   9 | Var id='z' local=false readOnly=false type=['any']
  10 | BinaryExp left=#3 op='.' right='x'`
  ],
  [
    'dot operator creates new object',
    `x = y.z`,
    `   1 | Block statements=[#2,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['object']
   4 | Obj val=[#5]
   5 | ObjField key=#6 val=#7
   6 | Str val='z'
   7 | Nil 
   8 | VarDec var=#9 exp=#10
   9 | Var id='x' local=false readOnly=false type=['any']
  10 | BinaryExp left=#3 op='.' right='z'`
  ],
  [
    'adding to an object alters the already existing core obj',
    `x = {}
    x.y = 1`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['object']
   4 | Obj val=[]
   5 | Assign var=#6 exp=#7
   6 | BinaryExp left=#3 op='.' right='y'
   7 | Num val=1`
  ],
  [
    'chained dot op',
    `x = { 'y': { 'x': 1 } }
    x.y.x`,
    `   1 | Block statements=[#2,#11]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['object']
   4 | Obj val=[#5]
   5 | ObjField key=#6 val=#7
   6 | Str val='y'
   7 | Obj val=[#8]
   8 | ObjField key=#9 val=#10
   9 | Str val='x'
  10 | Num val=1
  11 | ReturnStatement exp=#12
  12 | BinaryExp left=#13 op='.' right='x'
  13 | BinaryExp left=#3 op='.' right='y'`
  ],
  [
    'var subscript',
    `y = { "x": 1 }
    z = y['x']`,
    `   1 | Block statements=[#2,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['object']
   4 | Obj val=[#5]
   5 | ObjField key=#6 val=#7
   6 | Str val='x'
   7 | Num val=1
   8 | VarDec var=#9 exp=#10
   9 | Var id='z' local=false readOnly=false type=['any']
  10 | VarSubscript id=#3 selector=#11
  11 | Str val='x'`
  ],
  [
    'short return statement',
    `x = { return }`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['nil']
   4 | Block statements=[#5]
   5 | ReturnStatement exp=#6
   6 | Nil `
  ],
  [
    'return var',
    `x = 1
    y = {
      return x
    }`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | Block statements=[#8]
   8 | ReturnStatement exp=#3`
  ],
  [
    'local return var',
    `const x = 1
    y = {
      local x = 'str'
      return x
    }`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=true type=['number']
   4 | Num val=1
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['string']
   7 | Block statements=[#8,#11]
   8 | VarDec var=#9 exp=#10
   9 | Var id='x' local=true readOnly=false type=['string']
  10 | Str val='str'
  11 | ReturnStatement exp=#9`
  ],
  [
    'declared var with value of nil still returns',
    `x
    x`,
    `   1 | Block statements=[#2,#3,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['nil']
   4 | Nil 
   5 | ReturnStatement exp=#3`
  ],
  [
    'var changes value',
    `x = 1
    x = [2]`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','list']
   4 | Num val=1
   5 | Assign var=#3 exp=#6
   6 | List val=[#7]
   7 | Num val=2`
  ],
  [
    'implicit declaration of var within var dec does not fail',
    `{
      x ? {
        return x
      }
    }`,
    `   1 | Block statements=[#2]
   2 | ReturnStatement exp=#3
   3 | Block statements=[#4,#7]
   4 | VarDec var=#5 exp=#6
   5 | Var id='x' local=false readOnly=false type=['boolean']
   6 | Bool val=false
   7 | ReturnStatement exp=#8
   8 | Ternary cond=#5 block=#9 alt=undefined
   9 | Block statements=[#10]
  10 | ReturnStatement exp=#5`
  ],
  [
    'ternaries',
    `x ? y
    x ? y : z`,
    `   1 | Block statements=[#2,#5,#11]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | Bool val=false
   5 | Ternary cond=#3 block=#6 alt=undefined
   6 | Block statements=[#7,#10]
   7 | VarDec var=#8 exp=#9
   8 | Var id='y' local=false readOnly=false type=['nil']
   9 | Nil 
  10 | ReturnStatement exp=#8
  11 | Ternary cond=#3 block=#12 alt=#17
  12 | Block statements=[#13,#16]
  13 | VarDec var=#14 exp=#15
  14 | Var id='y' local=false readOnly=false type=['nil']
  15 | Nil 
  16 | ReturnStatement exp=#14
  17 | Block statements=[#18,#21]
  18 | VarDec var=#19 exp=#20
  19 | Var id='z' local=false readOnly=false type=['nil']
  20 | Nil 
  21 | ReturnStatement exp=#19`
  ],
  [
    'ternary return types',
    `x = true ? 1 : 'str'`,
    `   1 | Block statements=[#2]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number','string']
   4 | Ternary cond=#5 block=#6 alt=#9
   5 | Bool val=true
   6 | Block statements=[#7]
   7 | ReturnStatement exp=#8
   8 | Num val=1
   9 | Block statements=[#10]
  10 | ReturnStatement exp=#11
  11 | Str val='str'`
  ],
  [
    'additive exp with undeclared vars initializes them',
    `x + y`,
    `   1 | Block statements=[#2,#5,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | Num val=0
   8 | ReturnStatement exp=#9
   9 | NaryExp exp=[#3,'+',#6]`
  ],
  [
    'and exp with undeclared vars initializes them',
    `x && y`,
    `   1 | Block statements=[#2,#5,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | Bool val=false
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | Bool val=false
   8 | ReturnStatement exp=#9
   9 | BinaryExp left=#3 op='&&' right=#6`
  ],
  [
    'or exp with undeclared vars initializes them',
    `x || y`,
    `   1 | Block statements=[#2,#5,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['boolean']
   4 | Bool val=false
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['boolean']
   7 | Bool val=false
   8 | ReturnStatement exp=#9
   9 | BinaryExp left=#3 op='||' right=#6`
  ],
  [
    'divide exp with undeclared vars initializes them',
    `x / y / z`,
    `   1 | Block statements=[#2,#5,#8,#11]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | Num val=0
   8 | VarDec var=#9 exp=#10
   9 | Var id='z' local=false readOnly=false type=['number']
  10 | Num val=0
  11 | ReturnStatement exp=#12
  12 | NaryExp exp=[#3,'/',#6,'/',#9]`
  ],
  [
    'exponential exp with undeclared vars initializes them',
    `x ** y ** z`,
    `   1 | Block statements=[#2,#5,#8,#11]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['number']
   7 | Num val=0
   8 | VarDec var=#9 exp=#10
   9 | Var id='z' local=false readOnly=false type=['number']
  10 | Num val=0
  11 | ReturnStatement exp=#12
  12 | NaryExp exp=[#3,'**',#6,'**',#9]`
  ],
  [
    'negation with undeclared var initializes it',
    `x = -y`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['number']
   7 | UnaryExp exp=#3 op='-'`
  ],
  [
    'object with ternaries as values',
    `b = 2e3
    {
      "x": a >= 5 ? b : c,
      'y': d + e || f ? 'hello'
    }`,
    `   1 | Block statements=[#2,#5,#8,#11,#14,#17]
   2 | VarDec var=#3 exp=#4
   3 | Var id='a' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='d' local=false readOnly=false type=['number']
   7 | Num val=0
   8 | VarDec var=#9 exp=#10
   9 | Var id='e' local=false readOnly=false type=['number']
  10 | Num val=0
  11 | VarDec var=#12 exp=#13
  12 | Var id='f' local=false readOnly=false type=['boolean']
  13 | Bool val=false
  14 | VarDec var=#15 exp=#16
  15 | Var id='b' local=false readOnly=false type=['number']
  16 | Num val=2000
  17 | ReturnStatement exp=#18
  18 | Obj val=[#19,#31]
  19 | ObjField key=#20 val=#21
  20 | Str val='x'
  21 | Ternary cond=#22 block=#24 alt=#26
  22 | NaryExp exp=[#3,'>=',#23]
  23 | Num val=5
  24 | Block statements=[#25]
  25 | ReturnStatement exp=#15
  26 | Block statements=[#27,#30]
  27 | VarDec var=#28 exp=#29
  28 | Var id='c' local=false readOnly=false type=['nil']
  29 | Nil 
  30 | ReturnStatement exp=#28
  31 | ObjField key=#32 val=#33
  32 | Str val='y'
  33 | Ternary cond=#34 block=#36 alt=undefined
  34 | BinaryExp left=#35 op='||' right=#12
  35 | NaryExp exp=[#6,'+',#9]
  36 | Block statements=[#37]
  37 | ReturnStatement exp=#38
  38 | Str val='hello'`
  ],
  [
    'assignment checks for implicit var decs',
    `x = true
    x = !x + y`,
    `   1 | Block statements=[#2,#5,#8]
   2 | VarDec var=#3 exp=#4
   3 | Var id='y' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['boolean','number']
   7 | Bool val=true
   8 | Assign var=#6 exp=#9
   9 | NaryExp exp=[#10,'+',#3]
  10 | UnaryExp exp=#6 op='!'`
  ],
  [
    'spread op',
    `y = [...x, 2]`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='x' local=false readOnly=false type=['list']
   4 | List val=[]
   5 | VarDec var=#6 exp=#7
   6 | Var id='y' local=false readOnly=false type=['list']
   7 | List val=[#8,#9]
   8 | UnaryExp exp=#3 op='...'
   9 | Num val=2`
  ],
  [
    'formatted strings with ternary',
    `x = $'str{ a >= 5 ? b : c }'`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='a' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | VarDec var=#6 exp=#7
   6 | Var id='x' local=false readOnly=false type=['string']
   7 | FormattedStr val=['s','t','r',#8]
   8 | Ternary cond=#9 block=#11 alt=#16
   9 | NaryExp exp=[#3,'>=',#10]
  10 | Num val=5
  11 | Block statements=[#12,#15]
  12 | VarDec var=#13 exp=#14
  13 | Var id='b' local=false readOnly=false type=['nil']
  14 | Nil 
  15 | ReturnStatement exp=#13
  16 | Block statements=[#17,#20]
  17 | VarDec var=#18 exp=#19
  18 | Var id='c' local=false readOnly=false type=['nil']
  19 | Nil 
  20 | ReturnStatement exp=#18`
  ],
  [
    'loops.bang example code lines 9-14',
    `i = 0
    (i < 10).loop({
      print(i)
      i += 1
    })
    // prints 0-9 on separate lines`,
    `   1 | Block statements=[#2,#5]
   2 | VarDec var=#3 exp=#4
   3 | Var id='i' local=false readOnly=false type=['number']
   4 | Num val=0
   5 | Call id=#6 args=#10
   6 | BinaryExp left=#7 op='.' right='loop'
   7 | NaryExp exp=[#8]
   8 | NaryExp exp=[#3,'<',#9]
   9 | Num val=10
  10 | Args args=[#11]
  11 | Block statements=[#12,#14]
  12 | Call id='print' args=#13
  13 | Args args=[#3]
  14 | Assign var=#3 exp=#15
  15 | NaryExp exp=[#3,'+',#16]
  16 | Num val=1`
  ],
  [
    'loops.bang example code lines 16-22',
    `range(5).loop((i) -> { print(i) })
    range(5).loop((i) -> print(i))
    range(5).loop(print)
    // prints 0-4 on separate lines
    
    range(1, 6).loop(print)
    // prints 1-5 on separate lines`,
    `   1 | Block statements=[#2,#15,#28,#34]
   2 | Call id=#3 args=#7
   3 | BinaryExp left=#4 op='.' right='loop'
   4 | Call id='range' args=#5
   5 | Args args=[#6]
   6 | Num val=5
   7 | Args args=[#8]
   8 | Func params=#9 block=#11
   9 | Params params=[#10]
  10 | Var id='i' local=true readOnly=false type=['any']
  11 | Block statements=[#12]
  12 | ReturnStatement exp=#13
  13 | Call id='print' args=#14
  14 | Args args=[#10]
  15 | Call id=#16 args=#20
  16 | BinaryExp left=#17 op='.' right='loop'
  17 | Call id='range' args=#18
  18 | Args args=[#19]
  19 | Num val=5
  20 | Args args=[#21]
  21 | Func params=#22 block=#24
  22 | Params params=[#23]
  23 | Var id='i' local=true readOnly=false type=['any']
  24 | Block statements=[#25]
  25 | ReturnStatement exp=#26
  26 | Call id='print' args=#27
  27 | Args args=[#23]
  28 | Call id=#29 args=#33
  29 | BinaryExp left=#30 op='.' right='loop'
  30 | Call id='range' args=#31
  31 | Args args=[#32]
  32 | Num val=5
  33 | Args args=['print']
  34 | Call id=#35 args=#40
  35 | BinaryExp left=#36 op='.' right='loop'
  36 | Call id='range' args=#37
  37 | Args args=[#38,#39]
  38 | Num val=1
  39 | Num val=6
  40 | Args args=['print']`
  ],
  [
    'strings.bang example code lines 4-11',
    `firstName = "Ray"
    lastName = "Toal"
    combinedName = firstName + " " + lastName
    interpolatedName = $'{firstName} {lastName}'
    
    print("//")
    print(/* */)
    print(/* // */)`,
    `   1 | Block statements=[#2,#5,#8,#12,#15,#18,#20]
   2 | VarDec var=#3 exp=#4
   3 | Var id='firstName' local=false readOnly=false type=['string']
   4 | Str val='Ray'
   5 | VarDec var=#6 exp=#7
   6 | Var id='lastName' local=false readOnly=false type=['string']
   7 | Str val='Toal'
   8 | VarDec var=#9 exp=#10
   9 | Var id='combinedName' local=false readOnly=false type=['string']
  10 | NaryExp exp=[#3,'+',#11,'+',#6]
  11 | Str val=' '
  12 | VarDec var=#13 exp=#14
  13 | Var id='interpolatedName' local=false readOnly=false type=['string']
  14 | FormattedStr val=[#3,' ',#6]
  15 | Call id='print' args=#16
  16 | Args args=[#17]
  17 | Str val='//'
  18 | Call id='print' args=#19
  19 | Args args=[]
  20 | Call id='print' args=#21
  21 | Args args=[]`
  ],
  // [
  //   'escaped new line',
  //   `'\\n'`,
  //   `   1 | Block statements=[#2]
  //  2 | ReturnStatement exp=#3
  //  3 | Str val='\\n'`
  // ], // TODO not sure whats happening here
  // TODO: escaped chars (formatted and regular strs)
  [
    'match.bang example code',
    `s = season.fall
    result = match s {
      case season.spring: "spring!"
      case season.summer: { "summer!" }
      case season.fall, season.winter: {
        str = "is cold!"
        str
      }
      default: "California!"
    }
    print(result)
    // prints "is cold!"`,
    `   1 | Block statements=[#2,#8,#11,#37]
   2 | VarDec var=#3 exp=#4
   3 | Var id='season' local=false readOnly=false type=['object']
   4 | Obj val=[#5]
   5 | ObjField key=#6 val=#7
   6 | Str val='fall'
   7 | Nil 
   8 | VarDec var=#9 exp=#10
   9 | Var id='s' local=false readOnly=false type=['any']
  10 | BinaryExp left=#3 op='.' right='fall'
  11 | VarDec var=#12 exp=#13
  12 | Var id='result' local=false readOnly=false type=['any']
  13 | MatchExp cond=#9 clauses=#14
  14 | MatchBlock cases=[#15,#20,#25,#33]
  15 | MatchCase conds=[#16] block=#17
  16 | BinaryExp left=#3 op='.' right='spring'
  17 | Block statements=[#18]
  18 | ReturnStatement exp=#19
  19 | Str val='spring!'
  20 | MatchCase conds=[#21] block=#22
  21 | BinaryExp left=#3 op='.' right='summer'
  22 | Block statements=[#23]
  23 | ReturnStatement exp=#24
  24 | Str val='summer!'
  25 | MatchCase conds=[#26,#27] block=#28
  26 | BinaryExp left=#3 op='.' right='fall'
  27 | BinaryExp left=#3 op='.' right='winter'
  28 | Block statements=[#29,#32]
  29 | VarDec var=#30 exp=#31
  30 | Var id='str' local=false readOnly=false type=['string']
  31 | Str val='is cold!'
  32 | ReturnStatement exp=#30
  33 | DefaultMatchCase block=#34
  34 | Block statements=[#35]
  35 | ReturnStatement exp=#36
  36 | Str val='California!'
  37 | Call id='print' args=#38
  38 | Args args=[#12]`
  ] // TODO: think default vals for objects should be string values, not nil
]

describe('The analyzer', () => {
  for (const [scenario, example, expected] of examples) {
    it(`produces the expected ast for ${scenario}`, () => {
      assert.deepEqual(util.format(analyze(example)), expected)
    }) 
  }
})