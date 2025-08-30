<script lang="ts">
  import {
    createTableState,
    type FantasyCharacter,
  } from "./characters.svelte";
  import Datatable from "$lib/Datatable.svelte";
  import { onMount } from "svelte";
  import { getItems, updateItems } from "./data.remote";
  import { createRowGroupsTableState, type TableState } from "$lib/tableConfig.svelte";
  let items: FantasyCharacter[] = $state([]);
  async function getItemsWrapper() {
    items = await getItems();
    return items;
  }
  let tableState = $derived(createTableState(getItemsWrapper, updateItems));
</script>

{#if tableState != null}
  <Datatable bind:tableState />
{/if}
{JSON.stringify(items)}
