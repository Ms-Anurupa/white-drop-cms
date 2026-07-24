/* eslint-disable react-hooks/exhaustive-deps */
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useRef, useEffect } from "react";
import riderIcon from "../assets/images/bike-rider.png";

const containerStyle = {
  width: "100%",
  height: "550px",
};

const defaultCenter = {
  lat: 22.5726,
  lng: 88.3639,
};

const GOOGLE_MAPS_LIBRARIES = ["marker"];

export default function DriverMap({ driverLocation }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const imgRef = useRef(null);

  const animationRef = useRef(null);
  const currentPositionRef = useRef(null);
  const currentHeadingRef = useRef(0);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const handleLoad = (map) => {
    mapRef.current = map;

    // Build the marker's visual content once the map is ready
    const wrapper = document.createElement("div");
    wrapper.style.width = "60px";
    wrapper.style.height = "60px";

    const img = document.createElement("img");
    img.src = riderIcon;
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.transformOrigin = "center center";
    img.style.transition = "transform 2000ms linear";
    img.style.transform = `rotate(${currentHeadingRef.current}deg)`;

    wrapper.appendChild(img);
    imgRef.current = img;

    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position: defaultCenter,
      content: wrapper,
    });
  };

  // Shortest angular distance from `from` to `to`, in range [-180, 180]
  const shortestDelta = (from, to) => {
    return (((to - from + 180) % 360) + 360) % 360 - 180;
  };

  const animateMarker = (start, end, startHeading, endHeading) => {
    cancelAnimationFrame(animationRef.current);

    const duration = 3000;
    const startTime = performance.now();
    const headingDelta = shortestDelta(startHeading, endHeading);

    const animate = (now) => {
      let progress = Math.min((now - startTime) / duration, 1);

      // easeInOutQuad
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const position = {
        lat: start.lat + (end.lat - start.lat) * eased,
        lng: start.lng + (end.lng - start.lng) * eased,
      };
      const heading = startHeading + headingDelta * eased;

      markerRef.current.position = position; 
      if (imgRef.current) {
        imgRef.current.style.transform = `rotate(${heading}deg)`;
      }

      mapRef.current.panTo(position);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        currentPositionRef.current = end;
        currentHeadingRef.current = endHeading;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!driverLocation) return;
    if (!markerRef.current) return;

    const nextPosition = {
      lat: Number(driverLocation.latitude),
      lng: Number(driverLocation.longitude),
    };
    const nextHeading =
      driverLocation.heading !== undefined
        ? Number(driverLocation.heading)
        : currentHeadingRef.current;

    if (!currentPositionRef.current) {
      currentPositionRef.current = nextPosition;
      currentHeadingRef.current = nextHeading;

      markerRef.current.position = nextPosition;
      if (imgRef.current) {
        imgRef.current.style.transform = `rotate(${nextHeading}deg)`;
      }

      mapRef.current.panTo(nextPosition);
      return;
    }

    animateMarker(
      currentPositionRef.current,
      nextPosition,
      currentHeadingRef.current,
      nextHeading
    );
  }, [driverLocation]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (markerRef.current) {
        markerRef.current.map = null; 
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-137.5 flex justify-center items-center">
        Loading Map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={16}
      onLoad={handleLoad}
      options={{
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID, 
      }}
    />
  );
}