# Week 15 Status Report

---

- Name: Natalie Lau
- Project Name: Bang!
- Date: 4/17/24
- Period Covered: 4/3 - 4/17

---

# Accomplishments

- Formatting for lexer output when running `src/lexer.ts` directly
- Example program for lexer
  - Contains all valid symbols in the _Bang!_ language
- Example program for parser
- Example program for interpreter
  - Lists operations and their outputs
- `tokenizeFile`, `parseFile`, and `runFile` functions all take a file name as input
  - As opposed to reading directly from `process.argv`
- Fixed incorrect `print` keyword to `prt`
- Script to output the intermediate steps of the interpreter, given some `.bang` file
- Bug fix for printing strings and booleans
  - Was erroring previously due to the way literals were being interpreted
- Allow multiple arguments to the `prt` function
- Addition/subtraction for string + following types:
  - String
  - Number
  - Boolean
  - Nil
- Addition/subtraction for following types + string:
  - String
  - Number
  - Boolean
  - Nil
- Bug fix where printing nil printed an empty string instead of nil
- Ability to print lists directly
  - Strings inside lists will still have quotation marks
- Ability to print objects directly
  - Strings (both as keys and values) will still have quotation marks
- Addition/Subtraction for list + following types:
  - List
  - Object
  - String
  - Number
  - Boolean
  - Nil
- Addition for following types + list:
  - List
  - Object
  - String
  - Number
  - Boolean
  - Nil
- Equality/inequality checks for the following types:
  - Nil
  - Boolean
  - Number
  - String
  - Object
  - List
- Type casting to following types:
  - Boolean
- List class methods:
  - `get()`
  - `idxOf()`
  - `has()`
  - `delIdx()`
  - `del()`
  - `prepend()`
  - `add()`
  - `flat()`
- Language docs for:
  - List class methods listed above

---

# Scheduled Tasks

- Interpreting for other operand types in addition
- Interpreting for multiplicative operators
- Interpreting for exponential operators
- Interpreting for boolean operators

---

# Potential Risks

- It's not possible to test all combinations of operators/operands
  - Because many operators are n-ary, rather than binary
  - There's an infinite number of possible combinations of operand types and values
  - Will test all basic binary combinations of types/operators
- Parenthesized expressions don't get interpreted correctly