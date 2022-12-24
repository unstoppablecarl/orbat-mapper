<template>
  <section
    class="relative h-full min-h-0 flex-auto divide-y divide-gray-200 align-middle"
  >
    <RecycleScroller
      :items="data"
      :item-size="48"
      list-class="divide-y divide-gray-200"
      class="h-full"
    >
      <template #before>
        <OrbatGridHeader
          :column-defs="columnDefs"
          :row-height="rowHeight"
          class="sticky top-0 z-10"
        ></OrbatGridHeader
      ></template>
      <template v-slot="{ item: row }">
        <div
          class="jest flex flex-shrink-0 divide-x divide-gray-200"
          :style="{ height: rowHeight }"
        >
          <div
            v-for="column in columnDefs"
            :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
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
          <div></div>
        </div>
      </template>
    </RecycleScroller>
  </section>
</template>

<script setup lang="ts">
//@ts-ignore
import { RecycleScroller } from "vue-virtual-scroller";
import { RuntimeColumnProperties } from "@/modules/grid/gridTypes";
import DotsMenu from "@/components/DotsMenu.vue";
import { MenuItemData } from "@/components/types";
import { SideAction, SideActions } from "@/types/constants";
import MilSymbol from "@/components/MilSymbol.vue";
import OrbatGridHeader from "@/modules/grid/OrbatGridHeader.vue";

interface Props {
  columnDefs: RuntimeColumnProperties[];
  data?: any[];
  rowHeight: string;
}

const props = defineProps<Props>();

const sideMenuItems: MenuItemData<SideAction>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  { label: "Add group", action: SideActions.AddGroup },
  { label: "Delete side", action: SideActions.Delete },
  { label: "Move up", action: SideActions.MoveUp },
  { label: "Move down", action: SideActions.MoveDown },
];
</script>
