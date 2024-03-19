# Week 11 Status Report

---

- Name: Natalie Lau
- Project Name: Bang!
- Date: 3/20/24
- Period Covered: 3/6 - 3/20

---

# Accomplishments

- Bug fix for calling failable functions where list of incoming tokens was modified even if the parsing attempt failed
- Statements are now called Statement Expressions because they can be used as an Expression
- Add function to Expression interface called `srcCode`
  - Returns a string literal containing a cleaned version of the source code
- Use `chai-exclude` to ignore the `srcCode` function that is in every Expression while unit testing
- Fixed issue where variables at the top level were parsed as variable assignments
  - As opposed to parsing as variables
- Allow function literals with no parameters
- Allow function literals with no brackets
  - Single return line
- Fixed issue where multi-token implicit return values for function literals with implied brackets was parsed as multiple statements
- Fixed issue where the `rtn` keyword caused the parser to attempt to parse the same statement twice
- Parsing for match expressions
- Parsing for immediate functions and function calls

---

# Scheduled Tasks

- Change `&&` and `||` operators to `&` and `|` operators, respectively (3/21/24)
- Fix parsing for ternaries (3/25/24)
- Set up parsing to allow repeated `.` or `[]` operator (3/27/24)
- Set up parsing to allow assignment operators (3/28/24)

---

# Potential Risks

- Lack of context sensitivity at the parser level means the parser cannot identify implicit returns
  - Will look for implicit returns during analysis
- When parsing blocks, if the closing bracket (`}`) is not on its own line, the parser throws an error
  - Fixed by checking for keywords when parsing statements
- Both ternary and match expressions use `:` as an operator
  - Could potentially cause ambiguity when parsing