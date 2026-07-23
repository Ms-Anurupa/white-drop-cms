import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socketService } from '../Service/SocketService';

export default function LocationTracker() {
  const { driverId } = useParams();
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    if (!driverId) return;

    // 1. Establish/Ensure Connection
    socketService.connect();

    // 2. Set up event listener FIRST
    socketService.onLocationUpdate((data) => {
      setDriverLocation(data);
    });

    // 3. Join room SECOND
    socketService.joinDriverRoom(driverId);

    // 4. Cleanup on unmount or driverId change
    return () => {
      socketService.leaveDriverRoom(driverId);
      socketService.removeLocationListener();
    };
  }, [driverId]);

  if (!driverId) {
    return (
      <div className="p-4 text-red-500">
        Error: No Driver ID provided in the URL.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Tracking</h2>
      <div className="mb-4">
        <span className="text-gray-500">Driver ID:</span> 
        <span className="ml-2 font-mono">{driverId}</span>
      </div>

      {driverLocation ? (
        <div className="bg-white p-4 rounded shadow border border-green-200">
          <h3 className="font-semibold text-green-600 mb-2">🟢 Live Signal Active</h3>
          <p><strong>Latitude:</strong> {driverLocation.latitude}</p>
          <p><strong>Longitude:</strong> {driverLocation.longitude}</p>
          {driverLocation.heading !== undefined && (
            <p><strong>Heading:</strong> {driverLocation.heading}°</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded animate-pulse">
          <p className="text-gray-600">Waiting for GPS signal from driver's device...</p>
        </div>
      )}
    </div>
  );
}