import { z } from "zod";
import {
  createItemRowCells,
  createProxy,
  type TableState,
} from "./tableConfig.svelte";

import { browser } from "$app/environment";
import { resolve } from "$app/paths";

// Define the schema for the nested coordinates object
const coordinatesValidator = z.object({
  x: z.number(),
  y: z.number(),
});

// Define the schema for a single fantasy location
export const fantasyLocationValidator = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  inhabitants: z.array(z.string()),
  coordinates: coordinatesValidator,
});

export const formLoc = z.object({
  name: fantasyLocationValidator.shape.name,
  type: fantasyLocationValidator.shape.type,
  description: fantasyLocationValidator.shape.description,
  inhabitants: z.string(),
  coordinates: z.string().regex(/\d+,\d+/),
});
export const toFormLocConverter = fantasyLocationValidator
  .transform((x) => ({
    ...x,
    inhabitants: x.inhabitants.join(","),
    coordinates: `${x.coordinates.x},${x.coordinates.y}`,
  }))
  .pipe(formLoc);
// Define the schema for the entire array of locations
export type FantasyLocation = z.infer<typeof fantasyLocationValidator>;
export type FormLoc = z.infer<typeof formLoc>;
export function getSubState() {
  let substate: Pick<
    TableState<keyof FantasyLocation>,
    "columnOrders" | "columnWidths"
  > = $state({
    columnOrders: ["name", "type", "description", "inhabitants", "coordinates"],
    columnWidths: {
      name: "auto",
      type: "auto",
      description: "auto",
      inhabitants: "auto",
      coordinates: "auto",
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
export function createTableState(items: FormLoc[]): TableState<keyof FormLoc> {
  const substate = $state(getSubState());
  return {
    get columnOrders() {
      return substate.columnOrders;
    },
    get columnWidths() {
      return substate.columnWidths;
    },
    forms: {
      ["update-form"]: { method: "POST" },
    },
    rowgroups: {
      header: [
        {
          widgets: [
            { type: "submit", label: "Filter", form: "filter-form" },
            {
              type: "link",
              href: resolve("/characters"),
              label: "CSV",
            },
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
            // ["name"]: { type: "search", value: "", name: "name" },
            // ["type"]: { type: "search", value: "", name: "type" },
            // ["description"]: { type: "search", value: "", name: "description" },
            // ["inhabitants"]: { type: "search", value: "", name: "inhabitants" },
            // ["coordinates"]: { type: "search", value: "", name: "coordinates" },
          },
        },
        {
          cells: {
            ["name"]: { type: "header-label", label: "Name" },
            ["type"]: { type: "header-label", label: "Type" },
            ["description"]: { type: "header-label", label: "Description" },
            ["inhabitants"]: { type: "header-label", label: "Inhabitants" },
            ["coordinates"]: { type: "header-label", label: "Coordinates" },
          },
        },
      ],
      body: items.map((item, i) => ({
        cells: createItemRowCells(
          item,
          {
            ["name"]: { type: "text", form: "update-form" },
            ["type"]: { type: "text", form: "update-form" },
            ["description"]: { type: "text", form: "update-form" },
            ["coordinates"]: { type: "text", form: "update-form" },
            ["inhabitants"]: { type: "text", form: "update-form" },
          },
          `locations-${i}-`
        ),
      })),
      footer: [
        { widgets: [{ type: "submit", label: "Update", form: "update-form" }] },
      ],
    },
  } as const;
}
