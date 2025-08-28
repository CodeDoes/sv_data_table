import type { TableConfig } from "./tableConfig";
export type Item = {
  a: number;
  b: number;
  c: number;
  d: number;
};
export const itemsTableConfig = {
  fields: ["a", "b", "c", "d"],
  createColumns(items) {
    return {
      a: { width: "auto", label: "A", type: "number" },
      b: { width: "auto", label: "B", type: "number" },
      c: { width: "auto", label: "C", type: "number" },
      d: { width: "auto", label: "D", type: "number" },
    };
  },
  createItemRows(items) {
    function createProxy<K extends keyof Item>(
      item: Item,
      key: K,
      config: Item[K] extends string
        ? { type: "text" }
        : Item[K] extends number
        ? { type: "number" }
        : never
    ) {
      return {
        ...config,
        get value() {
          return item[key];
        },
        set value(v) {
          item[key] = v;
        },
        defaultValue: item[key],
      };
    }
    return items.map((item) => ({
      a: createProxy(item, "a", { type: "number" }),
      b: createProxy(item, "b", { type: "number" }),
      c: createProxy(item, "c", { type: "number" }),
      d: createProxy(item, "d", { type: "number" }),
    }));
  },
} as const satisfies TableConfig<Item>;
123123;
