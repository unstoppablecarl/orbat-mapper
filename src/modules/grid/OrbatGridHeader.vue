<template>
  <header class="sticky top-0 border-b bg-gray-100">
    <div class="flex divide-x divide-gray-200">
      <div
        v-for="column in columnDefs"
        :key="column.id"
        :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
        class="flex-0 flex w-full overflow-hidden px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        <span class="truncate">{{ column.label }}</span>
      </div>
      <div></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RuntimeColumnProperties } from "@/modules/grid/gridTypes";

interface Props {
  columnDefs: RuntimeColumnProperties[];
  rowHeight?: number;
}

const props = defineProps<Props>();
</script>
