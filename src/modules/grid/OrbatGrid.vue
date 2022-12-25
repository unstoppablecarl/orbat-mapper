<script setup lang="ts">
import { ColumnProperties, RuntimeColumnProperties } from "@/modules/grid/gridTypes";
import { computed } from "vue";
import { nanoid } from "@/utils";
import OrbatGridHeader from "@/modules/grid/OrbatGridHeader.vue";
import { useVirtualList } from "@vueuse/core";
import OrbatGridRow from "@/modules/grid/OrbatGridRow.vue";

interface Props {
  columns: ColumnProperties[];
  data: any[];
  rowHeight?: number;
}
const props = withDefaults(defineProps<Props>(), { rowHeight: 48 });

const columnDefs = computed((): RuntimeColumnProperties[] =>
  props.columns.map((column) => ({
    ...column,
    label: column.label || column.field,
    id: column.id || nanoid(),
    width: column.width || 300,
    type: column.type || "text",
  }))
);

const dd = computed(() => props.data);

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(dd, {
  itemHeight: props.rowHeight,
  overscan: 10,
});
</script>

<template>
  <div v-bind="containerProps" class="relative h-full rounded-lg border shadow">
    <OrbatGridHeader :column-defs="columnDefs" :row-height="rowHeight" class="" />
    <div v-bind="wrapperProps">
      <template v-for="{ index, data: test } in list" :key="index">
        <OrbatGridRow
          :data="test"
          :column-defs="columnDefs"
          :style="{
            height: `${rowHeight}px`,
          }"
          class=""
        />
      </template>
    </div>
  </div>
</template>
