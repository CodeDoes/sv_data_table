import z from "zod";
import { createProxy, type TableState } from "../lib/tableConfig.svelte";

import { browser } from "$app/environment";
import { resolve } from "$app/paths";
export type Item = {
  a: number;
  b: number;
  c: number;
  d: number;
};
export function getSubState() {
  let substate: Pick<
    TableState<keyof Item>,
    "columnOrders" | "columnWidths"
  > = $state({
    columnOrders: ["a", "b", "c", "d"],
    columnWidths: {
      a: "auto",
      b: "auto",
      c: "auto",
      d: "auto",
    },
  });
  const columnOrdersValidator = z
    .string()
    .array()
    .pipe(
      z
        .literal(substate.columnOrders)
        .array()
        .refine((vs) => substate.columnOrders.every((co) => vs.includes(co)), {
          error: `Array must contain all required values in ${substate.columnOrders}`,
        })
        .refine((vs) => new Set(vs).size == vs.length, {
          error: "All items must be unique, no duplicate values allowed.",
        })
    );
  const columnOrdersCacheKey = "itemTableConfig-columnOrders";
  const columnWidthsCacheKey = "itemTableConfig-columnWidths";
  const columnWidthsValidator = z
    .record(z.string(), z.string())
    .meta({ description: "Base columnWidths validator" })
    .pipe(z.record(z.literal(substate.columnOrders), z.string()));
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
      substate.columnOrders = savedOrders.data;
    }
    if (savedWidths.success) {
      substate.columnWidths = savedWidths.data;
    }
  }
  $effect(() => {
    if (browser) {
      localStorage.setItem(
        columnOrdersCacheKey,
        JSON.stringify(substate.columnOrders)
      );
    }
  });
  $effect(() => {
    if (browser) {
      localStorage.setItem(
        columnWidthsCacheKey,
        JSON.stringify(substate.columnWidths)
      );
    }
  });
  return substate;
}
export function createTableState(items: Item[]): TableState<keyof Item> {
  const substate = $state(getSubState());
  return {
    get columnOrders() {
      return substate.columnOrders;
    },
    get columnWidths() {
      return substate.columnWidths;
    },
    rowgroups: {
      header: [
        {
          widgets: [
            { type: "submit", label: "Filter", form: "filter-form" },
            {
              type: "label",
              get label() {
                return `${JSON.stringify(
                  substate.columnOrders
                )} ${JSON.stringify(substate.columnWidths)}`;
              },
            },
          ],
        },
        {
          cells: {
            a: { type: "search", value: "", form: "filter-form", name: "a" },
            b: { type: "search", value: "", form: "filter-form", name: "b" },
            c: { type: "search", value: "", form: "filter-form", name: "c" },
            d: { type: "search", value: "", form: "filter-form", name: "d" },
          },
        },
        {
          cells: {
            a: { type: "header-label", label: "A" },
            b: { type: "header-label", label: "B" },
            c: { type: "header-label", label: "C" },
            d: { type: "header-label", label: "D" },
          },
        },
      ],
      body: items.map((item, i) => ({
        cells: {
          a: {
            type: "number",
            form: "update-form",
            name: `items-${i}-a`,
            get value() {
              return item.a;
            },
            set value(v) {
              item.a = v;
            },
          },
          b: {
            type: "number",
            form: "update-form",
            name: `items-${i}-b`,
            get value() {
              return item.b;
            },
            set value(v) {
              item.b = v;
            },
          },
          c: {
            type: "number",
            form: "update-form",
            name: `items-${i}-c`,
            get value() {
              return item.c;
            },
            set value(v) {
              item.c = v;
            },
          },
          d: {
            type: "number",
            form: "update-form",
            name: `items-${i}-d`,
            get value() {
              return item.d;
            },
            set value(v) {
              item.d = v;
            },
          },
        },
      })),
      footer: [
        { widgets: [{ type: "submit", label: "Update", form: "update-form" }] },
      ],
    },
  } as const;
}
