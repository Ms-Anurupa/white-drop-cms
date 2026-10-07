/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { MapPin, Search, MapPinIcon, AlertCircle } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

import offlineOrderStore from "@/zustand/Store/offlineOrderStore";
import Loader from "./Loader";

const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 };

// --- Custom Autocomplete (Internal to this file) ---
const MapAutocomplete = ({ onPlaceSelect }) => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");
  
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!placesLib || !map) return;
    setAutocompleteService(new placesLib.AutocompleteService());
    setPlacesService(new placesLib.PlacesService(map));
  }, [placesLib, map]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (!val) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (autocompleteService) {
      autocompleteService.getPlacePredictions({ input: val }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setIsOpen(true);
        } else {
          setPredictions([]);
        }
      });
    }
  };

  const handlePredictionSelect = (prediction) => {
    setInputValue(prediction.description);
    setIsOpen(false);
    
    const mainText = prediction.structured_formatting?.main_text || "";
    const secondaryText = prediction.structured_formatting?.secondary_text || prediction.description;

    if (placesService) {
      placesService.getDetails({ placeId: prediction.place_id, fields: ["geometry", "formatted_address"] }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          map.panTo({ lat, lng });
          map.setZoom(16);
          onPlaceSelect({ lat, lng, mainText, secondaryText, fullAddress: place.formatted_address });
        }
      });
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg z-10">
      <div className="relative shadow-md rounded-lg bg-white">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for an address or landmark..."
          className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {isOpen && predictions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-64 overflow-y-auto z-20 divide-y divide-gray-50">
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handlePredictionSelect(prediction)}
              className="px-4 py-3 hover:bg-blue-50 transition flex items-start gap-3 cursor-pointer group"
            >
              <MapPinIcon size={18} className="text-gray-400 group-hover:text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{prediction.structured_formatting?.main_text}</span>
                <span className="text-xs text-gray-500 mt-0.5">{prediction.structured_formatting?.secondary_text}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Reusable Form Component ---
const OfflineAddressForm = ({ userUid, onSuccess, showSkip = false, onSkip }) => {
  const [loading, setLoading] = useState(false);
  const addOfflineCustomerAddress = offlineOrderStore((state) => state.addOfflineCustomerAddress);

  const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
  const [apartment, setApartment] = useState("");
  const [locality, setLocality] = useState("");
  const [addressType, setAddressType] = useState("Home");

  const handleMapClick = useCallback((e) => {
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    setMarkerPosition({ lat, lng });

    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setLocality(results[0].formatted_address);
        }
      });
    }
  }, []);

  const handleAutocompleteSelect = useCallback(({ lat, lng, mainText, secondaryText, fullAddress }) => {
    setMarkerPosition({ lat, lng });
    if (mainText) setApartment(mainText);
    if (secondaryText) {
      setLocality(secondaryText);
    } else {
      setLocality(fullAddress);
    }
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!locality) {
      toast.error("Locality is required. Please drop a pin on the map.");
      return;
    }

    try {
      setLoading(true);
      await addOfflineCustomerAddress({
        userUid,
        apartment,
        locality,
        coordinate: markerPosition,
        type: addressType,
      });

      toast.success("Address saved successfully!");
      if (onSuccess) onSuccess(); // Notify parent it succeeded
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Saving address..." />;

  return (
    <div className="space-y-5">
      {/* Warning Banner (Only show if this is the initial setup) */}
      {showSkip && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
          <div className="text-sm">
            <p className="font-medium">Address is highly recommended</p>
            <p className="mt-0.5 text-amber-700/90">
              You cannot place an offline order without selecting a valid delivery address.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveAddress} className="space-y-6">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Pinpoint Location</label>
            <div className="h-[400px] w-full relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <MapAutocomplete onPlaceSelect={handleAutocompleteSelect} />
              <Map mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID} defaultCenter={DEFAULT_CENTER} defaultZoom={14} onClick={handleMapClick} disableDefaultUI={true} zoomControl={true}>
                <AdvancedMarker position={markerPosition} />
              </Map>
            </div>
            <p className="text-xs text-gray-500 mt-1">Search for an address or click directly on the map.</p>
          </div>
        </APIProvider>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Apartment / Flat / Block</label>
            <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="e.g. Block 6, Flat 2A" className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Type</label>
            <select value={addressType} onChange={(e) => setAddressType(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition cursor-pointer">
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Locality / Street</label>
            <textarea required value={locality} onChange={(e) => setLocality(e.target.value)} rows={2} placeholder="Search on map or type here..." className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          {showSkip ? (
            <button type="button" onClick={onSkip} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition cursor-pointer">
              Skip for now
            </button>
          ) : (
            <div /> /* Empty div keeps Save button on the right */
          )}
          <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
            <MapPin size={16} /> Save Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfflineAddressForm;