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
  // fields: K[];
  columnOrders: K[];
  columnWidths: { [k in K]: string };
  datalists?: {
    [k: string]: { [k: string]: string };
  };
  rowgroups: {
    [k in "header" | "body" | "footer"]: TableRow<K>[];
  };
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
  fields: Record<K, { type: "text" | "number"; list?: string }>,
  prefix: string = ""
): (TableRow<K> & { cells: any })["cells"] {
  return Object.fromEntries(
    Object.entries(fields).map(([k, f]) => [
      k,
      {
        type: fields[k as keyof typeof fields].type,
        list: fields[k as keyof typeof fields].list,
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
