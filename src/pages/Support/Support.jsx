import { useNavigate } from "react-router-dom";
import customerImg from "../../assets/images/customer-service.png";
import placeImg from "../../assets/images/place.png";
import discountImg from "../../assets/images/discount.png";

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="">
      {/* Header */}
      <app-header />

      <section className="px-4 md:px-6">
        <div className="w-full mx-auto">
          {/* Page Heading */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src={customerImg}
              alt="Service Manager"
              className="w-10 h-10 object-contain"
              loading="lazy"
            />
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Service Manager
            </h1>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Locality Manager */}
            <div
              onClick={() => navigate("/dashboard/support/locality-manager")}
              className="cursor-pointer rounded-xl p-6 text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <img
                  src={placeImg}
                  alt="Locality Manager"
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                />
                <h2 className="text-lg font-semibold">Locality Manager</h2>
              </div>

              <p className="mt-6 flex items-center gap-2 text-sm opacity-90">
                view details
                <span className="text-lg">→</span>
              </p>
            </div>

            {/* Offer Manager */}
            <div
              onClick={() => navigate("/dashboard/support/offer-manager")}
              className="cursor-pointer rounded-xl p-6 text-white bg-gradient-to-r from-green-400 to-green-900 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <img
                  src={discountImg}
                  alt="Offer Manager"
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                />
                <h2 className="text-lg font-semibold">Offer Manager</h2>
              </div>

              <p className="mt-6 flex items-center gap-2 text-sm opacity-90">
                view details
                <span className="text-lg">→</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
