<template>
  <div class="group flex divide-x divide-gray-200 hover:bg-gray-50">
    <div
      v-for="column in columnDefs"
      :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
      class="flex-0 flex items-center overflow-hidden border-b p-4"
      tabindex="0"
    >
      <div v-if="column.type === 'sidc'" class="">
        <MilSymbol :sidc="data[column.field]" :size="20" />
      </div>
      <DotsMenu
        v-else-if="column.type === 'dots'"
        :items="column.menu"
        @action="emit('action', $event)"
        class="invisible group-hover:visible"
      />
      <span
        v-else-if="column.type === 'text'"
        class="truncate whitespace-nowrap text-sm text-gray-500"
        >{{ data[column.field] }}</span
      >
    </div>
    <div class=""></div>
  </div>
</template>

<script setup lang="ts">
import { RuntimeColumnProperties } from "@/modules/grid/gridTypes";
import DotsMenu from "@/components/DotsMenu.vue";
import MilSymbol from "@/components/MilSymbol.vue";

interface Props {
  columnDefs: RuntimeColumnProperties[];
  data: any;
}

const props = defineProps<Props>();
const emit = defineEmits(["action"]);
</script>
