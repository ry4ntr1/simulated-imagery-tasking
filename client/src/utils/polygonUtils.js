// polygonUtils.js
import { area as turfArea, length as turfLength } from "@turf/turf";

/**
 * computePolygonMetrics
 * @param {Feature} geojson a GeoJSON Polygon Feature
 * @returns { area, perimeter } in m² and m
 */
export function computePolygonMetrics(geojson) {
	const polygonAreaM2 = turfArea(geojson);
	let perimeterM = 0;
	if (geojson.geometry?.type === "Polygon") {
		const coords = geojson.geometry.coordinates[0];
		const lineString = {
			type: "Feature",
			geometry: { type: "LineString", coordinates: coords },
		};
		perimeterM = turfLength(lineString, { units: "meters" });
	}
	return {
		area: polygonAreaM2,
		perimeter: perimeterM,
	};
}
