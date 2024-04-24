# Table of Contents
5.1 [Introduction](#introduction)

5.2 [Functional Requirements](#func-reqs)
<br/>&emsp;&nbsp;&nbsp;&nbsp;5.2.1 [Lexer](#lexer)
<br/>&emsp;&nbsp;&nbsp;&nbsp;5.2.2 [Parser](#parser)
<br/>&emsp;&nbsp;&nbsp;&nbsp;5.2.3 [Analyzer](#analyzer)
<br/>&emsp;&nbsp;&nbsp;&nbsp;5.2.4 [Optimizer](#optimizer)
<br/>&emsp;&nbsp;&nbsp;&nbsp;5.2.5 [Interpreter](#interpreter)

5.3 [Performance Requirements](#perform-reqs)
<br/>&emsp;&nbsp;&nbsp;&nbsp;5.3.1 [Consistency](#consistency)

5.4 [Environment Requirements](#env-reqs)

---

# Requirements

## <a name="introduction" id="introduction"/> 5.1 Introduction
The programming language _Bang!_ is a dynamically and weakly typed expression-based scripting language that prioritizes concise syntax and flexibility. The language requires developers to have TypeScript, Yarn, and a text editor on their machine. The user can enter a command into their command line to run a script they write in _Bang!_. Language documentation is provided through Notion for developers' reference when writing scripts.

Below is a UML State Diagram depicting the order of the components in the interpreter.

![UML State Diagram](./uml-state-diagram.jpeg)

The remainder of this document is structured as follows. [Section 5.2](#func-reqs) contains the functional requirements, which describe what the completed interpreter can be expected to have. [Section 5.3](#perform-reqs) contains the performance requirements, which include requirements regarding runtime. [Section 5.4](#env-reqs) contains the environment requirements, which lists any additional software requirements the user needs to have installed.

---

## <a name="func-reqs" id="func-reqs"/> 5.2 Functional Requirements
The interpreter for _Bang!_ is divided into a few components: the [lexer](#lexer), which groups symbols into tokens; the [parser](#parser), which groups tokens into sentences; the [analyzer](#analyzer), which adds contextual meaning to the abstract syntax tree; the [optimizer](#optimizer), which performs optimizations to decrease the interpreter's runtime; and the [interpreter](#interpreter), which runs the script and produces any necessary output.

### <a name="lexer" id="lexer"/> 5.2.1 Lexer
The lexer groups symbols (i.e. characters) into tokens that can be passed to the [parser](#parser) (the next step of the interpreter). The following requirements are levied on the lexer.

5.2.1.1 The lexer shall take a string as input to parse.

5.2.1.2 The lexer shall use regular expressions to group the input into tokens.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;Tokens should be determined according to the language's syntax seen in the documentation.

5.2.1.3 The lexer shall pass the resulting tokens to the parser as a list of tokens.

### <a name="parser" id="parser"/> 5.2.2 Parser
The parser groups the tokens passed from the [lexer](#lexer) into sentences and constructs the abstract syntax tree (AST) from the resulting sentences.

5.2.2.1 The parser shall read the tokens passed from the lexer as input.

5.2.2.2 The parser shall group tokens into sentences.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;Sentences should be formed according to the language's syntax seen in the documentation.

5.2.2.3 The parser shall connect the AST as sentences are formed.

5.2.2.4 The parser shall pass the resulting AST to the analyzer.

### <a name="analyzer" id="analyzer"/> 5.2.3 Analyzer
The analyzer adds contextual meaning to the abstract syntax tree (AST) passed from the [parser](#parser).

5.2.3.1 The analyzer shall receive the AST from the parser as input.

5.2.3.2 The analyzer shall decorate the AST with potential data types.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;The data type will be determined by the pattern of literal values.

5.2.3.3 The analyzer shall unroll syntactic sugar into the lengthier equivalent.

5.2.3.4 The analyzer shall track what variables are in scope.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;Variables will have global scope by default.

5.2.3.5 The analyzer shall link references to already declared variables to the object in context.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;The analyzer should keep track of already declared variables in context.

5.2.3.6 The analyzer shall throw an error when `const` variables aren't initialized to an explicit value.

5.2.3.7 The analyzer shall throw an error when `break` is used outside of a loop.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;The analyzer should keep track of whether the program counter is inside a loop or not.

5.2.3.8 The analyzer shall pass the decorated AST to the optimizer.

### <a name="optimizer" id="optimizer"/> 5.2.4 Optimizer
The optimizer performs optimizations that decrease the overall runtime of the [interpreter](#interpreter).

5.2.4.1 The optimizer shall receive the decorated AST from the analyzer as input.

5.2.4.2 The optimizer shall unroll loops with a set number of iterations.

5.2.4.3 The optimizer shall perform constant folding on numbers.

5.2.4.4 The optimizer shall delete dead code.

5.2.4.5 The optimizer shall pass the optimized, decorated AST to the interpreter.

### <a name="interpreter" id="interpreter"/> 5.2.5 Interpreter
The interpreter parses the optimized, decorated AST passed from the [optimizer](#optimizer) and produces any resulting output.

5.2.5.1 The interpreter shall receive the optimized, decorated AST from the optimizer.

5.2.5.2 The interpreter shall produce any output that should be printed by the inputted script.

---

## <a name="perform-reqs" id="perform-reqs"/> 5.3 Performance Requirements

### <a name="consistency" id="consistency"/> 5.3.1 Consistency

5.3.1.1 The language shall be deterministic.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;The language should produce the same output for the multiple runs of the same operation.
<br/>&emsp;&emsp;&emsp;&nbsp;&nbsp;The language should produce the same data type as output for multiple expressions using the same data types and operator.

---

## <a name="env-reqs" id="env-reqs"/> 5.4 Environment Requirements
_Bang!_ has no specific operating system required. The environment requirements a _Bang!_ developer will need are as follows:

- A machine with access to the command line
- Some kind of text editor to write _Bang!_ scripts on
- Yarn
- TypeScript