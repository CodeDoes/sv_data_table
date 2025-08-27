<script
  lang="ts"
  generics="TD extends TableData<TC>=any, TC extends TableConfig<any,K>=any, K extends string=any, "
>
  import { untrack } from "svelte";
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
  const grid_template_columns = $derived(
    `repeat(${tableConfig.fields.length}, auto)`
  );
</script>

<div class="datatable" style:grid-template-columns={grid_template_columns}>
  <div
    class="row-group toolbar-row-group"
    data-toolbar="top"
    data-row-group="header"
  >
    <div class="row">
      {#each tableConfig.fields as field}
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
      {#each tableConfig.fields as field}
        {@const col = tableConfig.columns[field]}
        <div class="cell" style:width={col.width}>
          <div class="value-widget padded-widget">{col.label}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="row-group item-row-group" data-row-group="item">
    {#each tableData.item_rows as row, index}
      <div class="row">
        {#each tableConfig.fields as field}
          {@const col = tableConfig.columns[field]}
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
    --toolbar-btn-bg: hsl(0, 0%, 10%);
    --toolbar-btn-bg-hover: hsl(0, 0%, 20%);
    --toolbar-btn-border: hsl(0, 0%, 50%);
    --item-bg: hsl(0, 0%, 20%);
    --item-bg-changed: hsl(180, 50%, 20%);
    --item-bg-changed-hover: hsl(180, 50%, 30%);
    --item-bg-hover: hsl(0, 0%, 30%);
    --item-outline-hover: hsl(90, 30%, 50%);
    --border: hsl(0, 0%, 50%);
    --z-default: 1;
    --z-focus: 2;
    --z-hover: 3;
    --z-toolbar-default: 4;
    --z-toolbar-focus: 5;
    --z-toolbar-hover: 6;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    min-height: 100%;
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
  .value-widget {
    position: relative;
    all: unset;
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    appearance: none;
  }
  .padded-widget {
    padding-inline: 0.4em;
    padding-block: 0.1em;
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
