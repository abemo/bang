# Week 13 Status Report

---

- Name: Natalie Lau
- Project Name: Bang!
- Date: 4/3/24
- Period Covered: 3/20 - 4/3

---

# Accomplishments

- Skeleton for interpreter
  - Responsible for producing console output
  - Takes input from parser output
- Interpreting for numerical addition and subtraction
  - Allows booleans and `nil` to appear as operands
- Interpreting for basic printing
  - Currently ignores any additional arguments passed to `print`
- Added static type descriptions to all literal types
- Set up unit testing for interpreter
- Fixed bug where `T` and `F` keywords failed to update current token
- Fixed issue where greedy matching expressions in call args split up non-parenthesized expressions by operators instead of by commas
- Fixed bug where nil keyword made infinite return statements instead of nil
- Interpreting for boolean addition and subtraction
  - Allows `nil` to appear as an operand

---

# Scheduled Tasks

- Interpreting for other operand types in addition (4/10/24)
- Interpreting for multiplicative operators (4/17/24)
- Interpreting for exponential operators (4/24/24)
- Interpreting for boolean operators (4/24/24)

---

# Potential Risks

- It's not possible to test all combinations of operators/operands
  - Because many operators are n-ary, rather than binary
  - There's an infinite number of possible combinations of operand types and values
  - Will test all basic binary combinations of types/operators