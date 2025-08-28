<script lang="ts">
  import { browser } from "$app/environment";
  import Datatable from "$lib/Datatable.svelte";
  import {
    itemsTableConfig as tableConfig,
    type Item,
  } from "$lib/itemsTableConfig";
  import type { TableConfig, TableData } from "$lib/tableConfig";
  import { onMount, untrack } from "svelte";
  import { z } from "zod";

  let items = $state(
    [...Array(20)].map(() => ({ a: 111111, b: 222222, c: 33333, d: 11 }))
  );
  let tableData = $state({
    order: tableConfig.fields as (typeof tableConfig.fields)[number][],
    item_rows: tableConfig.createItemRows(items),
    columns: tableConfig.createColumns(items),
  } satisfies TableData<typeof tableConfig>);
  const ordersValidator = z.literal(tableConfig.fields).array();
  const widthsValidator = z.record(z.literal(tableConfig.fields), z.string());
  let columnWidths = $derived(
    widthsValidator.parse(
      Object.fromEntries(
        tableConfig.fields.map((f) => [f, tableData.columns[f].width])
      )
    )
  );
  
  async function restoreWidths() {
    const widths = widthsValidator.parse(
      JSON.parse((await cookieStore.get("itemsTableData-columnWidths"))!.value!)
    );
    for (const [f, w] of Object.entries(widths)) {
      Reflect.set(Reflect.get(tableData.columns, f), "width", w);
    }
  }
  async function restoreOrder() {
    tableData.order = ordersValidator.parse(
      (await cookieStore.get("itemsTableData-order"))!.value!
    );
  }
  onMount(async () => {
    if (browser) {
      restoreWidths();
      restoreOrder();
    }
  });
  // $effect(() => {
  //   if (browser) {
  //     saveState(
  //       "itemsTableData-columnWidths",
  //       z
  //         .string()
  //         .transform((v) => JSON.parse(v))
  //         .pipe(widthsValidator)
  //         .encode(columnWidths)
  //     );
  //     saveState(
  //       "itemsTableData-order",
  //       z
  //         .string()
  //         .transform((v) => JSON.parse(v))
  //         .pipe(ordersValidator)
  //         .encode(tableData.order)
  //     );
  //   }
  // });
</script>

<div class="page-container">
  <Datatable bind:tableData {tableConfig} />
</div>

<style>
  .page-container {
    position: relative;
    height: 100vh;
    box-sizing: border-box;
    /* max-height: 100%; */
    overflow: auto;
  }
</style>
