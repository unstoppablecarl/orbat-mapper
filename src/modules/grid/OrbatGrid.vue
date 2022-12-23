<script setup lang="ts">
import { ColumnProperties, RuntimeColumnProperties } from "@/modules/grid/gridTypes";
import { computed } from "vue";
import { nanoid } from "@/utils";
import MilSymbol from "@/components/MilSymbol.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { MenuItemData } from "@/components/types";
import { SideAction, SideActions } from "@/types/constants";
import DotsMenu from "@/components/DotsMenu.vue";

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
    width: column.width || 150,
    type: column.type || "text",
  }))
);

const sideMenuItems: MenuItemData<SideAction>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  { label: "Add group", action: SideActions.AddGroup },
  { label: "Delete side", action: SideActions.Delete },
  { label: "Move up", action: SideActions.MoveUp },
  { label: "Move down", action: SideActions.MoveDown },
];
</script>

<template>
  <div
    class="divide-gray-30 flex h-full flex-col divide-y overflow-auto rounded-lg border shadow"
  >
    <header class="flex-shrink-0 overflow-hidden bg-gray-50">
      <div class="flex w-full divide-x divide-gray-200">
        <div
          v-for="column in columnDefs"
          :key="column.id"
          :style="{ width: column.width + 'px' }"
          class="flex-0 flex w-full overflow-hidden px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
        >
          <span class="truncate">{{ column.label }}</span>
        </div>
      </div>
    </header>
    <section class="h-full min-h-0 flex-auto divide-y divide-gray-200 bg-white">
      <RecycleScroller
        :items="data"
        :item-size="48"
        v-slot="{ item: row }"
        list-class="divide-y divide-gray-200"
        class="h-full"
      >
        <div class="jest flex divide-x divide-gray-200" :style="{ height: rowHeight }">
          <div
            v-for="column in columnDefs"
            :style="{ width: column.width + 'px' }"
            class="flex-0 flex items-center overflow-hidden p-4"
          >
            <div v-if="column.type === 'sidc'" class="">
              <MilSymbol :sidc="row[column.field]" :size="20" />
            </div>
            <DotsMenu
              v-else-if="column.type === 'dots'"
              :items="sideMenuItems"
              class=""
            />
            <span
              v-else-if="column.type === 'text'"
              class="truncate whitespace-nowrap text-sm text-gray-500"
              >{{ row[column.field] }}</span
            >
          </div>
        </div>
      </RecycleScroller>
    </section>
  </div>
</template>

<style>
.hover .jest {
  @apply bg-gray-100;
}
</style>
