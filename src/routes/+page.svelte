<script lang="ts">
  import { browser } from "$app/environment";
  import Datatable from "$lib/Datatable.svelte";
  import { createRowGroupsTableState } from "$lib/tableConfig.svelte";
  import type { TableState } from "$lib/tableConfig.svelte";
  import { onMount, untrack } from "svelte";
  import z from "zod";

  const items = $state(
    [...Array(20)].map(() => ({ a: 111111, b: 222222, c: 33333, d: 11 }))
  );
  let tableState = $state(
    createRowGroupsTableState({
      localStorageKey:"homepage-item",
      columnConfig: {
        a: { type: "number", label: "A" },
        b: { type: "number", label: "B" },
        c: { type: "number", label: "C" },
      },
      items,
    })
  );
</script>

<div class="page-container">
  <Datatable bind:tableState />
  <div>{JSON.stringify(tableState)}</div>
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
