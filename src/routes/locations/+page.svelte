<script lang="ts">
  import Datatable from "$lib/Datatable.svelte";
  import {
    createTableState,
    type FantasyLocation,
    type FormLoc,
  } from "./locations.svelte.js";
  import { createRowGroupsTableState } from "$lib/tableConfig.svelte.js";

  let { data } = $props();
  let items = $state(data.items);
  let tableState = $derived(
    createRowGroupsTableState({
      localStorageKey: "locations-",
      columnConfig: {
        name: { label: "Name", type: "text" },
        type: { label: "Type", type: "text" },
        description: { label: "Description", type: "text" },
        inhabitants: { label: "Inhabitants", type: "text" },
        coordinates: { label: "Coordinates", type: "text" },
      },
      items,
    })
  );
</script>

<Datatable bind:tableState />
{JSON.stringify(items)}
