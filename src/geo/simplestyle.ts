/**
 * Basic implementation of simplestyle-spec
 *
 * https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
 */

import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

import * as olColor from "ol/color";
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import { RegularShape } from "ol/style";

export interface StrokeStyleSpec {
  stroke: string | null | undefined;
  "stroke-opacity": number;
  "stroke-width": number;
  _stroke?: string | null;
}

export interface FillStyleSpec {
  fill: string | null | undefined;
  "fill-opacity": number;
  _fill?: string | null;
}

export type MarkerSymbol =
  | "square"
  | "triangle"
  | "star"
  | "cross"
  | "x"
  | "circle"
  | "hexagon"
  | "pentagon";

export type MarkerSize = "small" | "medium" | "large";

export interface MarkerStyleSpec {
  "marker-size": MarkerSize;
  "marker-color": string;
  "marker-symbol": MarkerSymbol;
}

export interface SimpleStyleSpec extends StrokeStyleSpec, FillStyleSpec, MarkerStyleSpec {
  title: string;
  description: string;
}

const scaleMap: Record<MarkerSize, number> = { medium: 1, large: 1.5, small: 0.75 };

// based on https://openlayers.org/en/latest/examples/regularshape.html
export function createMarkerSymbol(
  markerSymbol: MarkerSymbol,
  size: MarkerSize,
  markerColor: string = "#7e7e7e",
) {
  const sizeScale = scaleMap[size] || 1;
  const fill = new Fill({ color: markerColor });
  const stroke = new Stroke({
    color: ["cross", "x"].includes(markerSymbol) ? markerColor : "#fafafa",
    width: 2,
  });
  switch (markerSymbol) {
    case "square":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10 * sizeScale,
        angle: Math.PI / 4,
      });
    case "pentagon":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: 10 * sizeScale,
        angle: 0,
      });

    case "hexagon":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 6,
        radius: 10 * sizeScale,
        angle: Math.PI / 2,
      });

    case "triangle":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 3,
        radius: 10 * sizeScale,
        angle: 0,
      });
    case "star":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: 10 * sizeScale,
        radius2: 4 * sizeScale,
        angle: 0,
      });
    case "cross":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10 * sizeScale,
        radius2: 0,
        angle: 0,
      });
    case "x":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10 * sizeScale,
        radius2: 0,
        angle: Math.PI / 4,
      });
  }
  return new CircleStyle({
    fill: fill,
    stroke: stroke,
    radius: 5 * sizeScale,
  });
}

export const defaultSimplestyleStroke = new Stroke({ color: "#555555", width: 2 });
export const defaultSimplestyleFill = new Fill({ color: [0x55, 0x55, 0x55, 0.25] });

export function createSimpleStyle(opts: Partial<SimpleStyleSpec>) {
  let stroke: Stroke | undefined = defaultSimplestyleStroke;
  let fill: Fill | undefined = defaultSimplestyleFill;
  const markerSize = opts["marker-size"] || "medium";
  //if (opts.stroke === undefined && opts.fill === undefined) return; // use default layer style

  if (opts.stroke || opts["stroke-width"] || opts["stroke-opacity"]) {
    let strokeColor = [...olColor.fromString(opts.stroke || "#555555")];
    if (opts["stroke-opacity"]) strokeColor[3] = opts["stroke-opacity"];
    stroke = new Stroke({ color: strokeColor, width: opts["stroke-width"] || 2 });
  } else if (opts.stroke === null) {
    stroke = undefined;
  }
  if (opts["stroke-opacity"] === 0) stroke = undefined;

  if (opts.fill) {
    let fillColor = [...olColor.fromString(opts.fill)];
    fillColor[3] = opts["fill-opacity"] ?? 0.5;
    fill = new Fill({ color: fillColor });
  } else if (opts.fill === null) {
    fill = undefined;
  }
  if (opts["fill-opacity"] === 0) fill = undefined;

  return new Style({
    stroke,
    fill,
    image: createMarkerSymbol(
      opts["marker-symbol"] || "circle",
      markerSize,
      opts["marker-color"] || "#7e7e7e",
    ),
  });
}
