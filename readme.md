# neomura > js command line helpers

helpers for writing command line tools using nodejs.

[mit licensed](./license.md).

## usage

### parsing command line arguments

given the following javascript file:

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
  }
)

console.log(JSON.stringify(parsed, null, 2));
```

the following may occur:

#### help

if the command line arguments include the text "-h", "--help" or "/?", the
process will exit with code 0 and help similar to the following will be written
to stdout:

```
example name - example help text
  usage: example name [options]
  options:
    -h, --help, /?: display this message
    -ein, --example-integer-name [example integer name's example argument help text]: example integer name's example help text
    -esn, --example-string-name [example string name's example argument help text]: example string name's example help text
```

#### invalid

if the command line arguments fail to validate, the process will exit with code
1 and a message similar to the following will be written to stderr:

```
command-line argument -ein/--example-integer-name given multiple times.
```

#### valid

if the command line arguments are valid, the arguments will be returned in an
object:

```json
{
  "strings": {
    "exampleStringName": "example string value"
  },
  "integers": {
    "exampleIntegerName": 7
  }
}
```

### running asynchronous code

given the following javascript file:

```ts
import { runMain } from "@neomura/js-command-line-helpers";

runMain(async () => {
  console.log("hello world");
});
```

the async callback will be executed.

on resolution, the process will exit with code 0.

on rejection, the process will exit with code 1 and write the reason to stderr.
