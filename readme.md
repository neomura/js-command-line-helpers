# neomura/js-command-line-helpers

Helpers for writing command line tools using NodeJS.

[MIT licensed](./license.md).

## Usage

### Parsing command line arguments

Given the following javascript file:

```ts
import { parseCommandLineArguments } from "@neomura/js-command-line-helpers";

const parsed = parseCommandLineArguments(
  "example name",
  "example help text",
  {
    strings: {
      exampleStringName: {
        name: {
          short: "esn",
          long: "example-string-name",
        },
        helpText: "example string name's example help text",
        argumentHelpText: "example string name's example argument help text",
        length: {
          minimum: 5,
          maximum: 20,
        },
      },
    },
    integers: {
      exampleIntegerName: {
        name: {
          short: "ein",
          long: "example-integer-name",
        },
        helpText: "example integer name's example help text",
        argumentHelpText: "example integer name's example argument help text",
        minimum: 5,
        maximum: 20,
      },
    },
    enums: {
      exampleEnumName: {
        name: {
          short: "een",
          long: "example-enum-name",
        },
        helpText: "example enum name's example help text",
        options: {
          exampleOptionA: {
            name: {
              short: "eoa",
              long: "example-option-a"
            },
            helpText: "example option a's example help text",
          },
          exampleOptionB: {
            name: {
              short: "eob",
              long: "example-option-b"
            },
            helpText: "example option b's example help text",
          },
        },
      },
    },
  }
)

console.log(JSON.stringify(parsed, null, 2));
```

The following may occur:

#### Help

If the command line arguments include the text "-h", "--help" or "/?", the process will exit with code 0 and help similar to the following will be written to stdout:

```
example name - example help text
  usage: example name [options]
  options:
    -h, --help, /?: display this message
    -ein, --example-integer-name [example integer name's example argument help text]: example integer name's example help text
    -esn, --example-string-name [example string name's example argument help text]: example string name's example help text
    -een, --example-enum-name [eoa|example-option-a|eob|example-option-b]: example enum name's example help text
      eoa, example-option-a: example option a's example help text
      eob, example-option-b: example option b's example help text
```

#### Invalid

If the command line arguments fail to validate, the process will exit with code 1 and a message similar to the following will be written to stderr:

```
command-line argument -ein/--example-integer-name given multiple times.
```

#### Valid

If the command line arguments are valid, the arguments will be returned in an object:

```json
{
  "strings": {
    "exampleStringName": "example string value"
  },
  "integers": {
    "exampleIntegerName": 7
  },
  "enums": {
    "exampleEnumName": "exampleOptionA"
  }
}
```

### Running asynchronous code

Given the following javascript file:

```ts
import { runMain } from "@neomura/js-command-line-helpers";

runMain(async () => {
  console.log("hello world");
});
```

The async callback will be executed.

On resolution, the process will exit with code 0.

On rejection, the process will exit with code 1 and write the reason to stderr.
