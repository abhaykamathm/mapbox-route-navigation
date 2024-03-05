import React, { useState, useEffect } from "react";
import Map from "./Map";
import routesData from "./routes.json";
import { fetchDataForRoute } from "./utils/fetchDataForRoute";

function App() {
  const [routesArray, setRoutesArray] = useState([]);

  const fetchRoutes = async () => {
    const fetchedRoutes = await Promise.all(
      routesData.map((route) =>
        fetchDataForRoute(
          route.originLat,
          route.originLng,
          route.destinationLat,
          route.destinationLng
        )
      )
    );
    setRoutesArray(fetchedRoutes);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map routeData={routesArray} />
    </div>
  );
}

export default App;
