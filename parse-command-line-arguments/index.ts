import { CommandLineArgumentSet } from "./command-line-argument-set";
import { CommandLineParameterSet } from "./command-line-parameter-set";

export { CommandLineArgumentSet } from "./command-line-argument-set";
export { CommandLineParameterSet } from "./command-line-parameter-set";

function fail(message: string): void {
  console.error(message);

  // We have to throw something to stop execution if process.exit doesn't really
  // exit (like in tests).
  throw process.exit(1);
}

export function parseCommandLineArguments<
  TStringKey extends string,
  TIntegerKey extends string,
  TEnums extends { readonly [key: string]: string },
  TBooleanKey extends string
>(
  name: string,
  version: string,
  helpText: string,
  commandLineParameterSet: CommandLineParameterSet<
    TStringKey,
    TIntegerKey,
    TEnums,
    TBooleanKey
  >
): CommandLineArgumentSet<TStringKey, TIntegerKey, TEnums, TBooleanKey> {
  if (
    [`-h`, `--help`, `/?`].some((keyword) => process.argv.includes(keyword))
  ) {
    const options: string[] = [];

    for (const key in commandLineParameterSet.strings) {
      const parameter = commandLineParameterSet.strings[key];
      options.push(
        `\n    -${parameter.name.short}, --${parameter.name.long} [${parameter.argumentHelpText}]: ${parameter.helpText}`
      );
    }

    for (const key in commandLineParameterSet.integers) {
      const parameter = commandLineParameterSet.integers[key];
      options.push(
        `\n    -${parameter.name.short}, --${parameter.name.long} [${parameter.argumentHelpText}]: ${parameter.helpText}`
      );
    }

    for (const key in commandLineParameterSet.booleans) {
      const parameter = commandLineParameterSet.booleans[key];
      options.push(
        `\n    -${parameter.name.short}, --${parameter.name.long}: ${parameter.helpText}`
      );
    }

    for (const parameterKey in commandLineParameterSet.enums) {
      const parameter = commandLineParameterSet.enums[parameterKey];

      const names: string[] = [];
      const postOptions: string[] = [];

      for (const option of Object.values(parameter.options) as ReadonlyArray<{
        readonly name: {
          readonly short: string;
          readonly long: string;
        };
        readonly helpText: string;
      }>) {
        names.push(option.name.short);
        names.push(option.name.long);

        postOptions.push(
          `\n      ${option.name.short}, ${option.name.long}: ${option.helpText}`
        );
      }

      options.push(
        `\n    -${parameter.name.short}, --${parameter.name.long} [${names.join(
          `|`
        )}]: ${parameter.helpText}${postOptions.join(``)}`
      );
    }

    console.log(`${name} (${version}) - ${helpText}
  usage: ${name} [options]
  options:
    -h, --help, /?: display this message${options.sort().join(``)}`);

    throw process.exit(0);
  }

  const argumentUsed = process.argv.map(() => false);
  argumentUsed[0] = true;
  argumentUsed[1] = true;

  const commandLineParameterIndices: { [key: string]: number } = {};

  // This makes generically iterating over the parameters easier.
  const namedParameters: {
    readonly [type: string]: {
      readonly [key: string]: {
        readonly name: {
          readonly short: string;
          readonly long: string;
        };
      };
    };
  } = commandLineParameterSet;

  for (let i = 2; i < process.argv.length; i++) {
    const argument = process.argv[i];

    const matchingPrefix = [`--`, `-`].find((prefix) =>
      argument.startsWith(prefix)
    );
    if (matchingPrefix === undefined) {
      continue;
    }

    const name = argument.slice(matchingPrefix.length);
    const nameKey = matchingPrefix === `--` ? `long` : `short`;

    for (const type in namedParameters) {
      const ofType = namedParameters[type];

      for (const key in ofType) {
        const parameter = ofType[key];

        if (parameter.name[nameKey] === name) {
          if (
            Object.prototype.hasOwnProperty.call(
              commandLineParameterIndices,
              key
            )
          ) {
            fail(
              `command-line argument "-${parameter.name.short}"/"--${parameter.name.long}" given multiple times.`
            );
          }

          commandLineParameterIndices[key] = i;
          argumentUsed[i] = true;
        }
      }
    }
  }

  for (const type in namedParameters) {
    const ofType = namedParameters[type];

    if (type !== `booleans`) {
      for (const key in ofType) {
        const parameter = ofType[key];

        if (
          !Object.prototype.hasOwnProperty.call(
            commandLineParameterIndices,
            key
          )
        ) {
          fail(
            `command-line argument "-${parameter.name.short}"/"--${parameter.name.long}" not given.`
          );
        }
      }
    }
  }

  const booleanValues: { [key: string]: boolean } = {};

  for (const key in commandLineParameterSet.booleans) {
    const indexOfArgument = commandLineParameterIndices[key];
    booleanValues[key] = indexOfArgument > 1;
  }

  const stringValues: { [key: string]: string } = {};

  for (const key in commandLineParameterSet.strings) {
    const parameter = commandLineParameterSet.strings[key];

    const indexOfArgument = commandLineParameterIndices[key] + 1;
    if (
      indexOfArgument === process.argv.length ||
      argumentUsed[indexOfArgument]
    ) {
      fail(
        `no argument given for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}".`
      );
    }

    const argumentText = process.argv[indexOfArgument];

    if (argumentText.length < parameter.length.minimum) {
      fail(
        `argument for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}" must contain at least ${parameter.length.minimum} character(s).`
      );
    }

    if (argumentText.length > parameter.length.maximum) {
      fail(
        `argument for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}" cannot contain more than ${parameter.length.maximum} character(s).`
      );
    }

    stringValues[key] = argumentText;
    argumentUsed[indexOfArgument] = true;
  }

  const integerValues: { [key: string]: number } = {};

  for (const key in commandLineParameterSet.integers) {
    const parameter = commandLineParameterSet.integers[key];

    const indexOfArgument = commandLineParameterIndices[key] + 1;
    if (
      indexOfArgument === process.argv.length ||
      argumentUsed[indexOfArgument]
    ) {
      fail(
        `no argument given for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}".`
      );
    }

    const argumentText = process.argv[indexOfArgument];

    if (!/^-?\d+$/.test(argumentText)) {
      fail(
        `argument for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}" must be an integer.`
      );
    }

    const argumentInteger = parseInt(argumentText);

    if (argumentInteger < parameter.minimum) {
      fail(
        `argument for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}" must be at least ${parameter.minimum}.`
      );
    }

    if (argumentInteger > parameter.maximum) {
      fail(
        `argument for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}" cannot be greater than ${parameter.maximum}.`
      );
    }

    integerValues[key] = argumentInteger;
    argumentUsed[indexOfArgument] = true;
  }

  const enumValues: { [TKey in keyof TEnums]?: string } = {};

  for (const key in commandLineParameterSet.enums) {
    const parameter = commandLineParameterSet.enums[key];

    const indexOfArgument = commandLineParameterIndices[key] + 1;
    if (
      indexOfArgument === process.argv.length ||
      argumentUsed[indexOfArgument]
    ) {
      fail(
        `no argument given for command-line parameter "-${parameter.name.short}"/"--${parameter.name.long}".`
      );
    }

    const argumentText = process.argv[indexOfArgument];

    const match = (Object.entries(parameter.options) as ReadonlyArray<
      readonly [
        string,
        { readonly name: { readonly short: string; readonly long: string } }
      ]
    >).find(
      (keyValue) =>
        keyValue[1].name.short === argumentText ||
        keyValue[1].name.long === argumentText
    );

    if (match === undefined) {
      const names: string[] = [];

      for (const option of Object.values(parameter.options) as ReadonlyArray<{
        readonly name: {
          readonly short: string;
          readonly long: string;
        };
        readonly helpText: string;
      }>) {
        names.push(option.name.short);
        names.push(option.name.long);
      }

      fail(
        `argument for command-line parameter "-${parameter.name.short}"/"--${
          parameter.name.long
        }" must be one of ${names.join(`, `)}.`
      );
    } else {
      enumValues[key] = match[0];
      argumentUsed[indexOfArgument] = true;
    }
  }

  const indexOfFirstUnusedArgument = argumentUsed.indexOf(false);
  if (indexOfFirstUnusedArgument !== -1) {
    fail(
      `unexpected command-line argument "${process.argv[indexOfFirstUnusedArgument]}".`
    );
  }

  const strings = stringValues as { readonly [TKey in TStringKey]: string };
  const integers = integerValues as { readonly [TKey in TIntegerKey]: number };
  const enums = enumValues as TEnums;
  const booleans = booleanValues as { readonly [TKey in TBooleanKey]: boolean };

  return {
    strings,
    integers,
    enums,
    booleans,
  };
}
