export type ItemRow<K extends string = any> = {
  [k in K]:
    | { type: "number"; value: number; defaultValue: number }
    | { type: "text"; value: string; defaultValue: string };
};
export type TableConfig<
  I extends Record<string, string | number> = any,
  K extends string = any,
  CS extends {
    [k in K]: {
      width: string;
      label: string;
      filter?: { type: "search" };
      type: "number" | "text";
    };
  } = any
> = {
  fields: K[];
  columns: CS;
  createItemRows: (items: I[]) => ItemRow<K>[];
};
export type TableData<TC extends TableConfig = any> = {
  item_rows: ItemRow<TC["fields"][number]>[];
};
