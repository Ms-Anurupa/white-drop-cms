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
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="product" element={<Product />} />
              <Route path="product/addProduct" element={<AddProduct />} />
              <Route path="product/editProduct/:product_id" element={<EditProduct />} />
              <Route path="customer" element={<Customer />} />
              <Route path="orders" element={<Order />} />
              <Route path="production" element={<Production />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="customerHelpLine" element={<CustomerHelpLine />} />
              <Route path="support" element={<Support />} />
              <Route
                path="support/locality-manager"
                element={<LocalityManager />}
              />
              <Route path="support/offer-manager" element={<OfferManager />} />
              <Route
                path="support/offer-manager/add-offer"
                element={<AddOffer />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </>
  );
};

export default App;
