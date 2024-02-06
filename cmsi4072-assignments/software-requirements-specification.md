# Table of Contents
5.1 [Introduction](#introduction)

5.2 [Functional Requirements](#func-reqs)

# Requirements

## <a name="introduction" id="introduction"></a> 5.1 Introduction
The programming language _Bang!_ is a dynamically and weakly typed expression-based scripting language that prioritizes concise syntax and flexibility. The language requires developers to have TypeScript, Yarn, and a text editor on their machine. The user can enter a command into their command line to run a script they write in _Bang!_. Language documentation is provided through Notion for developers' reference when writing scripts.

Below is a UML State Diagram depicting the order of the components in the interpreter.

![UML State Diagram](./uml-state-diagram.jpeg)

The remainder of this document is structured as follows. [Section 5.2](#func-reqs) contains the functional requirements, which describe what the completed interpreter can be expected to have. [Section 5.3](#perform-reqs) contains the performance requirements, which include requirements regarding runtime. [Section 5.4](#env-reqs) contains the environment requirements, which lists any additional software requirements the user needs to have installed.

## <a name="func-reqs" id="func-reqs"></a> 5.2 Functional Requirements
The interpreter for _Bang!_ is divided into a few components: the [lexer](#lexer), which groups symbols into tokens; the [parser](#parser), which groups tokens into sentences; the [analyzer](#analyzer), which adds contextual meaning to the abstract syntax tree; the [optimizer](#optimizer), which performs optimizations to decrease the interpreter's runtime; and the [interpreter](#interpreter), which runs the script and produces any necessary output.

### <a name="lexer" id="lexer"></a> 5.2.1 Lexer
The lexer groups symbols (i.e. characters) into tokens that can be passed to the [parser](#parser) (the next step of the interpreter). The following requirements are levied on the lexer.

5.2.1.1 The lexer shall take a string as input to parse.

5.2.1.2 The lexer shall use regular expressions to group the input into tokens.

5.2.1.3 The lexer shall pass the resulting tokens to the parser as a list of tokens.

### <a name="parser" id="parser"></a> 5.2.2 Parser
The parser groups the tokens passed from the lexer into sentences and constructs the abstract syntax tree (AST) from the resulting sentences.

5.2.2.1 The parser shall read the tokens passed from the lexer as input.

5.2.2.2 The parser shall group tokens into sentences.

5.2.2.3 The parser shall connect the AST as sentences are formed.

5.2.2.4 The parser shall pass the resulting AST to the analyzer.

### <a name="analyzer" id="analyzer"></a> 5.2.3 Analyzer
The analyzer adds contextual meaning to the abstract syntax tree (AST) passed from the parser.

5.2.3.1 The analyzer shall receive the AST from the parser as input.

5.2.3.2 The analyzer shall decorate the AST with potential data types.

5.2.3.3 The analyzer shall unroll syntactic sugar into the lengthier equivalent.

5.2.3.4 The analyzer shall track what variables are in scope.

5.2.3.5 The analyzer shall link references to already declared variables to the object in context.

5.2.3.6 The analyzer shall throw an error when `const` variables aren't initialized to an explicit value.

5.2.3.7 The analyzer shall throw an error when `break` is used outside of a loop.

5.2.3.8 The analyzer shall pass the decorated AST to the optimizer.

### <a name="optimizer" id="optimizer"></a> 5.2.4 Optimizer
The optimizer performs optimizations that decrease the overall runtime of the interpreter.

5.2.4.1 The optimizer shall receive the decorated AST from the analyzer as input.

5.2.4.2 The optimizer shall unroll loops with a set number of iterations.

5.2.4.3 The optimizer shall perform constant folding on numbers.

5.2.4.4 The optimizer shall delete dead code.

<!-- Describe features that completed system can be expected to have. Describe what completed system will do, but without describing how it will be accomplished. Each subsection should describe a single discrete functional requirement w/ a meaningful name.
All "shall" statements must be numbered.
No "will" or "should" statements should be numbered.
No "and" (that should be two statements).
"Will" and "should" statements MUST be associated with a requirement statement. The requirement statement should immediately precede the "will" or "should" statment in this case.
There can be more than one "will" or "should" statment associated with any "shall" statement.
When specifying performance requirements, be careful about specifying ranges of performance measures. They may come back to bite you in the end.
Try to write your requirements so they are testable statements.
Watch out for "weasel words" (ambiguous words) -->