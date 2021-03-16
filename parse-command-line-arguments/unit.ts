import {
  CommandLineArgumentSet,
  CommandLineParameterSet,
  parseCommandLineArguments,
} from "..";

describe(`parseCommandLineArguments`, () => {
  function withFakedGlobals(
    description: string,
    processArgv: ReadonlyArray<string>,
    act: () => void,
    assert: (
      console: { log(text: string): void; error(text: string): void },
      consoleLog: jasmine.Spy,
      consoleError: jasmine.Spy,
      process: { exit(code: number): void },
      processExit: jasmine.Spy
    ) => void
  ): void {
    describe(description, () => {
      const consoleLog = jasmine.createSpy(`console.log`);
      const consoleError = jasmine.createSpy(`console.error`);
      const mockConsole = {
        log: consoleLog,
        error: consoleError,
      };
      const originalConsole = console;

      const processExit = jasmine.createSpy(`process.exit`);
      const mockProcess = {
        argv: processArgv,
        exit: processExit,
      };
      const originalProcess = process;

      beforeAll(() => {
        const globalAny = global as {
          console: { log(text: string): void; error(text: string): void };
          process: { exit(code: number): void };
        };
        globalAny.console = mockConsole;
        globalAny.process = mockProcess;
      });

      act();

      beforeAll(() => {
        global.console = originalConsole;
        global.process = originalProcess;
      });

      assert(mockConsole, consoleLog, consoleError, mockProcess, processExit);
    });
  }

  type StringKey = "testStringA" | "testStringB";
  type IntegerKey = "testIntegerA" | "testIntegerB";
  type Enum = {
    testEnumA: "testOptionAA" | "testOptionAB" | "testOptionAC";
    testEnumB: "testOptionBA" | "testOptionBB" | "testOptionBC";
  };
  type BooleanKey = "testBooleanA" | "testBooleanB" | "testBooleanC";

  const name = `test name`;
  const helpText = `test help text`;
  const commandLineParameterSet: CommandLineParameterSet<
    StringKey,
    IntegerKey,
    Enum,
    BooleanKey
  > = {
    strings: {
      testStringA: {
        name: {
          short: `test-string-a-short-name`,
          long: `test-string-a-long-name`,
        },
        helpText: `test string a help text`,
        argumentHelpText: `test string a argument help text`,
        length: {
          minimum: 5,
          maximum: 10,
        },
      },
      testStringB: {
        name: {
          short: `test-string-b-short-name`,
          long: `test-string-b-long-name`,
        },
        helpText: `test string b help text`,
        argumentHelpText: `test string b argument help text`,
        length: {
          minimum: 2,
          maximum: 4,
        },
      },
    },
    integers: {
      testIntegerA: {
        name: {
          short: `test-integer-a-short-name`,
          long: `test-integer-a-long-name`,
        },
        helpText: `test integer a help text`,
        argumentHelpText: `test integer a argument help text`,
        minimum: -4,
        maximum: 3,
      },
      testIntegerB: {
        name: {
          short: `test-integer-b-short-name`,
          long: `test-integer-b-long-name`,
        },
        helpText: `test integer b help text`,
        argumentHelpText: `test integer b argument help text`,
        minimum: 12,
        maximum: 24,
      },
    },
    enums: {
      testEnumA: {
        name: {
          short: `test-enum-a-short-name`,
          long: `test-enum-a-long-name`,
        },
        helpText: `test enum a help text`,
        options: {
          testOptionAA: {
            name: {
              short: `test-option-a-a-short-name`,
              long: `test-option-a-a-long-name`,
            },
            helpText: `test option a a help text`,
          },
          testOptionAB: {
            name: {
              short: `test-option-a-b-short-name`,
              long: `test-option-a-b-long-name`,
            },
            helpText: `test option a b help text`,
          },
          testOptionAC: {
            name: {
              short: `test-option-a-c-short-name`,
              long: `test-option-a-c-long-name`,
            },
            helpText: `test option a c help text`,
          },
        },
      },
      testEnumB: {
        name: {
          short: `test-enum-b-short-name`,
          long: `test-enum-b-long-name`,
        },
        helpText: `test enum b help text`,
        options: {
          testOptionBA: {
            name: {
              short: `test-option-b-a-short-name`,
              long: `test-option-b-a-long-name`,
            },
            helpText: `test option b a help text`,
          },
          testOptionBB: {
            name: {
              short: `test-option-b-b-short-name`,
              long: `test-option-b-b-long-name`,
            },
            helpText: `test option b b help text`,
          },
          testOptionBC: {
            name: {
              short: `test-option-b-c-short-name`,
              long: `test-option-b-c-long-name`,
            },
            helpText: `test option b c help text`,
          },
        },
      },
    },
    booleans: {
      testBooleanA: {
        name: {
          short: `test-boolean-a-short-name`,
          long: `test-boolean-a-long-name`,
        },
        helpText: `test boolean a help text`,
      },
      testBooleanB: {
        name: {
          short: `test-boolean-b-short-name`,
          long: `test-boolean-b-long-name`,
        },
        helpText: `test boolean b help text`,
      },
      testBooleanC: {
        name: {
          short: `test-boolean-c-short-name`,
          long: `test-boolean-c-long-name`,
        },
        helpText: `test boolean c help text`,
      },
    },
  };

  function showsHelp(description: string, argv: ReadonlyArray<string>): void {
    withFakedGlobals(
      description,
      argv,
      () => {
        beforeAll(() => {
          try {
            parseCommandLineArguments(name, helpText, commandLineParameterSet);
          } catch {}
        });
      },
      (mockConsole, consoleLog, consoleError, mockProcess, processExit) => {
        it(`logs success once`, () => {
          expect(consoleLog).toHaveBeenCalledTimes(1);
        });

        it(`uses the correct "this" when logging success`, () => {
          expect(consoleLog.calls.first().object).toBe(mockConsole);
        });

        it(`logs the expected message`, () => {
          expect(consoleLog).toHaveBeenCalledWith(`test name - test help text
  usage: test name [options]
  options:
    -h, --help, /?: display this message
    -test-boolean-a-short-name, --test-boolean-a-long-name: test boolean a help text
    -test-boolean-b-short-name, --test-boolean-b-long-name: test boolean b help text
    -test-boolean-c-short-name, --test-boolean-c-long-name: test boolean c help text
    -test-enum-a-short-name, --test-enum-a-long-name [test-option-a-a-short-name|test-option-a-a-long-name|test-option-a-b-short-name|test-option-a-b-long-name|test-option-a-c-short-name|test-option-a-c-long-name]: test enum a help text
      test-option-a-a-short-name, test-option-a-a-long-name: test option a a help text
      test-option-a-b-short-name, test-option-a-b-long-name: test option a b help text
      test-option-a-c-short-name, test-option-a-c-long-name: test option a c help text
    -test-enum-b-short-name, --test-enum-b-long-name [test-option-b-a-short-name|test-option-b-a-long-name|test-option-b-b-short-name|test-option-b-b-long-name|test-option-b-c-short-name|test-option-b-c-long-name]: test enum b help text
      test-option-b-a-short-name, test-option-b-a-long-name: test option b a help text
      test-option-b-b-short-name, test-option-b-b-long-name: test option b b help text
      test-option-b-c-short-name, test-option-b-c-long-name: test option b c help text
    -test-integer-a-short-name, --test-integer-a-long-name [test integer a argument help text]: test integer a help text
    -test-integer-b-short-name, --test-integer-b-long-name [test integer b argument help text]: test integer b help text
    -test-string-a-short-name, --test-string-a-long-name [test string a argument help text]: test string a help text
    -test-string-b-short-name, --test-string-b-long-name [test string b argument help text]: test string b help text`);
        });

        it(`does not log failure`, () => {
          expect(consoleError).not.toHaveBeenCalled();
        });

        it(`exits once`, () => {
          expect(processExit).toHaveBeenCalledTimes(1);
        });

        it(`uses the correct "this" when exiting`, () => {
          expect(processExit.calls.first().object).toBe(mockProcess);
        });

        it(`exits successfully`, () => {
          expect(processExit).toHaveBeenCalledWith(0);
        });

        it(`exits after logging`, () => {
          expect(consoleLog).toHaveBeenCalledBefore(processExit);
        });
      }
    );
  }

  function accepts(
    description: string,
    argv: ReadonlyArray<string>,
    expectedArguments: CommandLineArgumentSet<
      StringKey,
      IntegerKey,
      Enum,
      BooleanKey
    >
  ): void {
    let actualArguments: CommandLineArgumentSet<
      StringKey,
      IntegerKey,
      Enum,
      BooleanKey
    >;

    withFakedGlobals(
      description,
      argv,
      () => {
        beforeAll(() => {
          actualArguments = parseCommandLineArguments(
            name,
            helpText,
            commandLineParameterSet
          );
        });
      },
      (mockConsole, consoleLog, consoleError, mockProcess, processExit) => {
        mockConsole;
        mockProcess;

        it(`returns the expected arguments`, () => {
          expect(actualArguments).toEqual(expectedArguments);
        });

        it(`does not log success`, () => {
          expect(consoleLog).not.toHaveBeenCalled();
        });

        it(`does not log failure`, () => {
          expect(consoleError).not.toHaveBeenCalled();
        });

        it(`does not exit`, () => {
          expect(processExit).not.toHaveBeenCalled();
        });
      }
    );
  }

  function rejects(
    description: string,
    argv: ReadonlyArray<string>,
    message: string
  ): void {
    withFakedGlobals(
      description,
      argv,
      () => {
        beforeAll(() => {
          try {
            parseCommandLineArguments(name, helpText, commandLineParameterSet);
          } catch {}
        });
      },
      (mockConsole, consoleLog, consoleError, mockProcess, processExit) => {
        it(`does not log success`, () => {
          expect(consoleLog).not.toHaveBeenCalled();
        });

        it(`logs failure once`, () => {
          expect(consoleError).toHaveBeenCalledTimes(1);
        });

        it(`uses the correct "this" when logging that a failure occurred`, () => {
          expect(consoleError.calls.first().object).toBe(mockConsole);
        });

        it(`logs the reason for the failure`, () => {
          expect(consoleError).toHaveBeenCalledWith(message);
        });

        it(`uses the correct "this" when logging the reason for the failure`, () => {
          expect(consoleError.calls.mostRecent().object).toBe(mockConsole);
        });

        it(`exits once`, () => {
          expect(processExit).toHaveBeenCalledTimes(1);
        });

        it(`uses the correct "this" when exiting`, () => {
          expect(processExit.calls.first().object).toBe(mockProcess);
        });

        it(`exits unsuccessfully`, () => {
          expect(processExit).toHaveBeenCalledWith(1);
        });

        it(`exits after logging`, () => {
          expect(processExit).not.toHaveBeenCalledBefore(consoleError);
        });
      }
    );
  }

  showsHelp(`short`, [
    `ignored node process`,
    `ignored javascript file`,
    `-test-string-a-short-name`,
    `t s a arg`,
    `-h`,
    `--test-string-b-long-name`,
    `tba`,
    `-test-integer-a-short-name`,
    `-1`,
    `--test-integer-b-long-name`,
    `18`,
  ]);

  showsHelp(`long`, [
    `ignored node process`,
    `ignored javascript file`,
    `-test-string-a-short-name`,
    `t s a arg`,
    `--help`,
    `--test-string-b-long-name`,
    `tba`,
    `-test-integer-a-short-name`,
    `-1`,
    `--test-integer-b-long-name`,
    `18`,
  ]);

  showsHelp(`windows-style`, [
    `ignored node process`,
    `ignored javascript file`,
    `-test-string-a-short-name`,
    `t s a arg`,
    `-h`,
    `--test-string-b-long-name`,
    `tba`,
    `-test-integer-a-short-name`,
    `-1`,
    `--test-integer-b-long-name`,
    `18`,
  ]);

  accepts(
    `valid`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `t s a arg`,
        testStringB: `tba`,
      },
      integers: {
        testIntegerA: -1,
        testIntegerB: 18,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  rejects(
    `when the argument list starts with an unexpected argument`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `test unexpected argument`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "test unexpected argument".`
  );

  rejects(
    `when unexpected short names are present`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `-test-unexpected-short-name`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "-test-unexpected-short-name".`
  );

  rejects(
    `when unexpected long names are present`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-unexpected-long-name`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "--test-unexpected-long-name".`
  );

  rejects(
    `when an integer's short name is used as a long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `--test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-integer-a-short-name"/"--test-integer-a-long-name" not given.`
  );

  rejects(
    `when an integer's long name is used as a short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `-test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-integer-b-short-name"/"--test-integer-b-long-name" not given.`
  );

  rejects(
    `when an integer is missing`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-integer-a-short-name"/"--test-integer-a-long-name" not given.`
  );

  accepts(
    `when an integer is given by its short name is at its lower bound`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-4`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `t s a arg`,
        testStringB: `tba`,
      },
      integers: {
        testIntegerA: -4,
        testIntegerB: 18,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  accepts(
    `when an integer is given by its short name is at its upper bound`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `3`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `t s a arg`,
        testStringB: `tba`,
      },
      integers: {
        testIntegerA: 3,
        testIntegerB: 18,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  accepts(
    `when an integer is given by its long name is at its lower bound`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `12`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `t s a arg`,
        testStringB: `tba`,
      },
      integers: {
        testIntegerA: -1,
        testIntegerB: 12,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  accepts(
    `when an integer is given by its long name is at its upper bound`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `24`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `t s a arg`,
        testStringB: `tba`,
      },
      integers: {
        testIntegerA: -1,
        testIntegerB: 24,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  rejects(
    `when an integer with a short name has no argument`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `no argument given for command-line parameter "-test-integer-a-short-name"/"--test-integer-a-long-name".`
  );

  rejects(
    `when an integer with a long name has no argument`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `--test-integer-b-long-name`,
      `-test-integer-a-short-name`,
      `-1`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `no argument given for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name".`
  );

  rejects(
    `when an integer with a short name has no argument at the end of the argument list`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
      `-test-integer-b-short-name`,
    ],
    `no argument given for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name".`
  );

  rejects(
    `when an integer with a long name has no argument at the end of the argument list`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
      `--test-integer-b-long-name`,
    ],
    `no argument given for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name".`
  );

  rejects(
    `when an integer with a short name has a decimal point`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1.4`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-a-short-name"/"--test-integer-a-long-name" must be an integer.`
  );

  rejects(
    `when an integer with a long name has a decimal point`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `17.4`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name" must be an integer.`
  );

  rejects(
    `when an integer with a short name uses exponentiation`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1E1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-a-short-name"/"--test-integer-a-long-name" must be an integer.`
  );

  rejects(
    `when an integer with a long name uses exponentiation`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `1E1`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name" must be an integer.`
  );

  rejects(
    `when an integer with a short name contains symbols`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1$2`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-a-short-name"/"--test-integer-a-long-name" must be an integer.`
  );

  rejects(
    `when an integer with a long name contains symbols`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `1$8`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name" must be an integer.`
  );

  rejects(
    `when an integer with a short name is too low`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-5`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-a-short-name"/"--test-integer-a-long-name" must be at least -4.`
  );

  rejects(
    `when an integer with a short name is too high`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `4`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-a-short-name"/"--test-integer-a-long-name" cannot be greater than 3.`
  );

  rejects(
    `when an integer with a long name is too low`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `11`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name" must be at least 12.`
  );

  rejects(
    `when an integer with a long name is too high`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `25`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-integer-b-short-name"/"--test-integer-b-long-name" cannot be greater than 24.`
  );

  rejects(
    `when an integer is given twice by short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `-test-integer-a-short-name`,
      `-3`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-integer-a-short-name"/"--test-integer-a-long-name" given multiple times.`
  );

  rejects(
    `when an integer is given twice by long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-integer-b-long-name`,
      `15`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-integer-b-short-name"/"--test-integer-b-long-name" given multiple times.`
  );

  rejects(
    `when an integer is given twice by short then long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `-test-integer-b-short-name`,
      `15`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-integer-b-short-name"/"--test-integer-b-long-name" given multiple times.`
  );

  rejects(
    `when an integer is given twice by long then short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-integer-a-long-name`,
      `2`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-integer-a-short-name"/"--test-integer-a-long-name" given multiple times.`
  );

  rejects(
    `when an integer with a short name is given two arguments`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `2`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "2".`
  );

  rejects(
    `when an integer with a long name is given two arguments`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `15`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "15".`
  );

  rejects(
    `when a string's short name is used as a long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `--test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-string-a-short-name"/"--test-string-a-long-name" not given.`
  );

  rejects(
    `when a string's long name is used as a short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `-test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-string-b-short-name"/"--test-string-b-long-name" not given.`
  );

  rejects(
    `when a string is missing`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-string-a-short-name"/"--test-string-a-long-name" not given.`
  );

  accepts(
    `when a string is given by its short name at its minimum length`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `tsarg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-4`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `tsarg`,
        testStringB: `tba`,
      },
      integers: {
        testIntegerA: -4,
        testIntegerB: 18,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  accepts(
    `when a string is given by its short name is at its maximum length`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `tstr a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `3`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `tstr a arg`,
        testStringB: `tba`,
      },
      integers: {
        testIntegerA: 3,
        testIntegerB: 18,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  accepts(
    `when a string is given by its long name is at its minimum length`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tb`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `12`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `t s a arg`,
        testStringB: `tb`,
      },
      integers: {
        testIntegerA: -1,
        testIntegerB: 12,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  accepts(
    `when a string is given by its long name is at its maximum length`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tsba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `24`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    {
      strings: {
        testStringA: `t s a arg`,
        testStringB: `tsba`,
      },
      integers: {
        testIntegerA: -1,
        testIntegerB: 24,
      },
      enums: {
        testEnumA: `testOptionAA`,
        testEnumB: `testOptionBC`,
      },
      booleans: {
        testBooleanA: true,
        testBooleanB: false,
        testBooleanC: true,
      },
    }
  );

  rejects(
    `when a string with a short name has no argument`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `no argument given for command-line parameter "-test-string-a-short-name"/"--test-string-a-long-name".`
  );

  rejects(
    `when a string with a long name has no argument`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `no argument given for command-line parameter "-test-string-b-short-name"/"--test-string-b-long-name".`
  );

  rejects(
    `when a string with a short name has no argument at the end of the argument list`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `-test-integer-b-short-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
      `-test-string-a-short-name`,
    ],
    `no argument given for command-line parameter "-test-string-a-short-name"/"--test-string-a-long-name".`
  );

  rejects(
    `when a string with a long name has no argument at the end of the argument list`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
      `--test-string-b-long-name`,
    ],
    `no argument given for command-line parameter "-test-string-b-short-name"/"--test-string-b-long-name".`
  );

  rejects(
    `when a string with a short name is too short`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `tsa`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-string-a-short-name"/"--test-string-a-long-name" must contain at least 5 character(s).`
  );

  rejects(
    `when a string with a short name is too long`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `test arg  a`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-string-a-short-name"/"--test-string-a-long-name" cannot contain more than 10 character(s).`
  );

  rejects(
    `when a string with a long name is too short`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `t`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `11`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-string-b-short-name"/"--test-string-b-long-name" must contain at least 2 character(s).`
  );

  rejects(
    `when a string with a long name is too long`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tbarg`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `25`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-string-b-short-name"/"--test-string-b-long-name" cannot contain more than 4 character(s).`
  );

  rejects(
    `when a string is given twice by short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `-test-string-a-short-name`,
      `test arg a`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-string-a-short-name"/"--test-string-a-long-name" given multiple times.`
  );

  rejects(
    `when a string is given twice by long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-string-b-long-name`,
      `tqq`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-string-b-short-name"/"--test-string-b-long-name" given multiple times.`
  );

  rejects(
    `when a string is given twice by short then long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `--test-string-a-long-name`,
      `q e iiioo`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-string-a-short-name"/"--test-string-a-long-name" given multiple times.`
  );

  rejects(
    `when a string is given twice by long then short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `-test-string-b-short-name`,
      `tqq`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-string-b-short-name"/"--test-string-b-long-name" given multiple times.`
  );

  rejects(
    `when a string with a short name is given two arguments`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `q e iiioo`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "q e iiioo".`
  );

  rejects(
    `when a string with a long name is given two arguments`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `tqq`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "tqq".`
  );

  rejects(
    `when an enum is missing`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `tqq`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-enum-a-short-name"/"--test-enum-a-long-name" not given.`
  );

  rejects(
    `when an enum with a short name is given two arguments`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `test-option-a-c-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "test-option-a-c-long-name".`
  );

  rejects(
    `when an enum with a long name is given two arguments`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `test-option-b-a-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `unexpected command-line argument "test-option-b-a-short-name".`
  );

  rejects(
    `when an enum with a short name has no argument`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `no argument given for command-line parameter "-test-enum-a-short-name"/"--test-enum-a-long-name".`
  );

  rejects(
    `when an enum with a long name has no argument`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `--test-enum-a-long-name`,
      `-test-enum-b-short-name`,
      `test-option-a-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `no argument given for command-line parameter "-test-enum-a-short-name"/"--test-enum-a-long-name".`
  );

  rejects(
    `when an enum with a short name has no argument at the end of the argument list`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `--test-enum-a-long-name`,
      `test-option-a-a-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
      `-test-enum-b-short-name`,
    ],
    `no argument given for command-line parameter "-test-enum-b-short-name"/"--test-enum-b-long-name".`
  );

  rejects(
    `when an enum with a long name has no argument at the end of the argument list`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
      `--test-enum-b-long-name`,
    ],
    `no argument given for command-line parameter "-test-enum-b-short-name"/"--test-enum-b-long-name".`
  );

  rejects(
    `when an enum is given twice by short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `-test-enum-a-short-name`,
      `test-option-a-c-long-name`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-enum-a-short-name"/"--test-enum-a-long-name" given multiple times.`
  );

  rejects(
    `when an enum is given twice by long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-enum-b-long-name`,
      `test-option-b-b-long-name`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-enum-b-short-name"/"--test-enum-b-long-name" given multiple times.`
  );

  rejects(
    `when an enum is given twice by short then long name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `-test-enum-b-short-name`,
      `test-option-b-a-short-name`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-enum-b-short-name"/"--test-enum-b-long-name" given multiple times.`
  );

  rejects(
    `when an enum is given twice by long then short name`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-enum-a-long-name`,
      `test-option-a-c-long-name`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `command-line argument "-test-enum-a-short-name"/"--test-enum-a-long-name" given multiple times.`
  );

  rejects(
    `when an enum is given by short name with an invalid value`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-invalid-value`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-enum-a-short-name"/"--test-enum-a-long-name" must be one of test-option-a-a-short-name, test-option-a-a-long-name, test-option-a-b-short-name, test-option-a-b-long-name, test-option-a-c-short-name, test-option-a-c-long-name.`
  );

  rejects(
    `when an enum is given by long name with an invalid value`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-invalid-value`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-enum-b-short-name"/"--test-enum-b-long-name" must be one of test-option-b-a-short-name, test-option-b-a-long-name, test-option-b-b-short-name, test-option-b-b-long-name, test-option-b-c-short-name, test-option-b-c-long-name.`
  );

  rejects(
    `when an enum is given by short name with another enum's value`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-b-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-b-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-enum-a-short-name"/"--test-enum-a-long-name" must be one of test-option-a-a-short-name, test-option-a-a-long-name, test-option-a-b-short-name, test-option-a-b-long-name, test-option-a-c-short-name, test-option-a-c-long-name.`
  );

  rejects(
    `when an enum is given by long name with another enum's value`,
    [
      `ignored node process`,
      `ignored javascript file`,
      `-test-string-a-short-name`,
      `t s a arg`,
      `--test-string-b-long-name`,
      `tba`,
      `-test-integer-a-short-name`,
      `-1`,
      `--test-integer-b-long-name`,
      `18`,
      `-test-enum-a-short-name`,
      `test-option-a-a-long-name`,
      `--test-enum-b-long-name`,
      `test-option-a-c-short-name`,
      `-test-boolean-a-short-name`,
      `--test-boolean-c-long-name`,
    ],
    `argument for command-line parameter "-test-enum-b-short-name"/"--test-enum-b-long-name" must be one of test-option-b-a-short-name, test-option-b-a-long-name, test-option-b-b-short-name, test-option-b-b-long-name, test-option-b-c-short-name, test-option-b-c-long-name.`
  );

  // todo short short
  // todo long long
  // todo short long
  // todo long short
});
