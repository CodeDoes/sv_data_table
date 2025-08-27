<script lang="ts">
  import Datatable from "$lib/Datatable.svelte";
  import { itemsTableConfig, type Item } from "$lib/itemsTableConfig";
  import type { TableConfig, TableData } from "$lib/tableConfig";

  let items = $state(
    [...Array(10)].map(() => ({ a: 111111, b: 222222, c: 33333, d: 11 }))
  );
  let tableData = $state({
    item_rows: itemsTableConfig.createItemRows(items),
  } satisfies TableData<typeof itemsTableConfig>);
</script>

<div class="page-container">
  <Datatable bind:tableData tableConfig={itemsTableConfig} />
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
