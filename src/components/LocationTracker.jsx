/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Package, Navigation, Truck, Clock3, ArrowLeft } from "lucide-react";
import { socketService } from "../Service/SocketService";
import DriverMap from "./DriverMap";
import deliveryJobStore from "../zustand/Store/deliveryJobStore";

export default function LocationTracker() {
  const { driverId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const deliveryPartnerId =
    driverId || location.state?.deliveryPartnerId || null;

  const getDeliveryJobs = deliveryJobStore((state) => state.getDeliveryJobs);

  const deliveryJobs = deliveryJobStore((state) => state.deliveryJobs);

  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      try {
        if (!mounted) return;

        setLoading(true);

        await getDeliveryJobs();
      } catch (error) {
        console.error("Failed to load delivery jobs:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (deliveryPartnerId) {
      loadJobs();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [deliveryPartnerId, getDeliveryJobs]);

  const driverJobs = useMemo(() => {
    if (!deliveryPartnerId) {
      return [];
    }

    const jobs = Array.isArray(deliveryJobs) ? deliveryJobs : [];

    return jobs.filter(
      (job) =>
        String(job?.deliveryPartnerId || "") === String(deliveryPartnerId),
    );
  }, [deliveryJobs, deliveryPartnerId]);

  const deliveryOrders = useMemo(() => {
    if (!driverJobs.length) {
      return [];
    }

    return driverJobs.flatMap((job) => {
      if (!Array.isArray(job?.orders)) {
        return [];
      }

      return job.orders.map((order) => {
        const coordinate = order?.shippingAddress?.coordinate;

        const latitude = Number(coordinate?.lat);
        const longitude = Number(coordinate?.lng);

        return {
          ...order,

          deliveryJobId: job.id,
          deliveryJobName: job.name,
          deliveryArea: job.area,
          deliveryDate: job.deliveryDate,
          deliverySlot: job.slot,
          deliveryJobStatus: job.status,

          deliveryPartnerId: job.deliveryPartnerId,
          essId: order.addressId,
          shippingAddress: order.shippingAddress,

          latitude: Number.isFinite(latitude) ? latitude : null,

          longitude: Number.isFinite(longitude) ? longitude : null,
        };
      });
    });
  }, [driverJobs]);

  const uniqueDeliveryOrders = useMemo(() => {
    const map = new Map();

    deliveryOrders.forEach((order) => {
      const key =
        order?.id ||
        order?.orderId ||
        `${order?.addressId}-${order?.deliveryJobId}`;

      if (key && !map.has(key)) {
        map.set(key, order);
      }
    });

    return Array.from(map.values());
  }, [deliveryOrders]);

  useEffect(() => {
    if (!deliveryPartnerId) {
      return;
    }

    socketService.connect();

    const handleLocationUpdate = (data) => {
      if (
        data?.driverId &&
        String(data.driverId) !== String(deliveryPartnerId)
      ) {
        return;
      }

      if (
        data?.deliveryPartnerId &&
        String(data.deliveryPartnerId) !== String(deliveryPartnerId)
      ) {
        return;
      }

      setDriverLocation(data);
    };

    socketService.onLocationUpdate(handleLocationUpdate);

    socketService.joinDriverRoom(deliveryPartnerId);

    return () => {
      socketService.leaveDriverRoom(deliveryPartnerId);

      socketService.removeLocationListener();
    };
  }, [deliveryPartnerId]);

  if (!deliveryPartnerId) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <Truck size={22} className="text-red-500" />
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            Delivery partner not found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            No delivery partner ID was provided for tracking.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

          <p className="text-sm font-medium text-slate-700">
            Loading delivery tracking...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching assigned delivery jobs and orders
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {/* Left - Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex mb-2 cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
              <Navigation size={17} className="text-white" />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Live Tracking
              </h2>

              <p className="text-xs text-slate-500">
                Delivery partner location & assigned orders
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              driverLocation ? "animate-pulse bg-emerald-500" : "bg-slate-300"
            }`}
          />

          <span className="text-xs font-medium text-slate-600">
            {driverLocation ? "Live signal active" : "Waiting for GPS"}
          </span>
        </div>
      </div>

      <DriverMap
        driverLocation={driverLocation}
        deliveryOrders={uniqueDeliveryOrders}
      />

      <div className="mt-4">
        {driverLocation ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <Navigation size={17} className="text-emerald-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Live location active
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                The delivery partner's location is being updated in real time.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Clock3 size={17} className="text-slate-500" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Waiting for GPS signal
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                The map will update automatically when the driver's device sends
                its location.
              </p>
            </div>
          </div>
        )}
      </div>

      {uniqueDeliveryOrders.length === 0 && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
            <Package size={19} className="text-slate-500" />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            No assigned orders
          </p>

          <p className="mt-1 text-xs text-slate-500">
            This delivery partner currently has no orders assigned to their
            delivery jobs.
          </p>
        </div>
      )}
    </div>
  );
}
