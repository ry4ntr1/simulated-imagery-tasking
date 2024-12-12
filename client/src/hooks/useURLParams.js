import { useMemo } from "react";

export const useURLParams = () => {
	return useMemo(() => {
		const params = new URLSearchParams(window.location.search);
		return {
			latParam: parseFloat(params.get("Lat")),
			lngParam: parseFloat(params.get("Lon")),
			zoomParam: parseFloat(params.get("Zoom")),
			datasetParam: params.get("Dataset"),
		};
	}, []);
};
