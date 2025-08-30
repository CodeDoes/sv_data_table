import z from "zod";
import {
  createItemRowCells,
  createProxy,
  type TableRow,
  type TableState,
} from "$lib/tableConfig.svelte";

import { browser } from "$app/environment";
import { resolve } from "$app/paths";
export const fantasyCharacterValidator = z.object({
  character: z.string(),
  race: z.string(),
  class: z.string(),
  level: z
    .union([z.string().regex(/\d+/).transform(Number), z.number()])
    .pipe(z.int()),
  home_realm: z.string(),
  notable_achievement: z.string(),
  primary_magic_type: z.string(),
});
export type FantasyCharacter = z.infer<typeof fantasyCharacterValidator>;
export function getSubState() {
  let substate: Pick<
    TableState<keyof FantasyCharacter>,
    "columnOrders" | "columnWidths"
  > = $state({
    columnOrders: [
      "character",
      "race",
      "class",
      "level",
      "home_realm",
      "notable_achievement",
      "primary_magic_type",
    ],
    columnWidths: {
      character: "125px",
      race: "155px",
      class: "116px",
      level: "95px",
      home_realm: "239px",
      notable_achievement: "258px",
      primary_magic_type: "214px",
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
    try {
      const savedOrders = columnOrdersValidator.safeParse(
        JSON.parse(localStorage.getItem(columnOrdersCacheKey) || "[]"),
        {
          reportInput: true,
        }
      );
      if (savedOrders.success) {
        substate.columnOrders = savedOrders.data;
      }
    } catch {}
    try {
      const savedWidths = columnWidthsValidator.safeParse(
        JSON.parse(localStorage.getItem(columnWidthsCacheKey) || "{}"),
        { reportInput: true }
      );
      if (savedWidths.success) {
        substate.columnWidths = savedWidths.data;
      }
    } catch {}
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
export function createTableState(
  getItems: () => Promise<FantasyCharacter[]>,
  updateItems: (items: FantasyCharacter[]) => Promise<void>
): TableState<keyof FantasyCharacter> {
  let items: FantasyCharacter[] = $state([]);
  getItems().then((vs) => (items = vs));
  const substate = $state(getSubState());
  return {
    get columnOrders() {
      return substate.columnOrders;
    },
    get columnWidths() {
      return substate.columnWidths;
    },
    get datalists() {
      function c(field: keyof (typeof items)[number]) {
        return Object.fromEntries(
          items.map((c) => [`${c[field]}`, `${c[field]}`])
        );
      }
      return {
        character: c("character"),
        race: c("race"),
        class: c("class"),
        level: c("level"),
        home_realm: c("home_realm"),
        notable_achievement: c("notable_achievement"),
        primary_magic_type: c("primary_magic_type"),
      } as const;
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
          cells: {},
        },
        {
          cells: {
            character: { type: "header-label", label: "Character" },
            race: { type: "header-label", label: "Race" },
            class: { type: "header-label", label: "Class" },
            level: { type: "header-label", label: "Level" },
            home_realm: { type: "header-label", label: "Home_Realm" },
            notable_achievement: {
              type: "header-label",
              label: "Notable_Achievement",
            },
            primary_magic_type: {
              type: "header-label",
              label: "Primary_Magic_Type",
            },
          },
        },
      ],
      get body() {
        return items.map<TableRow<keyof FantasyCharacter>>((item, i) => ({
          cells: createItemRowCells(item, {
            character: { type: "text", list: "character" },
            race: { type: "text", list: "race" },
            class: { type: "text", list: "class" },
            level: { type: "number", list: "level" },
            home_realm: { type: "text", list: "home_realm" },
            notable_achievement: { type: "text", list: "notable_achievement" },
            primary_magic_type: { type: "text", list: "primary_magic_type" },
          }),
        }));
      },
      footer: [
        {
          widgets: [
            {
              type: "button",
              label: "Update",
              onclick: async () => {
                await updateItems(items);
              },
            },
          ],
        },
      ],
    },
  } as const;
}
