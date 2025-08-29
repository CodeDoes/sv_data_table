<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { getNavLinks } from "$lib/navlinks.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>
<div class="app">
  <div class="header">
    {#each getNavLinks() as link}
      <a href={link.href} class="link" class:active={link.active}
        >{link.label}</a
      >
    {/each}
  </div>
  <div class="body">
    {@render children?.()}
  </div>
</div>

<style>
  :root {
    color-scheme: dark;
  }
  :global(body) {
    margin: 0;
  }
  .header {
    display: flex;
    flex-direction: row;
  }
  a.link {
    all: unset;
    cursor: pointer;
    border: thin solid cyan;
    background-color: darkcyan;
    padding: 0.2em;
    width: 6em;
    box-sizing: border-box;
  }
  a.link.active {
    cursor: default;
    background-color: darkslategrey;
    border-color: darkcyan;
  }
</style>
