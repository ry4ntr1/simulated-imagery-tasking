// src/utils/polygonManager.js
import { useState, useCallback } from "react";
import { computePolygonMetrics } from "./polygonUtils";

/**
 * usePolygonManager
 * - We rely on Mapbox's assigned feature.id (no custom fallback).
 */
export function usePolygonManager() {
	const [polygons, setPolygons] = useState([]);
	const [drawMode, setDrawMode] = useState(false);

	const addPolygon = useCallback(
		(feature) => {
			const metrics = computePolygonMetrics(feature);

			// Use EXACT feature.id from Mapbox Draw
			const id = feature.id;
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
		// remove from polygons array
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
