<script setup lang="ts">
import { TableColumn, TableColumnWidth } from "@/modules/scenarioeditor/types";
import { onMounted, ref } from "vue";
import { useVModel } from "@vueuse/core";

interface Props {
  columns: TableColumn[];
  modelValue: TableColumnWidth;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const widths = useVModel(props, "modelValue", emit);

function createInitialWidths(cols: TableColumn[]) {
  return Object.fromEntries(cols.map((c) => [c.label, c.width || "333px"]));
}
widths.value = createInitialWidths(props.columns);

const rowHeight = ref("40px");
</script>
<template>
  <header class="sticky top-0 z-10 flex w-full bg-gray-500">
    <div role="row" class="flex w-full divide-x-2 divide-red-500">
      <div role="columnheader" class="inline-block" :style="{ height: rowHeight }">
        &nbsp;
      </div>
      <div role="columnheader" class="flex items-center">
        <div class="">Unit</div>
      </div>
      <div
        role="columnheader"
        v-for="column in columns"
        :key="column.value"
        class="flex items-center"
        :style="{ width: widths[column.label] }"
      >
        <div class="cursor-pointer" @click="widths[column.label] = '100px'">
          {{ column.label }}
        </div>
      </div>
    </div>
  </header>
</template>
