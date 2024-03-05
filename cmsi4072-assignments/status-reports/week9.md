# Week 9 Status Report

---

- Name: Natalie Lau
- Project Name: Bang!
- Date: 3/6/24
- Period Covered: 2/21 - 3/6

---

# Accomplishments

- Set up unit testing for parser
- Added token category "whitespace"
  - Avoids ignoring whitespace in string literals during lexing
  - New line characters also categorized as whitespace
    - As opposed to structure
- Bug fix for issues updating current token being parsed
- Formatted string literal values are now always arrays that can contain strings and expressions
  - As opposed to a string or an array that can contain strings and expressions
- Added option to check whether token is at any of multiple strings
  - As opposed to only at any of multiple categories
- Updated literal expression parsing to include the following literals:
  - Strings
  - Formatted strings
  - Lists
  - Objects
  - Numbers
- Added ability to parse parenthesized expressions

---

# Scheduled Tasks

- Set up parsing for functions and immediate functions (3/10/24)
- Set up parsing for match expressions (3/17/24)
- Bug fix for parsing function calls (3/18/24)
  - Currently greedy matching the function name instead of parsing the entire expression as a call to that function
- Set up parsing to allow repeated `.` or `[]` operator (3/20/24)

---

# Potential Risks

- Tokenizing whitespace in the lexer instead of ignoring it may cause unexpected behavior in the parser
  - Will need thorough unit tests for the parser
- Unwanted errors may be thrown when user omits optional structural tokens
  - e.g. The `{}` around a single line function body
  - After unit testing, may need to refactor function parsing