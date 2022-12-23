<script setup lang="ts">
import OrbatGrid from "@/modules/grid/OrbatGrid.vue";

import { ColumnProperties } from "@/modules/grid/gridTypes";
import { NUnit } from "@/types/internalModels";
import { onMounted, ref } from "vue";
import { useScenario } from "@/scenariostore";

const data = ref<NUnit[]>([]);

type test = keyof NUnit;

const columns = ref<ColumnProperties<NUnit>[]>([
  { field: "id", label: "", type: "dots", width: 60 },
  { field: "sidc", label: "Icon", type: "sidc", width: 65 },
  { field: "shortName", label: "Short name" },
  { field: "sidc", label: "Symbol", id: "sdfsd" },
  { field: "name", label: "Name" },
]);
const { scenario, isReady } = useScenario();

onMounted(async () => {
  await scenario.value.io.loadDemoScenario("falkland82");
  data.value = Object.values(scenario.value.store.state.unitMap);
});
</script>
<template>
  <main class="h-full py-2 sm:px-4">
    <section class="h-full w-full">
      <OrbatGrid :data="data" :columns="columns" />
    </section>
  </main>
</template>
