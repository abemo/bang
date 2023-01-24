![a logo for the programming language bang!, it is big blue bubble letters with a small cartoon explosion coming from the b](docs/logo.png "Logo")

# Bang!

A compiler for the programming language "bang!"

"Bang!" is a dynamically typed, highly concise language focused on prioritizing the features used in fast coding for interviews and competitions.

## Example

| Bang!                                                                                                                                                                                                                                                        | javascript                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `x = 17`<br>`greeting = "hello"`<br>`greeting = 'bye'`<br>`const decayRate = 0.05`                                                                                                                                                                           | `let x = 17`<br>`let greeting = "hello"`<br>`greeting = 'bye'`<br>`const decayRate = 0.05`                                                                                                      |
| `sum = (x, y) -> { x + y }`<br>`sum = (x, y) -> x + y`                                                                                                                                                                                                       | `let sum = function (x, y) { return x + y }`<br>`let sum = (x, y) => x + y`                                                                                                                     |
| `5.times(() -> { print("hello world") })`<br>`5.times(() -> print("hello world"))`<br>`5.times({ print("hello world") })`<br>`5.times(print("hello world"))`                                                                                                 | `for(let _ = 0; _ < 5; _++) console.log("hello world")`                                                                                                                                         |
| `5.times(i -> { print(i)) })`<br>`5.times(i -> print(i))`<br>`5.times(print)`                                                                                                                                                                                | `for(let i = 0; i < 5; i++) console.log(i)`                                                                                                                                                     |
| `isValid ? print("valid!")`                                                                                                                                                                                                                                  | `if (isValid) { console.log("valid!") }`                                                                                                                                                        |
| `isValid ? print("valid!") : print("invalid!")`                                                                                                                                                                                                              | `if (isValid) { console.log("valid!") }`<br>`else { console.log("invalid!") }`                                                                                                                  |
| `optional = isValid ? { return object } : { print("invalid") }`<br>`optional = isValid ? { object } : { print("invalid") }`<br>`optional = isValid ? object : print("invalid")`<br>`objectField = optional?.fieldName`<br>                                   | `let optional`<br>`if (isValid) { optional = object }`<br>`else { console.log("invalid") }`<br>`const objectField = optional?.fieldName`                                                        |
| `const isValid = false`<br>`optional = isValid ? object : print("invalid") // prints "invalid"`<br>`const objectField = optional?.fieldName // objectField = nil`                                                                                            | `const isValid = false`<br>`let optional`<br>`if (isValid) { optional = object }`<br>`else { console.log("invalid") }`<br>`const objectField = optional?.fieldName // objectField is undefined` |
| `isValid = false`<br>`optional = isValid ? object : () -> print("invalid")`<br>`optional?() // prints "invalid"`                                                                                                                                             | `let isValid = false`<br>`let optional = isValid ? object : () => console.log("invalid")`<br>`optional() // prints "invalid"`                                                                   |
| `enum Season { spring, summer, fall, winter }`                                                                                                                                                                                                               |
| <pre>`enum Season { `<br>`  spring = '🌷'`<br>`  summer = '☀️'`<br>`  fall = '🍁'`<br>`  winter = '❄️'`<br>`}`<br>`print(Season.spring.rawTextVal) // prints "🌷"`</pre>                                                                                     | `// TODO: js equivalent`                                                                                                                                                                        |
| <pre>`season = Season.spring`<br>`result = match season {`<br>`  case .spring: "spring!"`<br>`  case .summer: { "summer!" }`<br>`  case .fall, .winter: {`<br>`    str = "is cold!"`<br>`    return str`<br>`  }`<br>`  default: "California!"`<br>`}`</pre> | `// TODO: js equivalent`                                                                                                                                                                        |
| `// insert range function`                                                                                                                                                                                                                                   | `// TODO: js equivalent`                                                                                                                                                                        |

TODO!: nat

Abraham "Abe" Moore Odell is a computer science student at Loyola Marymount University with interests in AI, language design, and game design. Some of his past projects include AI game playing agents, and a video generator.

Aidan Srouji is a third-year CS student at LMU, interested in applying artificial intelligence agents to the field of video game development. Some of his past projects include implementing an automatic speech recognition deep learning model, and creating a text-based multiplayer game run through the Discord platform.

## Code of Conduct

Feel free to add or recommend any features or changes to the language. If you do, please do so with kindness and consideration for all other contributors, users, and people across the globe. "bang!" uses the MIT license.
