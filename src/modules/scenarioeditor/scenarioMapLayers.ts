import OLMap from "ol/Map";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import LayerGroup from "ol/layer/Group";
import {
  FeatureId,
  ScenarioImageLayer,
  ScenarioMapLayer,
  ScenarioMapLayerType,
  ScenarioTileJSONLayer,
  ScenarioXYZLayer,
} from "@/types/scenarioGeoModels";
import GeoImageLayer from "ol-ext/layer/GeoImage";
import GeoImage from "ol-ext/source/GeoImage";
import TransformInteraction from "ol-ext/interaction/Transform";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";
import { boundingExtent, isEmpty } from "ol/extent";
import TileLayer from "ol/layer/Tile";
import { TileJSON } from "ol/source";
import { unByKey } from "ol/Observable";
import { fixExtent } from "@/utils/geoConvert";
import { IconImage as ImageIcon, IconWebBox } from "@iconify-prerendered/vue-mdi";
import {
  ScenarioMapLayerUpdate,
  ScenarioTileJSONLayerUpdate,
} from "@/types/internalModels";
import XYZ from "ol/source/XYZ";
import { TGeo } from "@/scenariostore";
import { onMounted, onUnmounted } from "vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromExtent } from "ol/geom/Polygon";
import Feature from "ol/Feature";
import { Polygon } from "ol/geom";
import { Fill, Stroke, Style } from "ol/style";

const layersMap = new WeakMap<OLMap, LayerGroup>();

// Responsible for creating and managing the OpenLayers image layers for the scenario editor
export function useScenarioMapLayers(olMap: OLMap) {
  const scn = injectStrict(activeScenarioKey);
  const bus = useEventBus(imageLayerAction);
  const mapLayersGroup = getOrCreateLayerGroup(olMap);

  const { onUndoRedo } = scn.store;
  const { l } = useImageLayerInteraction(olMap);
  function initializeFromStore() {
    mapLayersGroup.getLayers().clear();
    scn.geo.mapLayers.value.forEach((mapLayer) => {
      if (mapLayer.type === "ImageLayer") addImageLayer(mapLayer);
      if (mapLayer.type === "TileJSONLayer") addTileJSONLayer(mapLayer);
    });
  }

  function getOlLayerById(layerId: FeatureId) {
    return mapLayersGroup
      .getLayers()
      .getArray()
      .find((e) => e.get("id") === layerId);
  }

  function addImageLayer(data: ScenarioImageLayer) {
    const imageCenter = data.imageCenter
      ? fromLonLat(data.imageCenter, olMap.getView().getProjection())
      : olMap.getView().getCenter();
    const newLayer = new GeoImageLayer({
      name: data.name,
      opacity: data.opacity ?? 0.7,
      visible: false,

      source: new GeoImage({
        url: data.url,
        imageCenter,
        imageScale: data.imageScale ?? [1, 1],
        imageRotate: data.imageRotate ?? 0,
        attributions: data.attributions,
      }),
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });
    if (!data.imageScale) {
      newLayer.getSource().once("change", () => {
        const res = olMap.getView().getResolution() || 1;
        //  scale to resolution of image
        const w = newLayer.getSource().getGeoImage().width as number;
        newLayer.getSource().setScale((res * 96 * 10) / w);
        newLayer.setVisible(true);
        const layerExtent = newLayer.getExtent();
        scn.geo.updateMapLayer(
          data.id,
          {
            imageCenter: toLonLat(
              newLayer.getSource().getCenter(),
              olMap.getView().getProjection()
            ),
            imageRotate: newLayer.getSource().getRotation(),
            imageScale: newLayer.getSource().getScale(),
            extent: layerExtent,
          },
          { noEmit: true }
        );
      });
    } else {
      newLayer.setVisible(!(data.isHidden ?? false));
      const polygon = fromExtent(newLayer.getSource().getExtent());
      polygon.rotate(
        -newLayer.getSource().getRotation(),
        newLayer.getSource().getCenter()
      );
      l.getSource().addFeature(new Feature(getPolygonfromImage(newLayer)));
    }
    mapLayersGroup.getLayers().push(newLayer);
  }

  function addTileJSONLayer(data: ScenarioTileJSONLayer) {
    if (!data.url) {
      console.warn("Missing url for tile layer");
      return;
    }
    const source = new TileJSON({
      url: data.url,
      crossOrigin: "anonymous",
    });
    const newLayer = new TileLayer({
      opacity: data.opacity ?? 0.7,
      visible: false,
      source,
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });
    scn.geo.updateMapLayer(
      data.id,
      { _status: "loading" },
      { noEmit: true, undoable: false }
    );

    let key = source.on("change", function () {
      if (source.getState() == "ready") {
        unByKey(key);
        const tileJson = source.getTileJSON();
        const dataUpdate: ScenarioTileJSONLayerUpdate = {};
        if (tileJson?.bounds) {
          const extent = fixExtent(
            transformExtent(tileJson.bounds, "EPSG:4326", olMap.getView().getProjection())
          );
          if (extent && !isEmpty(extent)) {
            newLayer.setExtent(extent);
            dataUpdate.extent = extent;
          }
          if (tileJson?.attribution) {
            dataUpdate.attributions = tileJson.attribution;
          }
          scn.geo.updateMapLayer(data.id, dataUpdate, { noEmit: true, undoable: false });
          scn.geo.updateMapLayer(
            data.id,
            { _status: "initialized", _isNew: false },
            { noEmit: true, undoable: false }
          );
        }
        newLayer.setVisible(!(data.isHidden ?? false));
      } else if (source.getState() == "error") {
        unByKey(key);
        scn.geo.updateMapLayer(
          data.id,
          { _status: "error" },
          { noEmit: true, undoable: false }
        );
        mapLayersGroup.getLayers().remove(newLayer);
      }
    });
    mapLayersGroup.getLayers().push(newLayer);
  }
  function addXYZLayer(data: ScenarioXYZLayer) {
    if (!data.url) {
      console.warn("Missing url for tile layer");
      return;
    }
    const source = new XYZ({
      url: data.url,
      attributions: data.attributions,
    });

    const newLayer = new TileLayer({
      opacity: data.opacity ?? 0.7,
      visible: !(data.isHidden ?? false),
      source,
      properties: {
        id: data.id,
        title: data.name,
        name: data.name,
      },
    });
    scn.geo.updateMapLayer(
      data.id,
      { _status: "initialized" },
      { noEmit: true, undoable: false }
    );

    mapLayersGroup.getLayers().push(newLayer);
  }

  function deleteLayer(layerId: FeatureId) {
    const layer = getOlLayerById(layerId);
    if (layer) {
      // @ts-ignore
      layer.getSource?.().clear?.();
      mapLayersGroup.getLayers().remove(layer);
    }
  }

  function addLayer(layerId: FeatureId) {
    const mapLayer = scn.geo.getMapLayerById(layerId);
    if (mapLayer.type === "ImageLayer") addImageLayer(mapLayer);
    if (mapLayer.type === "TileJSONLayer") addTileJSONLayer(mapLayer);
    if (mapLayer.type === "XYZLayer") addXYZLayer(mapLayer);
  }

  function updateLayer(layerId: FeatureId, data: ScenarioMapLayerUpdate) {
    const mapLayer = scn.geo.getMapLayerById(layerId);
    const layer = getOlLayerById(layerId) as any;
    if (!layer) {
      addLayer(layerId);
      return;
    }

    if (data.isHidden !== undefined) {
      layer.setVisible(!data.isHidden);
    }
    if (data.opacity !== undefined) {
      layer.setOpacity(data.opacity);
    }

    if (mapLayer.type === "TileJSONLayer" || mapLayer.type === "XYZLayer") {
      if ("url" in data && data.url !== undefined) {
        deleteLayer(layerId);
        addLayer(layerId);
      }
    }

    if (mapLayer.type === "ImageLayer") {
      const d = data as ScenarioImageLayer;
      if (d.imageRotate !== undefined) {
        layer.getSource().setRotation(d.imageRotate);
      }
    }
  }

  function moveLayer(layerId: FeatureId) {
    const layer = getOlLayerById(layerId);
    const newIndex = scn.geo.getMapLayerIndex(layerId);
    if (layer) {
      mapLayersGroup.getLayers().remove(layer);
      mapLayersGroup.getLayers().insertAt(newIndex, layer);
    }
  }

  scn.geo.onMapLayerEvent((event) => {
    if (event.type === "add") {
      addLayer(event.id);
    } else if (event.type === "remove") {
      deleteLayer(event.id);
    } else if (event.type === "update") {
      updateLayer(event.id, event.data as ScenarioMapLayerUpdate);
    } else if (event.type === "move") {
      moveLayer(event.id);
    }
  });

  bus.on(({ action, id }) => {
    const olLayer = getOlLayerById(id);
    if (olLayer) {
      if (action === "zoom") {
        // @ts-ignore
        let layerExtent = olLayer.getExtent() || olLayer.getSource()?.getExtent?.();
        if (!layerExtent) {
          // @ts-ignore
          layerExtent = olLayer.getSource()?.getTileGrid?.().getExtent();
        }
        layerExtent = fixExtent(layerExtent);
        layerExtent && !isEmpty(layerExtent) && olMap.getView().fit(layerExtent);
      }
    }
  });

  onUndoRedo(({ action, meta }) => {
    if (
      !meta ||
      !["addMapLayer", "updateMapLayer", "deleteMapLayer", "moveMapLayer"].includes(
        meta.label
      )
    )
      return;
    const { label, value: layerId } = meta;
    if (label === "addMapLayer") {
      if (action === "undo") {
        deleteLayer(layerId);
      } else {
        addLayer(layerId);
      }
    } else if (label === "deleteMapLayer") {
      if (action === "undo") {
        addLayer(layerId);
      } else {
        deleteLayer(layerId);
      }
    } else if (label === "updateMapLayer") {
      const data = scn.geo.getMapLayerById(layerId);
      updateLayer(layerId, data);
    } else if (label === "moveMapLayer") {
      moveLayer(layerId);
    }
  });

  return { initializeFromStore };
}

function getOrCreateLayerGroup(olMap: OLMap) {
  if (layersMap.has(olMap)) return layersMap.get(olMap)!;

  const layerGroup = new LayerGroup({
    properties: { id: nanoid(), title: "Map layers" },
  });
  layersMap.set(olMap, layerGroup);
  olMap.addLayer(layerGroup);
  return layerGroup;
}

export function getMapLayerIcon(mapLayer: ScenarioMapLayer) {
  if (mapLayer.type === "ImageLayer") return ImageIcon;
  if (mapLayer.type === "TileJSONLayer" || mapLayer.type === "XYZLayer")
    return IconWebBox;
  return ImageIcon;
}

export function addMapLayer(
  layerType: ScenarioMapLayerType,
  geo: TGeo
): ScenarioMapLayer {
  // const newLayer = geo.addMapLayer({
  //   id: nanoid(),
  //   type: "TileJSONLayer",
  //   name: "Town plans of Sicily, Messina",
  //   url: "https://maps.georeferencer.com/georeferences/c589e97e-4ee3-572f-9c17-ec267dc1e41d/2019-10-01T08:40:08.006175Z/map.json?key=TT2V1y0PsmpHjZjDoUgL",
  // });
  let newLayer: ScenarioMapLayer;
  if (layerType === "TileJSONLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "TileJSONLayer",
      name: "New map layer",
      url: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else if (layerType === "XYZLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "XYZLayer",
      name: "New XYZ map layer",
      url: "",
      _status: "uninitialized",
      _isNew: true,
    });
  } else if (layerType === "ImageLayer") {
    newLayer = geo.addMapLayer({
      id: nanoid(),
      type: "ImageLayer",
      name: "Test",
      url: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Achin,_Plan_de_la_ville_de_Paris_repr%C3%A9sentant_les_nouvelles_voitures_publiques,_1828.jpg",
      attributions: [
        "<a href='http://www.geoportail.gouv.fr/actualite/181/telechargez-les-cartes-et-photographies-aeriennes-historiques'>Photo historique &copy; IGN</a>",
      ],
      _status: "uninitialized",
      _isNew: true,
    });
  } else {
    throw new Error(`Unknown layer type ${layerType}`);
  }

  return newLayer;
}

function getPolygonfromImage(layer: any) {
  const source = layer.getSource();
  const center = source.getCenter();
  const scale = source.getScale();
  const width = source.getGeoImage().width * scale[0];
  const height = source.getGeoImage().height * scale[1];
  const p1 = [center[0] - width / 2, center[1] - height / 2];
  const p2 = [center[0] + width / 2, center[1] + height / 2];
  const extent = boundingExtent([p1, p2]);
  const polygon = fromExtent(extent);
  // The resulting polygon
  polygon.rotate(-source.getRotation(), center);
  return polygon;
}

function useImageLayerInteraction(olMap: OLMap) {
  const l = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      fill: new Fill({ color: "rgba(0, 0, 0, 0)" }),
      stroke: new Stroke({ color: "rgb(238,3,3)", width: 2 }),
    }),
  });
  const interaction = new TransformInteraction({ translateFeature: false, noFlip: true });
  olMap.addInteraction(interaction);
  olMap.addLayer(l);
  onUnmounted(() => {
    olMap.removeInteraction(interaction);
  });
  interaction.on(["translating", "rotating"], (e) => {
    console.log(e);
  });

  return { l };
}
