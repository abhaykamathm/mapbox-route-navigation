import mapboxgl from "mapbox-gl";
import React, { useEffect, useState, useRef } from "react";
import "./Map.css";
import MarkerPng from "./Images/police.png";
import { createRoot } from "react-dom/client";
import geoJson from "./geoJson.json";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFub2hhcnB1bGx1cnUiLCJhIjoiY2xyeHB2cWl0MWFkcjJpbmFuYXkyOTZzaCJ9.AUGHU42YHgAPtHjDzdhZ7g";

const Map = ({ routeData }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [count, setCount] = useState(0);
  const [is3D, setIs3D] = useState(false);
  const [clickedPoints, setClickedPoints] = useState([]);

  const Marker = () => {
    const [clickedPopup, setClickedPopup] = useState(false);

    return (
      <div onClick={() => setClickedPopup(!clickedPopup)} className="marker">
        <img alt="image" src={MarkerPng} />
        {clickedPopup ? <div>Hello</div> : null}
      </div>
    );
  };

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      // center: routeData ? routeData[0] : [-74.006008, 40.712],
      center: [78.361771, 17.441989],
      // center: [-73.970889, 40.660204],
      zoom: 14,
    });

    map.current.on("load", () => {
      geoJson.features.forEach((feature) => {
        const ref = React.createRef();
        ref.current = document.createElement("div");
        createRoot(ref.current).render(<Marker feature={feature} />);
        new mapboxgl.Marker(ref.current)
          .setLngLat(feature.geometry.coordinates)
          .addTo(map.current);
      });
    });
    document.addEventListener("keydown", handleKeyPress);

    map.current.on("load", () => {
      routeData.forEach((routeCoordinates, index) => {
        // Add route line
        map.current.addSource(`route-${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeCoordinates,
            },
          },
        });

        map.current.addLayer({
          id: `route-layer-${index}`,
          type: "line",
          source: `route-${index}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "blue",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        // Add start point marker
        const startPoint = routeCoordinates[0];
        map.current.addSource(`start-${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: startPoint,
            },
          },
        });

        map.current.loadImage(MarkerPng, function (error, image) {
          if (error) throw error;
          map.current.addImage(`custom-div-icon-${index}`, image);
          map.current.addLayer({
            id: `start-${index}`,
            type: "symbol",
            source: `start-${index}`,
            layout: {
              "icon-image": `custom-div-icon-${index}`,
              "icon-size": 0.8,
            },
          });
        });
      });
    });

    return () => {
      map.current.remove();
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [routeData]);

  const handleKeyPress = (event) => {
    if (event.ctrlKey && event.key === "m") {
      animateSymbol(routeData);
    }
  };

  const animateSymbol = (routes) => {
    routes.forEach((coordinates, routeIndex) => {
      let counter = 0;

      function animate() {
        if (counter >= coordinates.length) {
          return;
        }

        map.current.getSource(`start-${routeIndex}`).setData({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinates[counter],
          },
        });
        counter++;

        setTimeout(() => {
          requestAnimationFrame(animate);
        }, 80);
      }

      animate();
    });
  };

  const handleClick = () => {
    const clickedPointsSource = {
      type: "FeatureCollection",
      features: clickedPoints,
    };

    map.current.getSource("clicked-points")?.setData(clickedPointsSource);

    if (!map.current.getLayer("clicked-points-layer")) {
      map.current.addSource("clicked-points", {
        type: "geojson",
        data: clickedPointsSource,
      });

      map.current.addLayer({
        id: "clicked-points-layer",
        type: "circle",
        source: "clicked-points",
        paint: {
          "circle-radius": 1,
          "circle-color": "red",
        },
      });
    }
  };

  const showPolygon = () => {
    setCount((prevCount) => prevCount + 1);

    const polygon = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [clickedPoints.map((point) => point.geometry.coordinates)],
      },
    };

    map.current.addSource(`polygon-${count}`, {
      type: "geojson",
      data: polygon,
    });

    map.current.addLayer({
      id: `polygon-layer-${count}`,
      type: "fill",
      source: `polygon-${count}`,
      layout: {},
      paint: {
        "fill-color": "red",
        "fill-opacity": 0.7,
      },
    });
    setClickedPoints([]);
  };

  const show3D = () => {
    map.current.removeLayer("add-2d-buildings");

    setIs3D(!is3D);

    const layerId = is3D ? "add-2d-buildings" : "add-3d-buildings";

    map.current.addLayer({
      id: layerId,
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: is3D ? "fill" : "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": is3D ? 0 : 1,
      },
    });
  };

  return (
    <div className="map-container" ref={mapContainerRef}>
      <div onClick={handleClick} className="showPolygonButton">
        Add Point
      </div>
      <div onClick={showPolygon} className="showPolygonButton">
        Show Polygon
      </div>
      <div onClick={show3D} className="show3DButton">
        Toggle 3D Buildings
      </div>
    </div>
  );
};

export default Map;
