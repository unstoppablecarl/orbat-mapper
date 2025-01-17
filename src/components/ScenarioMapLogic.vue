<script setup lang="ts">
import OLMap from "ol/Map";
import { computed, onUnmounted, shallowRef, watch } from "vue";
import Select from "ol/interaction/Select";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useUiStore } from "@/stores/uiStore";
import {
  useGeoStore,
  useMeasurementsStore,
  useUnitSettingsStore,
} from "@/stores/geoStore";
import { useSettingsStore, useSymbolSettingsStore } from "@/stores/settingsStore";
import { storeToRefs } from "pinia";
import {
  useDrop,
  useMoveInteraction,
  useUnitLayer,
  useUnitSelectInteraction,
} from "@/composables/geomap";
import LayerGroup from "ol/layer/Group";
import { useScenarioMapLayers } from "@/modules/scenarioeditor/scenarioMapLayers";
import {
  useScenarioFeatureSelect,
  useScenarioLayers,
} from "@/modules/scenarioeditor/scenarioLayers2";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useGeoLayersUndoRedo } from "@/composables/geoUndoRedo";
import { useUnitHistory } from "@/composables/geoUnitHistory";
import { useMapHover } from "@/composables/geoHover";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useShowLocationControl } from "@/composables/geoShowLocation";
import { useShowScaleLine } from "@/composables/geoScaleLine";
import { ObjectEvent } from "ol/Object";
import { clearStyleCache } from "@/geo/unitStyles";
import { useRangeRingsLayer } from "@/composables/geoRangeRings";

const props = defineProps<{ olMap: OLMap }>();
const emit = defineEmits<{
  (
    e: "map-ready",
    value: {
      olMap: OLMap;
      featureSelectInteraction: Select;
      unitSelectInteraction: Select;
    },
  ): void;
}>();

const {
  geo,
  store: { state },
  unitActions,
} = injectStrict(activeScenarioKey);

const mapRef = shallowRef<OLMap>();

const uiStore = useUiStore();
const doNotFilterLayers = computed(() => uiStore.layersPanelActive);
const unitSettingsStore = useUnitSettingsStore();
const geoStore = useGeoStore();
const settingsStore = useSettingsStore();
const symbolSettings = useSymbolSettingsStore();
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());
const { measurementUnit } = storeToRefs(useMeasurementsStore());

const { unitLayer, drawUnits } = useUnitLayer();
const { onDrop } = useDrop(mapRef, unitLayer);

const olMap = props.olMap;
mapRef.value = olMap;
geoStore.olMap = olMap;

const unitLayerGroup = new LayerGroup({
  layers: [unitLayer],
});

unitLayerGroup.set("title", "Units");

const { showHistory, editHistory } = storeToRefs(unitSettingsStore);
const { unitSelectEnabled, featureSelectEnabled, hoverEnabled } = storeToRefs(
  useMapSelectStore(),
);

const { initializeFromStore: loadMapLayers } = useScenarioMapLayers(olMap);
const { rangeLayer, drawRangeRings } = useRangeRingsLayer();

olMap.addLayer(rangeLayer);
const { initializeFromStore: loadScenarioLayers } = useScenarioLayers(olMap);
useGeoLayersUndoRedo(olMap);
const { historyLayer, drawHistory, historyModify } = useUnitHistory({
  showHistory,
  editHistory,
});

const r = useMapHover(olMap, { enable: hoverEnabled });

olMap.addLayer(historyLayer);
olMap.addLayer(unitLayerGroup);
olMap.addInteraction(historyModify);

const {
  unitSelectInteraction,
  boxSelectInteraction,
  redraw: redrawSelectedUnits,
} = useUnitSelectInteraction([unitLayer], olMap, {
  enable: unitSelectEnabled,
});
olMap.addInteraction(unitSelectInteraction);
olMap.addInteraction(boxSelectInteraction);

const { selectInteraction: featureSelectInteraction } = useScenarioFeatureSelect(olMap, {
  enable: featureSelectEnabled,
});

const { moveInteraction: moveUnitInteraction } = useMoveInteraction(
  olMap,
  unitLayer,
  moveUnitEnabled,
);

useOlEvent(unitLayerGroup.on("change:visible", toggleMoveUnitInteraction));
olMap.addInteraction(moveUnitInteraction);

const { showLocation, coordinateFormat, showScaleLine } = storeToRefs(
  useMapSettingsStore(),
);

const lc = useShowLocationControl(olMap, {
  coordinateFormat,
  enable: showLocation,
});

useShowScaleLine(olMap, {
  enabled: showScaleLine,
  measurementUnits: measurementUnit,
});

drawRangeRings();
drawUnits();
drawHistory();

loadMapLayers();
loadScenarioLayers();

const extent = unitLayer.getSource()?.getExtent();
if (extent && !unitLayer.getSource()?.isEmpty())
  olMap.getView().fit(extent, { padding: [10, 10, 10, 10] });

function toggleMoveUnitInteraction(event: ObjectEvent) {
  const isUnitLayerVisible = !event.oldValue;
  moveUnitInteraction.setActive(isUnitLayerVisible && moveUnitEnabled.value);
}

emit("map-ready", { olMap, featureSelectInteraction, unitSelectInteraction });

watch(
  geo.everyVisibleUnit,
  () => {
    drawUnits();
    drawHistory();
    redrawSelectedUnits();
    drawRangeRings();
  },
  { deep: true },
);

watch([settingsStore, symbolSettings], () => {
  clearStyleCache();
  drawUnits();
});

watch([() => state.currentTime, doNotFilterLayers], (v) => {
  loadScenarioLayers(false, !doNotFilterLayers.value);
});

onUnmounted(() => {
  geoStore.olMap = undefined;
});
</script>

<template></template>
