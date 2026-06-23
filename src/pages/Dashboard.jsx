import { useNavigate } from "react-router-dom";
import productImage from "../assets/images/dairy-products.png";
import customerImg from "../assets/images/customer.png";
import salesImg from "../assets/images/trend.png";
import productionImg from "../assets/images/presentation.png";
import inventoryImg from "../assets/images/inventory.png";
import mapImg from "../assets/images/map.png";
import helpLine from "../assets/images/helpline.png";
import customerServiceImg from "../assets/images/customer-service.png";
import { ArrowRight } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Products",
      img: productImage,
      gradient: "from-pink-500 to-rose-400",
      onClick: () => navigate("/dashboard/product"),
    },
    {
      title: "Customers",
      img: customerImg,
      gradient: "from-purple-500 to-indigo-400",
      onClick: () => navigate("/dashboard/customer"),
    },
    {
      title: "Sales / Orders",
      img: salesImg,
      gradient: "from-orange-500 to-amber-400",
      onClick: () => navigate("/dashboard/orders"),
    },
    {
      title: "Daily Milk Production",
      img: productionImg,
      gradient: "from-cyan-500 to-sky-400",
      onClick: () => navigate("/dashboard/production"),
    },
    {
      title: "Inventory Manager",
      img: inventoryImg,
      gradient: "from-emerald-500 to-green-400",
      onClick: () => navigate("/dashboard/inventory"),
    },
    {
      title: "Track Deliveries",
      img: mapImg,
      gradient: "from-blue-500 to-indigo-500",
      onClick: () => navigate("/dashboard/deliveries"),
    },
    {
      title: "Customer Helpline",
      img: helpLine,
      gradient: "from-yellow-500 to-orange-400",
      onClick: () => navigate("/dashboard/customerHelpLine"),
    },
    {
      title: "Service Manager",
      img: customerServiceImg,
      gradient: "from-fuchsia-500 to-pink-500",
      onClick: () => navigate("/dashboard/support"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* CONTENT */}
      <div className="px-2 md:px-4 pb-4">
        {/* TOP BANNER */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <h2 className="text-2xl font-semibold">Welcome to CMS Admin Panel</h2>
          <p className="text-sm opacity-80 mt-1">
            Manage products, customers, orders & operations in one place.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={card.onClick}
              className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white"
            >
              {/* gradient top bar */}
              <div className={`h-2 w-full bg-gradient-to-r ${card.gradient}`} />

              <div className="p-5 flex flex-col items-center text-center">
                {/* IMAGE */}
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-slate-100 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-12 h-12 object-contain"
                  />
                </div>

                {/* TITLE */}
                <h3 className="mt-4 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                  {card.title}
                </h3>

                {/* BUTTON */}
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500 group-hover:text-gray-700 transition">
                  View details
                  <span
                    clas
                    sName="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
                  >
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </div>
              </div>

              {/* hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-blue-500 to-purple-500 transition" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
