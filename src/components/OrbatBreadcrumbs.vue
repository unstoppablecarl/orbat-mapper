<template>
  <nav class="bg-opacity-85 flex rounded bg-gray-100 px-1 pb-1" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center">
      <li>
        <div>
          <p class="text-gray-400">
            <HomeIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span class="sr-only">Root</span>
          </p>
        </div>
      </li>
      <li>
        <div class="flex items-center">
          <ChevronRightIcon
            class="h-5 w-5 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          />
          <SimpleSelect :items="sideItems" v-model="currentSide" />
        </div>
      </li>
      <li>
        <div class="flex items-center">
          <ChevronRightIcon
            class="h-5 w-5 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          />
          <SimpleSelect :items="groupItems" v-model="currentGroup" />
        </div>
      </li>
      <li>
        <div class="flex items-center">
          <ChevronRightIcon
            class="h-5 w-5 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          />
          <SimpleSelect :items="rootUnitItems" />
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRightIcon, HomeIcon } from "@heroicons/vue/20/solid";
import { BreadcrumbItem, SelectItem } from "@/components/types";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watch } from "vue";
import { NSide, NSideGroup } from "@/types/internalModels";
import { EntityId } from "@/types/base";
import SimpleSelect from "@/components/SimpleSelect.vue";

interface Props {}

const props = defineProps<Props>();

const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);

const { sides, groups, currentSide, currentGroup, rootUnits } = useOrbatCrumbs();

const sideItems = computed(() => sides.value.map((s) => ({ value: s, label: s.name })));
const groupItems = computed(() => groups.value.map((s) => ({ value: s, label: s.name })));
const rootUnitItems = computed(() =>
  rootUnits.value.map((s) => ({ value: s, label: s.name }))
);

function useOrbatCrumbs() {
  const currentSideId = ref<EntityId | null | undefined>(state.sides[0]);
  const currentSide = ref<NSide | null>(
    currentSideId.value ? state.getSideById(currentSideId.value) : null
  );
  const currentGroup = ref<NSideGroup>();
  const sides = computed(() => state.sides.map((sideId) => state.getSideById(sideId)));
  const groups = computed(() =>
    currentSide.value ? currentSide.value.groups.map((id) => state.sideGroupMap[id]) : []
  );

  const rootUnits = computed(() =>
    (currentGroup.value?.subUnits || []).map((id) => state.unitMap[id])
  );

  watch(
    currentSide,
    (v) => {
      currentGroup.value = groups.value[0];
    },
    { immediate: true }
  );

  return { sides, groups, currentSide, currentGroup, rootUnits };
}
</script>
