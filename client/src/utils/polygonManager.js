// polygonManager.js
import { useState, useCallback } from "react";
import { computePolygonMetrics } from "./polygonUtils";

/**
 * Manages an array of polygons, each with:
 *  - id
 *  - geojson (the raw feature, containing all coordinates)
 *  - name
 *  - area (m2)
 *  - perimeter (m)
 *  - properties (optional: screenshotUrl, etc.)
 */
export function usePolygonManager() {
	const [polygons, setPolygons] = useState([]);
	const [drawMode, setDrawMode] = useState(false);

	const addPolygon = useCallback(
		(feature) => {
			// Compute area & perimeter
			const metrics = computePolygonMetrics(feature);
			const id = feature.id || `polygon-${Date.now()}`;

			const newPolygon = {
				id,
				geojson: feature,
				name: feature.properties?.name || `Polygon ${polygons.length + 1}`,
				area: metrics.area,
				perimeter: metrics.perimeter,
				properties: feature.properties || {},
			};
			setPolygons((prev) => [...prev, newPolygon]);
		},
		[polygons.length]
	);

	const updatePolygon = useCallback((id, updatedFeature) => {
		const metrics = computePolygonMetrics(updatedFeature);
		setPolygons((prev) =>
			prev.map((p) =>
				p.id === id
					? {
							...p,
							geojson: updatedFeature,
							area: metrics.area,
							perimeter: metrics.perimeter,
						}
					: p
			)
		);
	}, []);

	const removePolygon = useCallback((id) => {
		setPolygons((prev) => prev.filter((p) => p.id !== id));
	}, []);

	const renamePolygon = useCallback((id, newName) => {
		setPolygons((prev) =>
			prev.map((p) =>
				p.id === id
					? {
							...p,
							name: newName,
							properties: { ...p.properties, name: newName },
						}
					: p
			)
		);
	}, []);

	return {
		polygons,
		drawMode,
		setDrawMode,
		addPolygon,
		updatePolygon,
		removePolygon,
		renamePolygon,
	};
}
