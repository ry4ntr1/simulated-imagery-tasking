// getPolygonStaticImage.js
import { bbox } from "@turf/turf";

/**
 * Returns a Mapbox Static API URL given a polygon's bounding box.
 * Configure the style, size, token, etc. to your needs.
 */
export async function getPolygonStaticImage(feature) {
	try {
		const bounds = bbox(feature);
		const token = process.env.REACT_APP_MAPBOX_TOKEN;
		const styleId = "mapbox/satellite-streets-v12";
		const width = 300;
		const height = 200;
		const padding = 40;

		// Using bounding box to auto center:
		// https://docs.mapbox.com/api/maps/static-images/#bounding-box
		const url = `https://api.mapbox.com/styles/v1/${styleId}/static/[${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}]/auto/${width}x${height}?padding=${padding}&access_token=${token}`;

		return url;
	} catch (err) {
		console.error("Error getting polygon screenshot:", err);
		return null;
	}
}
