<script setup lang="ts">
import OrbatGrid from "@/modules/grid/OrbatGrid.vue";

import { ColumnProperties } from "@/modules/grid/gridTypes";
import { NUnit } from "@/types/internalModels";
import { onMounted, ref } from "vue";
import { useScenario } from "@/scenariostore";
import { MenuItemData } from "@/components/types";
import { SideAction, SideActions } from "@/types/constants";

const data = ref<NUnit[]>([]);

const sideMenuItems: MenuItemData<SideAction>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  { label: "Add group", action: SideActions.AddGroup },
  { label: "Delete side", action: SideActions.Delete },
  { label: "Move up", action: SideActions.MoveUp },
  { label: "Move down", action: SideActions.MoveDown },
];

const columns = ref<ColumnProperties<NUnit>[]>([
  { field: "id", label: "menu", type: "dots", width: 60, menu: sideMenuItems },
  { field: "sidc", label: "Icon", type: "sidc", width: 65 },
  { field: "name", label: "Name" },
  { field: "shortName", label: "Short name" },
  { field: "externalUrl", label: "URL" },
]);
const { scenario, isReady } = useScenario();

onMounted(async () => {
  await scenario.value.io.loadDemoScenario("falkland82");
  data.value = Object.values(scenario.value.store.state.unitMap);
});

function onAction(action: SideAction, { data, index }) {
  console.log("on action", action, data, index);
}
</script>
<template>
  <main class="h-full sm:p-10">
    <section class="h-full">
      <OrbatGrid :data="data" :columns="columns" @action="onAction" />
    </section>
  </main>
</template>
