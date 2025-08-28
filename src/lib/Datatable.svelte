<script
  lang="ts"
  generics="TD extends TableData<TC>=any, TC extends TableConfig<any,K>=any, K extends string=any, "
>
  import { flushSync, untrack } from "svelte";
  import type { TableConfig, TableData } from "./tableConfig";

  let {
    tableConfig,
    tableData = $bindable(),
    createFilterFieldName = ({ field }) => `${field}`,
    createUpdateFieldName = ({ field, index }) => `item-${index}-${field}`,
    update_form_id = "update-form",
    filter_form_id = "filter-form",
  }: {
    tableConfig: TC;
    tableData: TD;
    createFilterFieldName?: (args: { field: string }) => string;
    createUpdateFieldName?: (args: { index: number; field: string }) => string;
    update_form_id?: string;
    filter_form_id?: string;
  } = $props();
  let resizingColumn: null | TC["fields"][number] = $state(null);
  let reorderingColumn: null | TC["fields"][number] = $state(null);
  const draggingColumnClass = "dragging-column-resizer";
  const reorderColumnClass = "dragging-column-reorder";
  const cols = $derived(
    tableData.order.map((f) => tableData.columns[f].width).join(" ")
  );
</script>

<div class="datatable" style:grid-template-columns={cols}>
  <div
    class="row-group toolbar-row-group"
    data-toolbar="top"
    data-row-group="header"
  >
    <div class="row">
      <div class="cell toolbar-cell">
        &nbsp;
      </div>
    </div>
    <div class="row">
      {#each tableData.order as field (field)}
        <div class="cell">
          <input
            class="value-widget padded-widget"
            type="search"
            form={filter_form_id}
            name={createFilterFieldName({ field })}
            id=""
          />
        </div>
      {/each}
    </div>
    <div class="row">
      {#each tableData.order as field (field)}
        {@const col = tableData.columns[field]}
        <div class="cell" class:reordering={reorderingColumn == field}>
          <button
            type="button"
            class="value-widget padded-widget reorder-handle"
            onfocus={(e) => {}}
            onmouseover={(e) => {
              if (reorderingColumn != null && reorderingColumn != field) {
                const ri = tableData.order.indexOf(reorderingColumn);
                tableData.order.splice(ri, 1);
                const fi = tableData.order.indexOf(field);
                tableData.order.splice(
                  fi >= ri ? fi + 1 : fi,
                  0,
                  reorderingColumn
                );
              }
            }}
            onmousedown={(e) => {
              reorderingColumn = field;
              document.documentElement.classList.add(reorderColumnClass);
              const mouseMove = (e: MouseEvent) => {
                e.preventDefault();
              };
              const mouseUp = (e: MouseEvent) => {
                window.removeEventListener("mousemove", mouseMove);
                window.removeEventListener("mouseup", mouseUp);
                reorderingColumn = null;
                document.documentElement.classList.add(reorderColumnClass);
              };
              window.addEventListener("mousemove", mouseMove);
              window.addEventListener("mouseup", mouseUp);
            }}
          >
            {col.label}
          </button>
          {#if reorderingColumn == null}
            <button
              aria-label="Resize column"
              type="button"
              class="resize-handle"
              onmousedown={(e) => {
                const startX = e.clientX;
                const parent = e.currentTarget!.parentElement!;
                const startWidth = parent.clientWidth;
                resizingColumn = field;
                document.documentElement.classList.add(draggingColumnClass);
                const onMouseMove = (e: MouseEvent) => {
                  const newWidth = Math.max(
                    0,
                    startWidth + (e.clientX - startX)
                  );
                  col.width = `${newWidth}px`;

                  flushSync(() => {
                    col.width = `${parent.offsetWidth}px`;
                  });
                  flushSync(() => {
                    col.width = `${parent.offsetWidth}px`;
                  });
                };
                const onMouseUp = () => {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);

                  resizingColumn = null;
                  document.documentElement.classList.remove(
                    draggingColumnClass
                  );
                };
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            ></button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
  <div class="row-group item-row-group" data-row-group="item">
    {#each tableData.item_rows as row, index (index)}
      <div class="row">
        {#each tableData.order as field (field)}
          {@const col = tableData.columns[field]}
          {@const attrs = {
            name: createUpdateFieldName({
              index,
              field,
            }),
            form: update_form_id,
            type: row[field].type,
            title: `${row[field].defaultValue}`,
          }}

          <div
            class="cell"
            class:changed={row[field].defaultValue != row[field].value}
          >
            <input
              class="value-widget padded-widget"
              bind:value={row[field].value}
              {...attrs}
            />
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <div
    class="row-group toolbar-row-group"
    data-toolbar="bottom"
    data-row-group="footer"
  >
    <div class="row">
      <div class="cell toolbar-cell">
        <button class="btn" type="submit">Update</button>
      </div>
    </div>
  </div>
</div>

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
  .expand-area {
    grid-column: 1/-1;
    margin-bottom: auto;
  }
  .datatable {
    display: grid;
    grid-template-rows: min-content 1fr min-content;
    --text: hsl(0, 0%, 100%);
    --toolbar-bg: hsl(0, 0%, 0%);
    --toolbar-bg-hover: hsl(0, 0%, 10%);
    --toolbar-outline-hover: hsl(0, 30%, 50%);
    --toolbar-cell-bg-reordering: hsl(0, 30%, 20%);
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
    position: sticky;
    --cell-bg: var(--toolbar-bg);
    --cell-bg-hover: var(--toolbar-bg-hover);
    --cell-outline-hover: var(--toolbar-outline-hover);
  }
  .row-group.toolbar-row-group[data-toolbar="top"] {
    top: 0;
  }
  .row-group.toolbar-row-group[data-toolbar="bottom"] {
    bottom: 0;
  }
  .row {
    display: grid;
    grid-column: 1/-1;
    grid-template-columns: subgrid;

    grid-auto-columns: 1fr;
  }
  .row-group > .row > .cell {
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
  .row-group > .row > .cell:hover {
    outline: 1px solid var(--cell-outline-hover);
    outline-offset: -1px;
    z-index: var(--z-hover);
    background-color: var(--cell-bg-hover);
  }
  .row-group > .row > .cell:focus-within {
    z-index: var(--z-focus);
  }
  .row-group.item-row-group > .row > .cell {
    --cell-bg: var(--item-bg);
    --cell-bg-hover: var(--item-bg-hover);
    --cell-outline-hover: var(--item-outline-hover);
  }
  .row-group.item-row-group > .row > .cell.changed {
    --cell-bg: var(--item-bg-changed);
    --cell-bg-hover: var(--item-bg-changed-hover);
  }
  .row-group.toolbar-row-group > .row > .cell.toolbar-cell {
    grid-column: 1 / -1;
  }
  .row-group.toolbar-row-group > .row > .cell.reordering {
    --cell-bg: var(--toolbar-cell-bg-reordering);
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
    position: relative;
    background-color: var(--toolbar-resize-bg);
    min-width: 1ex;
    height: 100%;
    cursor: col-resize;
    z-index: 50;
  }
  .reorder-handle {
    cursor: ew-resize;
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
