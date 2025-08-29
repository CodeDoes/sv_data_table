import _csvArrayUrl from "$lib/data/locations.json?url";
import {
  formLoc,
  toFormLocConverter,
  fantasyLocationValidator,
} from "$lib/locations.svelte";
import { error } from "console";
import * as fs from "fs";
import * as path from "path";
import z from "zod";
const jsonPath = path.join(process.cwd(), _csvArrayUrl);
export async function load() {
  const raw = fs.readFileSync(jsonPath, { encoding: "utf8" });
  return {
    items: toFormLocConverter.array().parse(JSON.parse(raw)),
  };
}
export const actions = {
  async default(e) {
    const raw = await e.request.formData();
    const formKeyRegex = /([^-]*)\-([^-]*)\-([^-]*)/;
    const formDataEntriesValidator = z
      .tuple([
        z
          .string()
          .regex(formKeyRegex)
          .transform(
            (v) => Array.from(formKeyRegex.exec(v)!) as [string, string, string]
          ),
        z.string(),
      ])
      .transform((e) => [...e[0], e[1]])
      .pipe(z.string().array())
      .array();
    const items = formDataEntriesValidator
      .transform((es) => Object.assign({}, ...es))
      .pipe(formLoc)
      .parse(raw.entries());
  },
};
