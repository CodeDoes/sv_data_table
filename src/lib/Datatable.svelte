<script lang="ts" generics="TS extends TableState=any">
  import { flushSync, untrack } from "svelte";
  import type {
    CellWidget,
    TableRow,
    TableState,
    CommonWidget,
  } from "./tableConfig.svelte";

  let {
    tableState = $bindable(),
  }: {
    tableState: TS;
  } = $props();
  const clss = {
    resize: "dragging-column-resizer",
    reorder: "dragging-column-reorder",
  } as const;
  type K = TS["columnOrders"][number];
  const tempState = $state({
    resize: null as K | null,
    reorder: null as K | null,
  });
  const cols_css = $derived(
    tableState.columnOrders
      .map((f) => `[${f}] ${tableState.columnWidths[f]}`)
      .join(" ")
  );
</script>

{#each Object.entries(tableState.forms || {}) as [id, formConfig]}
  <form {id} method={formConfig.method}>
    {#each Object.entries(formConfig.defaultValues || {}) as [k, v]}
      <input type="hidden" name={k} value={v} />
    {/each}
  </form>
{/each}
{#each Object.entries(tableState.datalists || {}) as [id, opts]}
  <datalist {id}>
    {#each Object.entries(opts) as [value, label]}
      <option {value}>{label}</option>
    {/each}
  </datalist>
{/each}
<div class="datatable" style:grid-template-columns={cols_css}>
  <div
    class="datatable-stack-item column-stack-item"
    class:shouldOverlay={tempState.reorder != null}
  >
    {#each tableState.columnOrders as field (field)}
      <button
        aria-label="Column"
        type="button"
        class="column"
        class:activelyReordering={tempState.reorder == field}
        onfocus={(e) => {}}
        onmouseover={(e) => {
          if (tempState.reorder != null && tempState.reorder != field) {
            const ri = tableState.columnOrders.indexOf(tempState.reorder);
            tableState.columnOrders.splice(ri, 1);
            const fi = tableState.columnOrders.indexOf(field);
            tableState.columnOrders.splice(
              fi >= ri ? fi + 1 : fi,
              0,
              tempState.reorder
            );
          }
        }}
      ></button>
    {/each}
  </div>
  <div class="datatable-stack-item content-stack-item">
    {#each Object.entries(tableState.rowgroups) as [group_key, rows], gi}
      <div
        style:grid-row={gi + 1}
        class={[
          "row-group",
          group_key == "body" ? "item-row-group" : "toolbar-row-group",
        ]}
        data-row-group={group_key}
      >
        {#each rows as row, index (index)}
          {@render row_snippet(row)}
        {/each}
      </div>
    {/each}
  </div>
</div>
{#snippet row_snippet(row: TableRow)}
  {#if "cells" in row}
    <div class="row cell-row">
      {#each tableState.columnOrders as field (field)}
        <div class="cell" class:reordering={tempState.reorder == field}>
          {#if row.cells[field]}
            {@render cell_widget_snippet(row.cells[field], field)}
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div class="row widget-row">
      <div class="cell expand-cell">
        {#each row.widgets as widget, i (i)}
          {@render widget_snippet(widget)}
        {/each}
      </div>
    </div>
  {/if}
{/snippet}
{#snippet cell_widget_snippet(widget: CellWidget, field: K)}
  {#if widget.type == "header-label"}
    <button
      type="button"
      class="value-widget padded-widget reorder-handle"
      onmousedown={(e) => {
        tempState.reorder = field;
        document.documentElement.classList.add(clss.reorder);
        const mouseMove = (e: MouseEvent) => {
          e.preventDefault();
        };
        const mouseUp = (e: MouseEvent) => {
          window.removeEventListener("mousemove", mouseMove);
          window.removeEventListener("mouseup", mouseUp);
          tempState.reorder = null;
          document.documentElement.classList.remove(clss.reorder);
        };
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseUp);
      }}
    >
      {widget.label}
    </button>
    {#if tempState.reorder == null}
      <button
        aria-label="Resize column"
        type="button"
        class="resize-handle"
        onmousedown={(e) => {
          const startX = e.clientX;
          const parent = e.currentTarget!.parentElement!;
          const startWidth = parent.clientWidth;
          tempState.resize = field;
          document.documentElement.classList.add(clss.resize);
          const onMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(0, startWidth + (e.clientX - startX));
            tableState.columnWidths[field] = `${newWidth}px`;

            flushSync(() => {
              tableState.columnWidths[field] = `${parent.offsetWidth}px`;
            });
            flushSync(() => {
              tableState.columnWidths[field] = `${parent.offsetWidth}px`;
            });
          };
          const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);

            tempState.resize = null;
            document.documentElement.classList.remove(clss.resize);
          };
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        }}
      ></button>
    {/if}
  {:else}
    {@render widget_snippet(widget)}
  {/if}
{/snippet}
{#snippet widget_snippet(widget: CommonWidget)}
  {#if widget.type == "label"}
    <span>{widget.label}</span>
  {:else if widget.type == "link"}
    <a class="btn" href={widget.href}>{widget.label}</a>
  {:else if widget.type == "button"}
    <button class="btn" type="button" onclick={widget.onclick}
      >{widget.label}</button
    >
  {:else if widget.type == "submit"}
    <button class="btn" type="submit" form={widget.form}>{widget.label}</button>
  {:else}
    <input
      class="value-widget padded-widget"
      type={widget.type}
      bind:value={widget.value}
      form={widget.form}
      list={widget.list}
      autocomplete="on"
      name={widget.name}
    />
  {/if}
{/snippet}

<style>
  :global(:root.dragging-column-resizer) {
    cursor: col-resize;
    user-select: none;
    pointer-events: none;
  }
  :global(:root.dragging-column-reorder) {
    cursor: ew-resize;
    user-select: none;
  }
  .datatable {
    display: grid;
    --text: hsl(0, 0%, 100%);
    --toolbar-bg: hsl(0, 0%, 0%);
    --toolbar-bg-hover: hsl(0, 0%, 10%);
    --toolbar-outline-hover: hsl(0, 30%, 50%);
    --toolbar-column-reordering-border: hsl(0, 50%, 50%);
    --toolbar-cell-reordering-bg: hsl(0, 30%, 20%);
    --toolbar-btn-bg: hsl(0, 0%, 10%);
    --toolbar-btn-bg-hover: hsl(0, 0%, 20%);
    --toolbar-btn-border: hsl(0, 0%, 50%);
    --item-bg: hsl(0, 0%, 20%);
    --item-bg-changed: hsl(180, 50%, 20%);
    --item-bg-changed-hover: hsl(180, 50%, 30%);
    --item-bg-hover: hsl(0, 0%, 30%);
    --item-outline-hover: hsl(90, 30%, 50%);
    --toolbar-resize-bg: hsl(0, 0%, 30%);
    --border: hsl(0, 0%, 50%);
    --z-default: 1;
    --z-focus: 2;
    --z-hover: 3;
    --z-toolbar-default: 4;
    --z-toolbar-focus: 5;
    --z-toolbar-hover: 6;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    min-height: 100%;
    width: max-content;
    /* grid-auto-flow: row dense; */
    grid-auto-rows: max-content;
  }
  .datatable-stack-item {
    display: grid;
    grid-row: 1 / -1;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
  }
  .column-stack-item {
    pointer-events: none;
  }
  .column-stack-item.shouldOverlay {
    pointer-events: all;
  }
  .column {
    all: unset;
    height: 100%;
    z-index: 50;
  }
  .content-stack-item {
    grid-template-rows: min-content 1fr min-content;
  }
  .activelyReordering {
    border-left: thick solid var(--toolbar-column-reordering-border);
  }
  .row-group.toolbar-row-group {
    --cell-bg: var(--toolbar-bg);
    --cell-bg-hover: var(--toolbar-bg-hover);
    --cell-outline-hover: var(--toolbar-outline-hover);
    z-index: 20;
  }
  .row-group {
    justify-self: start;
    height: max-content;
    display: grid;
    grid-column: 1 / -1;
    margin-left: 1px;
    border-top: thin solid var(--border);

    grid-template-columns: subgrid;
  }
  .row-group.toolbar-row-group {
    --z-default: var(--z-toolbar-default);
    --z-focus: var(--z-toolbar-focus);
    --z-hover: var(--z-toolbar-hover);
    --cell-bg: var(--toolbar-bg);
    --cell-bg-hover: var(--toolbar-bg-hover);
    --cell-outline-hover: var(--toolbar-outline-hover);
  }
  .row-group[data-row-group="header"] {
    position: sticky;
    top: 0;
  }
  .row-group[data-row-group="footer"] {
    position: sticky;
    bottom: 0;
  }
  .row {
    display: grid;
    grid-column: 1/-1;
    grid-template-columns: subgrid;
  }
  .cell {
    background-color: var(--cell-bg);
    border: thin solid var(--border);
    margin-top: -1px;
    margin-left: -1px;
    z-index: var(--z-default);
    position: relative;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    min-width: min-content;
    width: auto;
  }
  .cell:hover {
    outline: 1px solid var(--cell-outline-hover);
    outline-offset: -1px;
    z-index: var(--z-hover);
    background-color: var(--cell-bg-hover);
  }
  .cell:focus-within {
    z-index: var(--z-focus);
  }
  .row-group.item-row-group {
    --cell-bg: var(--item-bg);
    --cell-bg-hover: var(--item-bg-hover);
    --cell-outline-hover: var(--item-outline-hover);
  }
  .row-group.item-row-group {
    --cell-bg: var(--item-bg-changed);
    --cell-bg-hover: var(--item-bg-changed-hover);
  }
  .cell.reordering {
    --cell-bg: var(--toolbar-cell-reordering-bg);
    --cell-bg-hover: var(--cell-bg);
  }
  .value-widget {
    position: relative;
    all: unset;
    display: block;
    min-width: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    appearance: none;
    overflow-x: hidden;
    white-space: nowrap;
    flex-shrink: 1;
    flex-grow: 1;
  }
  .padded-widget {
    padding-left: 0.4em;
    padding-block: 0.1em;
  }
  .resize-handle {
    all: unset;
    min-width: 1ex;
    height: 100%;
    cursor: col-resize;
    z-index: 50;
  }
  .resize-handle:hover {
    background-color: var(--toolbar-resize-bg);
  }
  .reorder-handle {
    cursor: ew-resize;
  }
  .expand-cell {
    grid-column: 1 / -1;
  }
  .btn {
    all: unset;
    display: inline-block;
    position: relative;
    z-index: 20;
    padding-inline: 0.4em;
    padding-block: 0.1em;
    background-color: var(--toolbar-btn-bg);
    border: thin solid var(--toolbar-btn-border);
    margin-block: -1px;
    margin-left: -1px;
  }
  .btn:hover {
    background-color: var(--toolbar-btn-bg-hover);
  }
  .btn:focus {
    outline: thin solid var(--toolbar-btn-outline-hover);
  }
</style>
