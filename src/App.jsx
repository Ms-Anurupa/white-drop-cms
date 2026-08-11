import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layout/DashboardLayout";
import Product from "./pages/Product/Product";
import Customer from "./pages/Customer/Customer";
import Order from "./pages/Order/Order";
import Production from "./pages/Production/Production";
import Deliveries from "./pages/Deliveries/Deliveries";
import Support from "./pages/Support/Support";
import Inventory from "./pages/Inventory/Inventory";
import CustomerHelpLine from "./pages/CustomerHelpLine/CustomerHelpLine";
import AddProduct from "./components/AddProduct";
import LocalityManager from "./components/LocalityManager";
import OfferManager from "./components/OfferManager";
import AddOffer from "./components/AddOffer";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import GlobalLoader from "./components/GlobalLoader";
import { ConfirmProvider } from "./components/ConfirmProvider";
import { ToastContainer } from "react-toastify";
import EditProduct from "./components/EditProduct";
import VerifyMail from "./pages/auth/VerifyMail";
import DeliveryPartnerList from "./pages/DeliveryPartner/DeliveryPartnerList";
import DeliveryPartnerDetails from "./components/DeliveryPartnerDetails";
import LocationTracker from "./components/LocationTracker";
import OrderViewDetails from "./components/OrderViewDetails";
import CreateDeliveryPartner from "./components/CreateDeliveryPartner";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCorporateOrder from "./components/CreateCorporateOrder";
import CorporateOrder from "./pages/CorporateOrder/CorporateOrder";
import CorporateAccounts from "./pages/CorporateAccounts/CorporateAccounts";
import CreateCorporateAccount from "./components/CreateCorporateAccount";
import CorporateOrderView from "./components/CorporateOrderView";
import CorporateOrderEdit from "./components/CorporateOrderEdit";
import OfferList from "./pages/Offer/OfferList";
import CreateOffer from "./components/CreateOffer";
import OfferType from "./components/OfferType";
import EditOffer from "./components/EditOffer";

const App = () => {
  return (
    <>
      <ConfirmProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          theme="colored"
        />
        <BrowserRouter>
          <GlobalLoader />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/verify-mail" element={<VerifyMail />} />
            <Route
              path="/location-tracker/:driverId"
              element={<LocationTracker />}
            />

            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="product" element={<Product />} />
                <Route path="product/addProduct" element={<AddProduct />} />
                <Route
                  path="product/editProduct/:product_id"
                  element={<EditProduct />}
                />
                <Route path="customer" element={<Customer />} />
                <Route path="orders" element={<Order />} />
                <Route path="corporate-orders" element={<CorporateOrder />} />
                <Route path="corporate-orders/view/:id" element={<CorporateOrderView />} />
                <Route path="corporate-orders/edit/:id" element={<CorporateOrderEdit />} />
                <Route path="corporate-accounts" element={<CorporateAccounts />} />
                <Route path="corporate-orders/create-corporate-order" element={<CreateCorporateOrder />} />
                <Route path="corporate-accounts/create-corporate-account" element={<CreateCorporateAccount />} />
                <Route
                  path="orders/orderDetails/:id"
                  element={<OrderViewDetails />}
                />
                <Route path="production" element={<Production />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="deliveries" element={<Deliveries />} />
                <Route
                  path="deliveryPartners"
                  element={<DeliveryPartnerList />}
                />
                <Route
                  path="deliveryPartnerDetails/:deliveryPersonId"
                  element={<DeliveryPartnerDetails />}
                />
                <Route path="customerHelpLine" element={<CustomerHelpLine />} />
                <Route path="support" element={<Support />} />
                <Route
                  path="support/locality-manager"
                  element={<LocalityManager />}
                />
                <Route
                  path="support/offer-manager"
                  element={<OfferManager />}
                />
                <Route
                  path="support/offer-manager/add-offer"
                  element={<AddOffer />}
                />
                <Route
                  path="createDeliveryPartner"
                  element={<CreateDeliveryPartner />}
                />
                <Route
                  path="offers"
                  element={<OfferList />}
                />
                <Route
                  path="offers/create"
                  element={<CreateOffer />}
                />
                <Route
                  path="offerType"
                  element={<OfferType />}
                />
                <Route
                  path="offers/edit/:offerId"
                  element={<EditOffer />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </>
  );
};

export default App;
