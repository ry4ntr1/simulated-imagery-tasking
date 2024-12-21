// polygonUtils.js
import { area as turfArea, length as turfLength } from "@turf/turf";

/**
 * computePolygonMetrics
 *
 * Calculates the area (in m²) and perimeter (in meters) for a given GeoJSON Feature.
 * @param {Object} geojson - A GeoJSON Feature object
 * @param {string} units - Unit specification (optional; defaults to "square-meters")
 * @returns {Object} - { area: number, perimeter: number }
 */
export function computePolygonMetrics(geojson, units = "square-meters") {
	const polygonAreaM2 = turfArea(geojson);
	// Perimeter: approximate by linear ring length in meters
	let perimeterM = 0;
	if (geojson.geometry.type === "Polygon") {
		const coords = geojson.geometry.coordinates[0];
		const lineString = {
			type: "Feature",
			geometry: {
				type: "LineString",
				coordinates: coords,
			},
		};
		perimeterM = turfLength(lineString, { units: "meters" });
	}

	// For simplicity, store area and perimeter in default units (square-meters and meters)
	// If needed, you can convert based on the "units" param here.
	return {
		area: polygonAreaM2,
		perimeter: perimeterM,
	};
}
