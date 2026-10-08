/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { Search, Calendar, Clock, Plus, Minus, X, ShoppingCart, Trash2, } from "lucide-react";

import useDebounce from "../../utils/useDebounce";  
import offlineOrderStore from "@/zustand/Store/offlineOrderStore";
import productDataStore from "@/zustand/Store/productDataStore";
import deliveryJobStore from "@/zustand/Store/deliveryJobStore";
import OfflineAddressForm from "../OfflineAddressForm";
import { toast } from "react-toastify";

const OfflineSelectionBlock = ({ mode = "order", onChange }) => {
  // --- STORES ---
  const { searchOfflineCustomers } = offlineOrderStore();
  const { products, getAllProducts } = productDataStore();
  const { deliverySlots, getDeliverySlots } = deliveryJobStore();

  // --- STATE ---
  // User Search
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const debouncedUserSearch = useDebounce(userSearchTerm, 500);
  const [userOptions, setUserOptions] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Selections
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [cart, setCart] = useState([]);

  // Product Search (Client side)
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(""); // product_id
  const [selectedVariant, setSelectedVariant] = useState(""); // variant_id

  // Modals
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    getAllProducts();
    getDeliverySlots();
  }, [getAllProducts, getDeliverySlots]);

  // --- BUBBLE STATE TO PARENT ---
  useEffect(() => {
    if (onChange) {
      onChange({
        userUid: selectedUser?.userUid || null,
        addressId: selectedAddressId,
        deliverySlotId: selectedSlotId,
        deliveryDate: selectedDate, // Will be empty string if mode === "subscription"
        cart: cart, // Array of { item: { product_id, variant_id }, qty }
      });
    }
  }, [selectedUser, selectedAddressId, selectedSlotId, selectedDate, cart, onChange]);

  // --- USER SEARCH LOGIC (Server-side) ---
  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedUserSearch) {
        setUserOptions([]);
        return;
      }
      try {
        const res = await searchOfflineCustomers({ searchTerm: debouncedUserSearch, limit: 5 });
        if (res.success) setUserOptions(res.data);
      } catch (error) {
        console.error("Failed to fetch users");
        toast.error("Failed to fetch users")
      }
    };
    fetchUsers();
  }, [debouncedUserSearch, searchOfflineCustomers]);

  // --- ADDRESS REFRESH LOGIC ---
  const handleAddressAdded = async () => {
    setIsAddressModalOpen(false);
    try {
      // Re-fetch the exact user by phone number to get the newly attached address
      const res = await searchOfflineCustomers({ searchTerm: selectedUser.phone_num, limit: 1 });
      if (res.success && res.data.length > 0) {
        const updatedUser = res.data[0];
        setSelectedUser(updatedUser);
        
        // Auto-select the newest address (assuming the last one in the array is newest, or sort by createdAt)
        if (updatedUser.userAddresses?.length > 0) {
          const newestAddress = updatedUser.userAddresses[updatedUser.userAddresses.length - 1];
          setSelectedAddressId(newestAddress.addressId);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user addresses", error);
    }
  };

  // --- PRODUCT FILTERING LOGIC (Client-side) ---
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return products;
    return products.filter(p => 
      p.product_name.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [products, productSearchTerm]);

  const activeProduct = useMemo(() => 
    products.find(p => p.product_id === selectedProduct), 
  [products, selectedProduct]);

  // --- CART LOGIC ---
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant) return;

    const variantData = activeProduct.variants.find(v => v.product_item_id === selectedVariant);
    
    setCart(prev => {
      const existingIdx = prev.findIndex(c => c.item.variant_id === selectedVariant);

      const newItem = {
        item: {
          product_id: activeProduct.product_id,
          variant_id: selectedVariant,
          product_name: activeProduct.product_name,
          variant_name: variantData?.variant_name || `${variantData?.quantity}${variantData?.unit}`,
          price: variantData?.price || 0
        },
        qty: 1
      };

      // STRICT MODE: SUBSCRIPTIONS
      if (mode === "subscription") {
        if (existingIdx >= 0) {
          // Same item? Just increase the qtyPerDelivery
          const newCart = [...prev];
          newCart[existingIdx].qty += 1;
          return newCart;
        } else {
          // Different item? Replace the entire cart
          if (prev.length > 0) {
            toast.info("Subscriptions support 1 product type. Item replaced.");
          }
          return [newItem];
        }
      }

      // NORMAL MODE: ORDERS
      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].qty += 1;
        return newCart;
      }
      return [...prev, newItem];
    });

    // Reset selection
    setSelectedProduct("");
    setSelectedVariant("");
    setProductSearchTerm("");
  };

  const updateCartQty = (variantId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(c => 
      c.item.variant_id === variantId ? { ...c, qty: newQty } : c
    ));
  };

  const removeCartItem = (variantId) => {
    setCart(prev => prev.filter(c => c.item.variant_id !== variantId));
  };

  return (
    <div className="space-y-8">
      {/* ================= 1. CUSTOMER & ADDRESS ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Search size={18} className="text-blue-600" /> Customer Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* User Search Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Customer
            </label>
            <input
              type="text"
              value={
                selectedUser
                  ? `${selectedUser.customer_name} (${selectedUser.phone_num})`
                  : userSearchTerm
              }
              onChange={(e) => {
                setSelectedUser(null);
                setSelectedAddressId("");
                setUserSearchTerm(e.target.value);
                setIsUserDropdownOpen(true);
              }}
              onFocus={() => setIsUserDropdownOpen(true)}
              placeholder="Search by name or phone..."
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />

            {isUserDropdownOpen && userSearchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {userOptions.length > 0 ? (
                  userOptions.map((user) => (
                    <div
                      key={user.userUid}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearchTerm("");
                        setIsUserDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                    >
                      <p className="font-medium text-gray-900">
                        {user.customer_name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">{user.phone_num}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No customers found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Address Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Delivery Address
            </label>
            <div className="flex gap-2">
              <select
                disabled={!selectedUser}
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer"
              >
                <option value="">Select saved address...</option>
                {selectedUser?.userAddresses?.map((addr) => (
                  <option key={addr.addressId} value={addr.addressId}>
                    {addr.addressType} - {addr.locality.substring(0, 40)}...
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!selectedUser}
                onClick={() => setIsAddressModalOpen(true)}
                title="Add New Address"
                className="px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. DELIVERY DETAILS ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={18} className="text-blue-600" /> Delivery Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Only show Date Picker if Mode is Order */}
          {mode === "order" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" /> Delivery Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()} // Opens picker when clicking anywhere on the input
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Delivery Slot
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
            >
              <option value="">Select a time slot...</option>
              {deliverySlots?.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.name} ({slot.from} - {slot.to})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= 3. PRODUCT CART ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart size={18} className="text-blue-600" /> Build Cart
        </h2>

        {/* Product Selection Row */}
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search Product
            </label>
            <input
              type="text"
              value={productSearchTerm}
              onChange={(e) => {
                setProductSearchTerm(e.target.value);
                setSelectedProduct("");
                setSelectedVariant("");
              }}
              placeholder="Type to search products..."
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            {productSearchTerm && !selectedProduct && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {filteredProducts.map((p) => (
                  <div
                    key={p.product_id}
                    onClick={() => {
                      setSelectedProduct(p.product_id);
                      setProductSearchTerm(p.product_name);
                      // Auto-select variant if only one exists
                      if (p.variants?.length === 1)
                        setSelectedVariant(p.variants[0].product_item_id);
                    }}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50"
                  >
                    {p.product_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Variant
            </label>
            <select
              disabled={!selectedProduct}
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 cursor-pointer"
            >
              <option value="">Choose variant...</option>
              {activeProduct?.variants?.map((v) => (
                <option key={v.product_item_id} value={v.product_item_id}>
                  {v.variant_name || `${v.quantity}${v.unit}`} - ₹{v.price}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={!selectedVariant}
            onClick={handleAddToCart}
            className="w-full md:w-auto px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Add Item
          </button>
        </div>

        {/* Local Cart Table */}
        {cart.length > 0 && (
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium w-32">Quantity</th>
                  <th className="px-4 py-3 font-medium w-16 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cart.map((c) => (
                  <tr key={c.item.variant_id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {c.item.product_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.item.variant_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">₹{c.item.price}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center border border-gray-200 rounded-md bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(c.item.variant_id, c.qty - 1)
                          }
                          disabled={c.qty <= 1}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-md cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-8 text-center text-sm font-medium text-gray-900 border-x border-gray-200 py-1">
                          {c.qty}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(c.item.variant_id, c.qty + 1)
                          }
                          className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors rounded-r-md cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeCartItem(c.item.variant_id)}
                        className="text-red-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cart Total Summary */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-6 text-sm">
              <span className="text-gray-500">
                Total Items:{" "}
                <strong className="text-gray-900">{cart.length}</strong>
              </span>
              <span className="text-gray-500">
                Est. Total:{" "}
                <strong className="text-gray-900">
                  ₹{cart.reduce((acc, c) => acc + c.item.price * c.qty, 0)}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ================= 4. ADDRESS MODAL ================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition z-10"
            >
              <X size={18} />
            </button>
            <div className="p-6 pt-10">
              <h2 className="text-xl font-semibold mb-6">
                Add New Address for {selectedUser?.customer_name}
              </h2>
              <OfflineAddressForm
                userUid={selectedUser?.userUid}
                showSkip={false}
                onSuccess={handleAddressAdded}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineSelectionBlock;