import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
  OverlayView,
} from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPinned } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "620px",
};

const DEFAULT_CENTER = {
  lat: 22.5726,
  lng: 88.3639,
};

export default function DriverMap({ driverLocation, deliveryOrders = [] }) {
  const [hoveredOrder, setHoveredOrder] = useState(null);
  const mapRef = useRef(null);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const driverPosition = useMemo(() => {
    if (!driverLocation) {
      return null;
    }

    const latitude = Number(driverLocation?.latitude ?? driverLocation?.lat);
    const longitude = Number(driverLocation?.longitude ?? driverLocation?.lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      lat: latitude,
      lng: longitude,
    };
  }, [driverLocation]);

  const orders = useMemo(() => {
    if (!Array.isArray(deliveryOrders)) {
      return [];
    }

    return deliveryOrders;
  }, [deliveryOrders]);

  const orderMarkers = useMemo(() => {
    return orders
      .map((order, index) => {
        let latitude = Number(order?.shippingAddress?.coordinate?.lat);

        let longitude = Number(order?.shippingAddress?.coordinate?.lng);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return {
          ...order,

          markerPosition: {
            lat: latitude,
            lng: longitude,
          },

          markerKey:
            order?.id || order?.orderId || `${order?.addressId}-${index}`,
        };
      })
      .filter(Boolean);
  }, [orders]);

  const allMapPositions = useMemo(() => {
    const positions = [];

    if (driverPosition) {
      positions.push(driverPosition);
    }

    orderMarkers.forEach((order) => {
      if (order?.markerPosition) {
        positions.push(order.markerPosition);
      }
    });

    return positions;
  }, [driverPosition, orderMarkers]);

  const fitMapToMarkers = useCallback(() => {
    if (!mapRef.current || !window.google || !allMapPositions.length) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();

    allMapPositions.forEach((position) => {
      bounds.extend(position);
    });

    if (allMapPositions.length === 1) {
      mapRef.current.setCenter(allMapPositions[0]);

      mapRef.current.setZoom(15);

      return;
    }

    mapRef.current.fitBounds(bounds, {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    });
  }, [allMapPositions]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      fitMapToMarkers();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoaded, fitMapToMarkers]);

  const getShippingAddress = (order) => {
    const apartment = order?.shippingAddress?.apartment || "";
    const locality = order?.shippingAddress?.locality || "";

    return (
      [apartment, locality].filter(Boolean).join(", ") || "Address unavailable"
    );
  };

  if (loadError) {
    return (
      <div className="flex h-[620px] items-center justify-center rounded-2xl border border-red-100 bg-white">
        <div className="px-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <MapPinned size={20} className="text-red-500" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900">
            Unable to load Google Maps
          </h3>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[620px] items-center justify-center rounded-2xl border border-slate-100 bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

          <p className="text-sm font-medium text-slate-700">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Delivery Route</p>

          {/* <p className="mt-0.5 text-xs text-slate-500">
            {orders.length} assigned order
            {orders.length !== 1 ? "s" : ""} · {orderMarkers.length} mapped
            location
            {orderMarkers.length !== 1 ? "s" : ""}
          </p> */}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {driverPosition && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Driver
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Orders
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={
          driverPosition || orderMarkers[0]?.markerPosition || DEFAULT_CENTER
        }
        zoom={12}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        }}
      >
        {driverPosition && (
          <MarkerF
            position={driverPosition}
            title="Delivery Partner"
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="42"
      viewBox="0 0 42 52"
    >
      <path
        d="M21 2C10.5 2 2 10.5 2 21c0 13.5 19 29 19 29s19-15.5 19-29C40 10.5 31.5 2 21 2z"
        fill="#ef4444"
        stroke="#ffffff"
        stroke-width="3"
      />

      <circle
        cx="21"
        cy="21"
        r="7"
        fill="#ffffff"
      />
    </svg>
  `)}`,
              scaledSize: new window.google.maps.Size(34, 42),
              anchor: new window.google.maps.Point(17, 42),
            }}
            zIndex={1000}
          />
        )}

        {orderMarkers.map((order, index) => (
          <MarkerF
            key={order.markerKey}
            position={order.markerPosition}
            title={order.orderId || `Order ${index + 1}`}
            onMouseOver={() => setHoveredOrder(order)}
            onMouseOut={() => setHoveredOrder(null)}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="42"
      viewBox="0 0 42 52"
    >
      <path
        d="M21 2C10.5 2 2 10.5 2 21c0 13.5 19 29 19 29s19-15.5 19-29C40 10.5 31.5 2 21 2z"
        fill="#ef4444"
        stroke="#ffffff"
        stroke-width="3"
      />

      <circle
        cx="21"
        cy="21"
        r="7"
        fill="#ffffff"
      />
    </svg>
  `)}`,
              scaledSize: new window.google.maps.Size(34, 42),
              anchor: new window.google.maps.Point(17, 42),
            }}
            zIndex={100 + index}
          />
        ))}

        {hoveredOrder && hoveredOrder.markerPosition && (
          <OverlayView
            position={hoveredOrder.markerPosition}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={(width, height) => ({
              x: -(width / 2),
              y: -height - 12,
            })}
          >
            <div
              className="min-w-[240px] max-w-[260px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
              onMouseEnter={() => setHoveredOrder(hoveredOrder)}
              onMouseLeave={() => setHoveredOrder(null)}
            >
              {/* Order ID */}
              <div className="mb-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Order ID
                </p>

                <p className="text-sm font-bold text-slate-900">
                  {hoveredOrder?.orderId || "-"}
                </p>
              </div>

              {/* Customer */}
              <div className="mb-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Customer
                </p>

                <p className="text-xs font-semibold text-slate-800">
                  {hoveredOrder?.user?.customer_name || "Customer"}
                </p>
              </div>

              {/* Phone */}
              <div className="mb-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="text-xs font-medium text-slate-700">
                  {hoveredOrder?.user?.phone_num || "Phone unavailable"}
                </p>
              </div>

              {/* ORDER TOTAL + STATUS */}
              <div className="mb-2 grid grid-cols-2 gap-3">
                {/* ORDER TOTAL */}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Order Total
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    ₹{Number(hoveredOrder?.orderTotal || 0).toFixed(2)}
                  </p>
                </div>

                {/* STATUS */}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                      hoveredOrder?.orderStatus === "DELIVERED"
                        ? "bg-emerald-50 text-emerald-700"
                        : hoveredOrder?.orderStatus === "FAILED"
                          ? "bg-red-50 text-red-700"
                          : hoveredOrder?.orderStatus === "PLACED"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {hoveredOrder?.orderStatus || "UNKNOWN"}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Shipping Address
                </p>

                <p className="text-xs font-medium leading-4 text-slate-700">
                  {getShippingAddress(hoveredOrder)}
                </p>
              </div>
            </div>
          </OverlayView>
        )}
      </GoogleMap>

      {orders.length > 0 && orderMarkers.length < orders.length && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
          <div className="flex items-center gap-2">
            <MapPinned size={16} strokeWidth={2.2} className="text-red-400" />

            <p className="text-xs text-slate-500">
              {orders.length - orderMarkers.length} order
              {orders.length - orderMarkers.length !== 1 ? "s" : ""} could not
              be mapped because valid coordinates were not found.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
