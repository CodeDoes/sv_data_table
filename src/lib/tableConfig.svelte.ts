import { browser } from "$app/environment";
import z from "zod";

type CommonFormWidget = {
  form?: string;
} & (
  | {
      type: "submit";
      label: string;
    }
  | ({
      name: string;
      list?: string;
    } & (
      | {
          type: "number";
          value: number;
        }
      | {
          type: "search";
          value: string;
        }
      | {
          type: "text";
          value: string;
        }
    ))
);

type CommonLabelWidget = {
  label: string;
} & (
  | {
      type: "label";
    }
  | {
      type: "button";
      onclick: () => void;
    }
  | {
      type: "link";
      href: string;
    }
);

export type CommonWidget = CommonLabelWidget | CommonFormWidget;
type HeaderLabelWidget = {
  type: "header-label";
  label: string;
};

export type CellWidget = CommonWidget | HeaderLabelWidget;
export type TableRow<K extends string = any> =
  | {
      cells: {
        [k in K]?: CellWidget;
      };
    }
  | { widgets: CommonWidget[] };

export type TableState<K extends string = any> = {
  columnOrders: K[];
  columnWidths: Record<K, string>;
  datalists?: Record<string, Record<string, string>>;
  forms?: Record<
    string,
    {
      method: "GET" | "POST";
      action?: string;
      defaultValues?: Record<string, string>;
    }
  >;
  rowgroups: Record<"header" | "body" | "footer", TableRow<K>[]>;
};

export function createProxy<
  K extends keyof I = any,
  I extends Record<string, any> = any
>(item: I, key: K, config: Omit<CommonWidget & { value: any }, "value">) {
  return {
    ...config,
    get value() {
      return item[key];
    },
    set value(v) {
      item[key] = v;
    },
  };
}
export function createItemRowCells<K extends string = any>(
  item: Record<K, any>,
  fields: Record<K, { type: "text" | "number"; list?: string; form?: string }>,
  prefix: string = ""
): (TableRow<K> & { cells: any })["cells"] {
  return Object.fromEntries(
    Object.entries(fields).map(([k, f]) => [
      k,
      {
        type: fields[k as keyof typeof fields]!.type,
        list: fields[k as keyof typeof fields]!.list,
        name: `${prefix}${k}`,
        get value() {
          return Reflect.get(item, k);
        },
        set value(v) {
          Reflect.set(item, k, v);
        },
      } satisfies CommonWidget,
    ])
  );
}
export function toPairs<K extends string = any, V = any>(
  record: Record<K, V>
): [K, V][] {
  return Object.entries(record) as any;
}
export function fromPairs<K extends string = any, V = any>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as any;
}
export function toKeys<K extends string = any>(record: Record<K, any>): K[] {
  return Object.keys(record) as any;
}
export function createRowGroupsTableState<
  K extends string = any,
  I extends Record<K, string | number> = any
>({
  localStorageKey,
  columnConfig,
  items,
}: {
  localStorageKey: string;
  columnConfig: { [k in K]: { type: "text" | "number"; label: string } };
  items: I[];
}): TableState<K> {
  const cEntries = toPairs(columnConfig);
  const cKeys = toKeys(columnConfig);
  const tableState: TableState<K> = $state({
    columnOrders: cKeys as any[],
    columnWidths: fromPairs(cKeys.map((k) => [k, "auto"] as const)),
    rowgroups: {
      header: [
        {
          cells: fromPairs(
            cEntries.map(
              ([k, c]) =>
                [
                  k,
                  {
                    type: "header-label",
                    label: c.label,
                  } satisfies HeaderLabelWidget,
                ] as const
            )
          ) as { [k in K]: CellWidget },
        },
      ],
      body: items.map((item, index) => ({
        cells: fromPairs(
          toPairs(columnConfig).flatMap(([k, c]) => {
            return c.type
              ? ([
                  [
                    k,
                    {
                      type: c.type,
                      name: `items-${index}-${k}`,
                      get value() {
                        return Reflect.get(item, k) as any;
                      },
                      set value(v) {
                        Reflect.set(item, k, v as any);
                      },
                    } satisfies CellWidget,
                  ],
                ] as const)
              : ([] as const);
          })
        ) as { [k in K]: CellWidget },
      })),
      footer: [],
    },
  });
  const columnOrdersValidator = z
    .string()
    .array()
    .pipe(
      z
        .literal(tableState.columnOrders)
        .array()
        .refine(
          (vs) => tableState.columnOrders.every((co) => vs.includes(co)),
          {
            error: `Array must contain all required values in ${tableState.columnOrders}`,
          }
        )
        .refine((vs) => new Set(vs).size == vs.length, {
          error: "All items must be unique, no duplicate values allowed.",
        })
    );
  const columnOrdersCacheKey = localStorageKey + "-columnOrders";
  const columnWidthsCacheKey = localStorageKey + "-columnWidths";
  const columnWidthsValidator = z
    .record(z.string(), z.string())
    .meta({ description: "Base columnWidths validator" })
    .pipe(z.record(z.literal(tableState.columnOrders), z.string()));
  if (browser) {
    const savedOrders = columnOrdersValidator.safeParse(
      JSON.parse(localStorage.getItem(columnOrdersCacheKey) || "[]"),
      {
        reportInput: true,
      }
    );
    const savedWidths = columnWidthsValidator.safeParse(
      JSON.parse(localStorage.getItem(columnWidthsCacheKey) || "{}"),
      { reportInput: true }
    );
    if (savedOrders.success) {
      tableState.columnOrders = savedOrders.data;
    }
    if (savedWidths.success) {
      tableState.columnWidths = savedWidths.data;
    }
  }
  $effect(() => {
    if (browser) {
      localStorage.setItem(
        columnOrdersCacheKey,
        JSON.stringify(tableState.columnOrders)
      );
    }
  });
  $effect(() => {
    if (browser) {
      localStorage.setItem(
        columnWidthsCacheKey,
        JSON.stringify(tableState.columnWidths)
      );
    }
  });
  return tableState;
}
