import { layer_metadata } from "./layerMetadata";

export const createGeoJSONFromMetadata = () => {
	const features = Object.keys(layer_metadata).map((name) => {
		const coords = layer_metadata[name].center; // [lat, lng]
		return {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [coords[1], coords[0]], // GeoJSON: [lng, lat]
			},
			properties: {
				title: name,
			},
		};
	});

	return {
		type: "FeatureCollection",
		features,
	};
};
