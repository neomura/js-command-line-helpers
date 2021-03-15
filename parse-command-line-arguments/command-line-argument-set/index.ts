export type CommandLineArgumentSet<
  TStringKey extends string,
  TIntegerKey extends string,
  TEnums extends { readonly [key: string]: string }
> = {
  readonly strings: {
    readonly [TKey in TStringKey]: string;
  };
  readonly integers: {
    readonly [TKey in TIntegerKey]: number;
  };
  readonly enums: {
    readonly [TKey in keyof TEnums]: TEnums[TKey];
  };
};
