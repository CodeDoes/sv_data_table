<script lang="ts">
  import { browser } from "$app/environment";
  import Datatable from "$lib/Datatable.svelte";
  import {
    itemsTableConfig as tableConfig,
    type Item,
  } from "$lib/itemsTableConfig";
  import type { TableConfig, TableData } from "$lib/tableConfig";
  import { onMount, untrack } from "svelte";

  let items = $state(
    [...Array(20)].map(() => ({ a: 111111, b: 222222, c: 33333, d: 11 }))
  );
  let tableData = $state({
    order: tableConfig.fields as (typeof tableConfig.fields)[number][],
    item_rows: tableConfig.createItemRows(items),
    columns: tableConfig.createColumns(items),
  } satisfies TableData<typeof tableConfig>);

  let widths = $derived(
    Object.fromEntries(
      tableConfig.fields.map((f) => [f, tableData.columns[f].width] as const)
    ) as Record<string, string>
  );
  onMount(() => {
    const w_raw = localStorage.getItem("itemsTableData-widths");
    if (w_raw) {
      const w = JSON.parse(w_raw);
      for (const f of tableConfig.fields) {
        tableData.columns[f].width = w[f];
      }
    }
    const o_raw = localStorage.getItem("itemsTableData-orders");
    if (o_raw) {
      tableData.order = JSON.parse(o_raw);
    }
  });
  $effect(() => {
    localStorage.setItem(
      "itemsTableData-widths",
      JSON.stringify(widths)
    );
  });
  $effect(() => {
    localStorage.setItem(
      "itemsTableData-orders",
      JSON.stringify(tableData.order)
    );
  });
</script>

<div class="page-container">
  <Datatable bind:tableData />
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
