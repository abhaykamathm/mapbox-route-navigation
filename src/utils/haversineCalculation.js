const EARTH_RADIUS_METERS = 6371000;

export const haversine = (latitude1, longitude1, latitude2, longitude2) => {
  const deltaLatitude = (latitude2 - latitude1) * (Math.PI / 180);
  const deltaLongitude = (longitude2 - longitude1) * (Math.PI / 180);

  const squaredHalfChordLength =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitude1 * (Math.PI / 180)) *
      Math.cos(latitude2 * (Math.PI / 180)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const centralAngle =
    2 *
    Math.atan2(
      Math.sqrt(squaredHalfChordLength),
      Math.sqrt(1 - squaredHalfChordLength)
    );
  const distance = EARTH_RADIUS_METERS * centralAngle;

  return distance;
};
