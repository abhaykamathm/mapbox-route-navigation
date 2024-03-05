import { haversine } from "./haversineCalculation";

// Function to interpolate points between given points based on a specified interval
export const interpolatePoints = (points, interval) => {
  // Initialize an array to store the interpolated points with the first point from the input
  const interpolatedPoints = [points[0]];

  // Loop through each pair of consecutive points
  for (let i = 1; i < points.length; i++) {
    // Extract latitude and longitude of the current and previous points
    const [prevLon, prevLat] = points[i - 1]; // Previous longitude and latitude
    const [currLon, currLat] = points[i]; // Current longitude and latitude

    // Calculate the total distance between the current and previous points
    const totalDistance = haversine(prevLat, prevLon, currLat, currLon);

    // Initialize current distance traveled on the segment between current and previous points
    let currentDistance = 0;

    // Interpolate points along the segment until the current distance exceeds the total distance
    while (currentDistance < totalDistance) {
      // Calculate the ratio of current distance to total distance
      const ratio = currentDistance / totalDistance;

      // Interpolate longitude and latitude based on the ratio
      const interpolatedLon = prevLon + ratio * (currLon - prevLon);
      const interpolatedLat = prevLat + ratio * (currLat - prevLat);

      // Add the interpolated point to the array of interpolated points
      interpolatedPoints.push([interpolatedLon, interpolatedLat]);

      // Move forward by the specified interval along the segment
      currentDistance += interval;
    }
  }

  // Return the array of interpolated points
  return interpolatedPoints;
};
