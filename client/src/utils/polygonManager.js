// polygonManager.js
import { useState, useCallback } from "react";
import { computePolygonMetrics } from "./polygonUtils";

/**
 * usePolygonManager
 *
 * Manages an array of polygons, each with:
 *  - id
 *  - geojson
 *  - name
 *  - area (m²)
 *  - perimeter (m)
 */
export function usePolygonManager(units = "square-meters") {
	const [polygons, setPolygons] = useState([]);
	const [drawMode, setDrawMode] = useState(false);
	const [currentPolygonToName, setCurrentPolygonToName] = useState(null);

	const addPolygon = useCallback(
		(geojson) => {
			const metrics = computePolygonMetrics(geojson, units);
			const id = geojson.id || `polygon-${Date.now()}`;
			const newPolygon = {
				id,
				geojson,
				name: `Polygon ${polygons.length + 1}`,
				...metrics,
			};
			setPolygons((prev) => [...prev, newPolygon]);
		},
		[units, polygons.length]
	);

	const updatePolygon = useCallback(
		(id, updatedGeojson) => {
			const metrics = computePolygonMetrics(updatedGeojson, units);
			setPolygons((prev) =>
				prev.map((p) =>
					p.id === id ? { ...p, geojson: updatedGeojson, ...metrics } : p
				)
			);
		},
		[units]
	);

	const removePolygon = useCallback((id) => {
		setPolygons((prev) => prev.filter((p) => p.id !== id));
	}, []);

	const renamePolygon = useCallback((id, newName) => {
		setPolygons((prev) =>
			prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
		);
	}, []);

	const setPolygonUnits = useCallback((newUnits) => {
		// If needed, convert all polygon metrics to new units.
		// Currently, this hook only stores area in square meters and perimeter in meters.
	}, []);

	return {
		polygons,
		drawMode,
		setDrawMode,
		currentPolygonToName,
		setCurrentPolygonToName,
		addPolygon,
		updatePolygon,
		removePolygon,
		renamePolygon,
		setPolygonUnits,
	};
}
