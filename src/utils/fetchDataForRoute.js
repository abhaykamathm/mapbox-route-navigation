import { interpolatePoints } from "./interpolatePoints";

export const fetchDataForRoute = async (
  originLat,
  originLng,
  destinationLat,
  destinationLng
) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${originLng},${originLat};${destinationLng},${destinationLat}?geometries=geojson&access_token=pk.eyJ1IjoibWFub2hhcnB1bGx1cnUiLCJhIjoiY2xyeHB2cWl0MWFkcjJpbmFuYXkyOTZzaCJ9.AUGHU42YHgAPtHjDzdhZ7g`
    );
    const data = await response.json();

    const originalPath = data.routes[0].geometry.coordinates;
    const intervalMeters = 2;
    const interpolatedPath = interpolatePoints(originalPath, intervalMeters);

    return interpolatedPath;
  } catch (error) {
    console.error("Error fetching route data:", error);
    throw error;
  }
};
