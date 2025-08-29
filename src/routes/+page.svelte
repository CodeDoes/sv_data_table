<script lang="ts">
  import { browser } from "$app/environment";
  import Datatable from "$lib/Datatable.svelte";
  import { createTableState } from "$lib/itemsTableConfig.svelte";
  import type {} from "$lib/tableConfig.svelte";
  import { onMount, untrack } from "svelte";
  import z from "zod";

  const items = $state(
    [...Array(20)].map(() => ({ a: 111111, b: 222222, c: 33333, d: 11 }))
  );
  const tableState = $state(createTableState(items));
</script>

<div class="page-container">
  <Datatable {tableState} />
  <div>{JSON.stringify(items)}</div>
</div>

<style>
  .page-container {
    position: relative;
    /* height: 100vh; */
    box-sizing: border-box;
    /* max-height: 100%; */
    overflow: auto;
  }
</style>
