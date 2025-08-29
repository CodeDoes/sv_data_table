import { query, command } from "$app/server";
import * as fs from "fs";
import * as path from "path";
import * as csv from "csv/sync";
import _csvArrayUrl from "$lib/data/characters.csv?url";
import { fantasyCharacterValidator } from "$lib/characters.svelte";
import z from "zod";
const csvPath = path.join(process.cwd(), _csvArrayUrl);

export const getItems = query(async () => {
  return fantasyCharacterValidator.array().parse(
    csv.parse(fs.readFileSync(csvPath), {
      columns: true,
    })
  );
});

export const updateItems = command(
  fantasyCharacterValidator.array(),
  async (items) => {
    const newRaw = csv.stringify(items, {
      columns: Object.keys(fantasyCharacterValidator.shape),
      header: true,
    });
    fs.writeFileSync(csvPath, newRaw);
    console.log(newRaw);
  }
);
