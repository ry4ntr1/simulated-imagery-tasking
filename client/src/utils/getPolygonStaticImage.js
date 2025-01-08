/**
 * getPolygonStaticImage
 * Uses Mapbox Static Images API to produce a URL that shows
 * the given polygon in a thumbnail map screenshot.
 *
 * @param {Feature<Polygon>} feature - A GeoJSON Polygon feature
 * @returns {string} A URL to a static map image
 *
 * Usage:
 *   const screenshotUrl = await getPolygonStaticImage(myPolygon);
 *   // Store screenshotUrl in polygon properties -> polygonCart displays <img />
 */
export async function getPolygonStaticImage(feature) {
	const geojsonString = encodeURIComponent(JSON.stringify(feature));
	const styleId = "mapbox/satellite-streets-v12";
	const width = 400;
	const height = 300;

	const token = process.env.REACT_APP_MAPBOX_TOKEN;

	const staticUrl = `https://api.mapbox.com/styles/v1/${styleId}/static/geojson(${geojsonString})/auto/${width}x${height}?access_token=${token}`;

	return staticUrl;
}
