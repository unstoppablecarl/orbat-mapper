<script setup lang="ts">
import { ScenarioImageLayer } from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed } from "vue";
import { ScenarioMapLayerUpdate } from "@/types/internalModels";
import { LayerUpdateOptions, useMapLayerInfo } from "@/composables/geoMapLayers";

interface Props {
  layer: ScenarioImageLayer;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  update: [d: ScenarioMapLayerUpdate, options: LayerUpdateOptions];
}>();

const { layerTypeLabel } = useMapLayerInfo(props.layer);

const rotation = computed({
  get: () => (props.layer.imageRotate ?? 0) * (180 / Math.PI),
  set: (v) => emit("update", { imageRotate: v * (Math.PI / 180) }, { debounce: true }),
});
</script>

<template>
  <header class="flex justify-end">
    <span class="badge">{{ layerTypeLabel }}</span>
  </header>
  <section class="mt-4 grid w-full grid-cols-1 gap-x-6 gap-y-2 text-sm">
    <InputGroup
      label="Rotation"
      v-model.number="rotation"
      type="range"
      min="-360"
      max="360"
      step=".1"
      class=""
    >
    </InputGroup>
    {{ rotation }}
  </section>
</template>
