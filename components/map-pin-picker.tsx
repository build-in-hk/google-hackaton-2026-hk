"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const defaultCenter = { lat: 22.2975, lng: 114.1723 };

const containerStyle = { width: "100%", height: "100%" };

type Pin = { lat: number; lng: number };

export function MapPinPicker({
  pin,
  onPin,
}: {
  pin: Pin | null;
  onPin: (p: Pin) => void;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: key,
    id: "pin-life-map-loader",
  });

  if (!key) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-400">
        <p>
          Add{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          for the map. Use manual coordinates below.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-red-400">
        Google Maps failed to load.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading map…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={pin ?? defaultCenter}
      zoom={pin ? 15 : 12}
      onClick={(e) => {
        if (e.latLng) {
          onPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      }}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      }}
    >
      {pin ? <Marker position={pin} /> : null}
    </GoogleMap>
  );
}
