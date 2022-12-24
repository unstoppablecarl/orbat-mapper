<script setup lang="ts">
import { ColumnProperties, RuntimeColumnProperties } from "@/modules/grid/gridTypes";
import { computed } from "vue";
import { nanoid } from "@/utils";
import OrbatGridHeader from "@/modules/grid/OrbatGridHeader.vue";
import OrbatGridBody from "@/modules/grid/OrbatGridBody.vue";

interface Props {
  columns: ColumnProperties[];
  data?: any[];
  rowHeight?: string;
}
const props = withDefaults(defineProps<Props>(), { rowHeight: "48px" });

const columnDefs = computed((): RuntimeColumnProperties[] =>
  props.columns.map((column) => ({
    ...column,
    label: column.label || column.field,
    id: column.id || nanoid(),
    width: column.width || 500,
    type: column.type || "text",
  }))
);
</script>

<template>
  <div
    class="divide-gray-30 relative flex h-full flex-col divide-y rounded-lg border shadow"
  >
    <!--    <OrbatGridHeader :column-defs="columnDefs" :row-height="rowHeight" />-->
    <OrbatGridBody :data="data" :row-height="rowHeight" :column-defs="columnDefs" />
  </div>
</template>

<style>
.hover .jest {
  @apply bg-gray-100;
}

.vue-recycle-scroller__slot {
  @apply sticky top-0 z-10;
}
</style>
