import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Bike,
  Star,
  Package,
  Calendar,
  BadgeCheck,
} from "lucide-react";


const initialPartners = [
  {
    id: "DP-2001",
    name: "Suresh Yadav",
    vehicle: "Bike",
    zone: "Salt Lake, Kolkata",
    status: "Active",
    phone: "9876501234",
    email: "suresh.y@gmail.com",
    joinedAt: "2025-11-12",
    rating: 4.7,
    deliveries: 1284,
    onTimeRate: "96%",
    address: "12/3 Sector V, Salt Lake, Kolkata, WB 700091",
    vehicleNumber: "WB-02-AB-4521",
    recentDeliveries: [
      {
        id: "ORD-9911",
        area: "Sector V",
        date: "2026-07-19",
        status: "Delivered",
      },
      {
        id: "ORD-9905",
        area: "Karunamoyee",
        date: "2026-07-18",
        status: "Delivered",
      },
      {
        id: "ORD-9890",
        area: "City Centre",
        date: "2026-07-18",
        status: "Delivered",
      },
    ],
  },
  {
    id: "DP-2002",
    name: "Manoj Kumar",
    vehicle: "Scooter",
    zone: "Park Street, Kolkata",
    status: "On Delivery",
    phone: "9123409876",
    email: "manoj.k@gmail.com",
    joinedAt: "2026-01-05",
    rating: 4.5,
    deliveries: 742,
    onTimeRate: "93%",
    address: "45 Free School Street, Park Street, Kolkata, WB 700016",
    vehicleNumber: "WB-06-CD-1187",
    recentDeliveries: [
      {
        id: "ORD-9920",
        area: "Park Street",
        date: "2026-07-20",
        status: "In Transit",
      },
      {
        id: "ORD-9899",
        area: "Camac Street",
        date: "2026-07-19",
        status: "Delivered",
      },
    ],
  },
  {
    id: "DP-2003",
    name: "Ravi Prakash",
    vehicle: "Bike",
    zone: "Howrah",
    status: "Inactive",
    phone: "9988001122",
    email: "ravi.p@gmail.com",
    joinedAt: "2025-08-22",
    rating: 4.2,
    deliveries: 2031,
    onTimeRate: "90%",
    address: "8 Station Road, Howrah, WB 711101",
    vehicleNumber: "WB-11-EF-7734",
    recentDeliveries: [
      {
        id: "ORD-9760",
        area: "Howrah Maidan",
        date: "2026-07-10",
        status: "Delivered",
      },
    ],
  },
  {
    id: "DP-2004",
    name: "Deepak Ghosh",
    vehicle: "Bicycle",
    zone: "New Town, Kolkata",
    status: "Active",
    phone: "9871122334",
    email: "deepak.g@gmail.com",
    joinedAt: "2026-03-14",
    rating: 4.8,
    deliveries: 356,
    onTimeRate: "98%",
    address: "Action Area II, New Town, Kolkata, WB 700156",
    vehicleNumber: "N/A",
    recentDeliveries: [
      {
        id: "ORD-9921",
        area: "Eco Park",
        date: "2026-07-20",
        status: "Delivered",
      },
      {
        id: "ORD-9915",
        area: "DLF IT Park",
        date: "2026-07-20",
        status: "Delivered",
      },
    ],
  },
  {
    id: "DP-2005",
    name: "Anil Mahato",
    vehicle: "Scooter",
    zone: "Behala, Kolkata",
    status: "On Delivery",
    phone: "9007766554",
    email: "anil.m@gmail.com",
    joinedAt: "2025-12-30",
    rating: 4.4,
    deliveries: 918,
    onTimeRate: "91%",
    address: "22 James Long Sarani, Behala, Kolkata, WB 700034",
    vehicleNumber: "WB-04-GH-9902",
    recentDeliveries: [
      {
        id: "ORD-9918",
        area: "Behala Chowrasta",
        date: "2026-07-20",
        status: "In Transit",
      },
    ],
  },
  {
    id: "DP-2006",
    name: "Bikash Roy",
    vehicle: "Bike",
    zone: "Dum Dum, Kolkata",
    status: "Active",
    phone: "9765432109",
    email: "bikash.r@gmail.com",
    joinedAt: "2025-09-18",
    rating: 4.6,
    deliveries: 1502,
    onTimeRate: "95%",
    address: "3 Jessore Road, Dum Dum, Kolkata, WB 700028",
    vehicleNumber: "WB-25-IJ-3345",
    recentDeliveries: [
      {
        id: "ORD-9902",
        area: "Dum Dum Cantt",
        date: "2026-07-19",
        status: "Delivered",
      },
    ],
  },
  {
    id: "DP-2007",
    name: "Sanjay Thapa",
    vehicle: "Bike",
    zone: "Tollygunge, Kolkata",
    status: "Inactive",
    phone: "9334455667",
    email: "sanjay.t@gmail.com",
    joinedAt: "2025-06-02",
    rating: 4.0,
    deliveries: 2588,
    onTimeRate: "88%",
    address: "17 Deshapran Sasmal Road, Tollygunge, WB 700033",
    vehicleNumber: "WB-09-KL-5567",
    recentDeliveries: [
      {
        id: "ORD-9700",
        area: "Tollygunge Metro",
        date: "2026-07-05",
        status: "Delivered",
      },
    ],
  },
];

const statusStyle = {
  Active: "bg-green-100 text-green-600",
  "On Delivery": "bg-blue-100 text-blue-600",
  Inactive: "bg-gray-200 text-gray-500",
};

const deliveryStatusStyle = {
  Delivered: "bg-green-100 text-green-600",
  "In Transit": "bg-yellow-100 text-yellow-700",
};

const DeliveryPartnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log(id);
console.log(initialPartners);

  // Replace this with your API later
  const partner = initialPartners.find((item) => item.id === id);

  if (!partner) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <p className="text-gray-500">Delivery partner not found.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-700">
            {partner.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {partner.name}
              <BadgeCheck size={20} className="text-blue-500" />
            </h2>

            <p className="text-gray-500">{partner.id}</p>
          </div>
        </div>

        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyle[partner.status]}`}
        >
          {partner.status}
        </span>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Star size={15} />
            Rating
          </div>

          <p className="text-2xl font-semibold mt-2">{partner.rating}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Package size={15} />
            Deliveries
          </div>

          <p className="text-2xl font-semibold mt-2">
            {partner.deliveries}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <BadgeCheck size={15} />
            On Time
          </div>

          <p className="text-2xl font-semibold mt-2">
            {partner.onTimeRate}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar size={15} />
            Joined
          </div>

          <p className="font-semibold mt-2">{partner.joinedAt}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Contact Information</h3>

          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Phone size={15} />
              {partner.phone}
            </p>

            <p className="flex items-center gap-2">
              <Mail size={15} />
              {partner.email}
            </p>

            <p className="flex items-center gap-2">
              <MapPin size={15} />
              {partner.address}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Vehicle Information</h3>

          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Bike size={15} />
              {partner.vehicle}
            </p>

            <p>
              <strong>Vehicle No:</strong> {partner.vehicleNumber}
            </p>

            <p>
              <strong>Zone:</strong> {partner.zone}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">Recent Deliveries</h3>

        <div className="space-y-3">
          {partner.recentDeliveries.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b last:border-0 pb-3"
            >
              <div>
                <p className="font-medium">{item.id}</p>
                <p className="text-sm text-gray-500">{item.area}</p>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${deliveryStatusStyle[item.status]}`}
                >
                  {item.status}
                </span>

                <p className="text-xs text-gray-400 mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerDetails;