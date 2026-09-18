import { useNavigate } from "react-router-dom";
import productImage from "../assets/images/dairy-products.png";
import expenseImage from "../assets/images/expenseImage.jpg";
import OrderImage from "../assets/images/OrderImage.jpg";
import DeliveryJobImage from "../assets/images/DeliveryJobImage.jpg";
import DeliveryPartnerImage from "../assets/images/DeliveryPartnerImage.jpg";
import OfferImage from "../assets/images/OfferImage.jpg";
import customerImg from "../assets/images/customer.png";
import salesImg from "../assets/images/trend.png";
import productionImg from "../assets/images/presentation.png";
import inventoryImg from "../assets/images/inventory.png";
import mapImg from "../assets/images/map.png";
import helpLine from "../assets/images/helpline.png";
import customerServiceImg from "../assets/images/customer-service.png";
import {
  ArrowRight,
  ShoppingCart,
  HandCoins,
  Truck,
  PackageCheck,
  HelpingHand,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Card config: grouped the same way as the sidebar's sections         */
/* ------------------------------------------------------------------ */

const sections = [
  {
    label: "Main menu",
    cards: [
      {
        title: "Product",
        img: productImage,
        gradient: "from-pink-500 to-rose-400",
        path: "/dashboard/product",
      },
      {
        title: "Expenses",
        img: expenseImage,
        gradient: "from-teal-500 to-emerald-400",
        path: "/dashboard/expense",
      },
      {
        title: "Orders",
        img: OrderImage,
        gradient: "from-orange-500 to-amber-400",
        path: "/dashboard/orders",
      },
      {
        title: "Customers",
        img: customerImg,
        gradient: "from-purple-500 to-indigo-400",
        path: "/dashboard/customer",
      },
      {
        title: "Corporate Accounts",
        img: customerServiceImg,
        gradient: "from-violet-500 to-purple-400",
        path: "/dashboard/corporate-accounts",
      },
    ],
  },
  {
    label: "Operations",
    cards: [
      {
        title: "Sales",
        img: salesImg,
        gradient: "from-red-500 to-orange-400",
        path: "/dashboard/sales",
      },
      {
        title: "Inventory",
        img: inventoryImg,
        gradient: "from-emerald-500 to-green-400",
        path: "/dashboard/inventory",
      },
      {
        title: "Packaging Job",
        img: productionImg,
        gradient: "from-cyan-500 to-sky-400",
        path: "/dashboard/packaging-job",
      },
    ],
  },
  {
    label: "Delivery",
    cards: [
      {
        title: "Delivery Job",
        img: DeliveryJobImage,
        gradient: "from-blue-500 to-indigo-500",
        path: "/dashboard/delivery-job",
      },
      {
        title: "Delivery Tracking",
        img: mapImg,
        gradient: "from-blue-500 to-indigo-500",
        path: "/dashboard/delivery-tracking",
      },
      {
        title: "Delivery Partner List",
        img: DeliveryPartnerImage,
        gradient: "from-sky-500 to-blue-400",
        path: "/dashboard/deliveryPartners",
      },
    ],
  },
  {
    label: "Offers",
    cards: [
      {
        title: "Offers",
        img: OfferImage,
        gradient: "from-fuchsia-500 to-pink-400",
        path: "/dashboard/offers",
      },
    ],
  },
  {
    label: "Help",
    cards: [
      {
        title: "Customer Helpline",
        img: helpLine,
        gradient: "from-yellow-500 to-orange-400",
        path: "/dashboard/customerHelpLine",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

const DashboardCard = ({ card, onClick }) => {
  const Icon = card.icon;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white"
    >
      {/* gradient top bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${card.gradient}`} />

      <div className="p-5 flex flex-col items-center text-center">
        {/* IMAGE / ICON */}
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-slate-100 group-hover:scale-110 transition-transform duration-300">
          {card.img ? (
            <img
              src={card.img}
              alt={card.title}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <Icon size={28} className="text-gray-600" />
          )}
        </div>

        {/* TITLE */}
        <h3 className="mt-4 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
          {card.title}
        </h3>

        {/* BUTTON */}
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500 group-hover:text-gray-700 transition">
          View details
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>

      {/* hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-blue-500 to-purple-500 transition" />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] bg-gradient-to-br ">
      {/* CONTENT */}
      <div className="p-2 md:p-4 pb-4">
        {/* TOP BANNER */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <h2 className="text-2xl font-semibold">Welcome to CMS Admin Panel</h2>
          <p className="text-sm opacity-80 mt-1">
            Manage products, customers, orders & operations in one place.
          </p>
        </div>

        {/* SECTIONS — mirrors the sidebar's grouping */}
        {sections.map((section, index) => (
          <div key={section.label} className={index > 0 ? "mt-8" : ""}>
            <p className="mb-3 px-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.label}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.cards.map((card) => (
                <DashboardCard
                  key={card.path}
                  card={card}
                  onClick={() => navigate(card.path)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
