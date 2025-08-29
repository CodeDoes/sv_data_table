<script lang="ts">
  import Datatable from "$lib/Datatable.svelte";
  import {
    createTableState,
    type FantasyLocation,
    type FormLoc,
  } from "$lib/locations.svelte.js";

  let { data } = $props();
  let items = $state(data.items);
  let tableState = $derived(createTableState(items));
</script>

<Datatable bind:tableState />
{JSON.stringify(items)}
