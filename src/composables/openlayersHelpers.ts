import { EventsKey } from "ol/events";
import { onUnmounted } from "vue";
import { unByKey } from "ol/Observable";
import Feature from "ol/Feature";

/**
 * Unregister open layers event automatically on unmount
 * @param eventKey
 */
export function useOlEvent(eventKey: EventsKey | EventsKey[]): EventsKey | EventsKey[] {
  const eKey = eventKey;
  onUnmounted(() => {
    if (Array.isArray(eKey)) {
      eKey.forEach((key) => unByKey(key));
    } else unByKey(eKey);
  });
  return eventKey;
}

export function isCircle(feature: Feature) {
  return feature.getGeometry()?.getType() === "Circle";
}