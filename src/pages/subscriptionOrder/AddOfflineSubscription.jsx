/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CalendarRange, Repeat, Calculator, CheckCircle } from "lucide-react";

import Loader from "../../components/Loader";
import offlineOrderStore from "@/zustand/Store/offlineOrderStore";
import OfflineSelectionBlock from "@/components/OflineOrderSubSelections/OfflineSelectionBlock";

const DAYS_OF_WEEK = [
  { id: 1, label: "Mon", value: "MONDAY" },
  { id: 2, label: "Tue", value: "TUESDAY" },
  { id: 3, label: "Wed", value: "WEDNESDAY" },
  { id: 4, label: "Thu", value: "THURSDAY" },
  { id: 5, label: "Fri", value: "FRIDAY" },
  { id: 6, label: "Sat", value: "SATURDAY" },
  { id: 0, label: "Sun", value: "SUNDAY" }
];

const AddOfflineSubscription = () => {
  const navigate = useNavigate();
  
  // Stores
  const { createOfflineSubscription, getSubscriptionPricing, activeSubPlans, fetchActiveSubPlans  } = offlineOrderStore();

  
  // Component State
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  
  // Subscription Configuration State
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(""); // For custom plans
  const [durationMonths, setDurationMonths] = useState(1); // For fixed plans
  const [selectedDays, setSelectedDays] = useState([]);
  
  // Pricing Result State
  const [pricingQuote, setPricingQuote] = useState(null);

  // Fetch plans on mount
  useEffect(() => {
    fetchActiveSubPlans()
  }, [fetchActiveSubPlans]);

  // --- ACTIVE PLAN LOGIC ---
  const activePlan = useMemo(() => {
    if (!activeSubPlans || !planId) return null;
    return activeSubPlans.find(p => p.id === planId || p.planId === planId); 
  }, [activeSubPlans, planId]);

  // When plan changes, apply the defaults based on Custom vs Fixed
  useEffect(() => {
    if (activePlan) {
      if (!activePlan.isCustom) {
        // Fixed Plan
        setSelectedDays(activePlan.defaultDays || []);
        setDurationMonths(1);
        setEndDate(""); 
      } else {
        // Custom Plan
        setSelectedDays([]);
        setDurationMonths(0);
      }
      setPricingQuote(null);
    }
  }, [activePlan]);

  const handleSelectionChange = useCallback((data) => {
    setFormData(data);
    setPricingQuote(null);
  }, []);

  const toggleDay = (dayValue) => {
    if (!activePlan?.isCustom) return; // Only allow toggling for custom plans
    setSelectedDays(prev => 
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
    setPricingQuote(null); // Reset quote on change
  };

  // --- STEP 1: CALCULATE PRICING ---
  const handleCalculatePricing = async () => {
    if (!activePlan) {
      toast.error("Please select a Plan."); 
      return;
    }
    if (!startDate) {
      toast.error("Please select a Start Date."); 
      return;
    }
    if (activePlan.isCustom && (!endDate || selectedDays.length === 0)) {
      toast.error("Custom plans require an End Date and at least one Delivery Day."); 
      return;
    }
    if (!formData?.cart || formData.cart.length === 0) {
      toast.error("Please add a product to the cart."); 
      return;
    }

    try {
      setLoading(true);
      const cartItem = formData.cart[0]; // Strict 1 product for subs

      const payload = {
        planId: activePlan.id || activePlan.planId,
        variantId: cartItem.item.variant_id,
        qtyPerDelivery: cartItem.qty,
        selectedDays: selectedDays,
        durationMonths: activePlan.isCustom ? null : Number(durationMonths),
        startDate: new Date(startDate).toISOString(),
        endDate: (activePlan.isCustom && endDate) ? new Date(endDate).toISOString() : null,
      };

      const res = await getSubscriptionPricing(payload);
      
      if (res.success) {
        setPricingQuote(res.data);
        toast.success("Pricing calculated successfully!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to calculate pricing");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: CREATE SUBSCRIPTION ---
  const handleSubmitSubscription = async () => {
    if (!formData?.userUid || !formData?.addressId || !formData?.deliverySlotId) {
      toast.error("Please ensure Customer, Address, and Slot are selected.");
      return;
    }
    if (!pricingQuote) {
      toast.error("Please calculate pricing first.");
      return;
    }

    try {
      setLoading(true);
      const cartItem = formData.cart[0];

      const payload = {
        userUid: formData.userUid,
        addressId: formData.addressId,
        deliverySlotId: formData.deliverySlotId,
        planId: activePlan.id || activePlan.planId,
        variantId: cartItem.item.variant_id,
        qtyPerDelivery: cartItem.qty,
        selectedDays: selectedDays,
        durationMonths: activePlan.isCustom ? null : Number(durationMonths),
        startDate: new Date(startDate).toISOString(),
        endDate: (activePlan.isCustom && endDate) ? new Date(endDate).toISOString() : null,
        paymentMode: "COD",
        pricingData: pricingQuote 
      };

      const res = await createOfflineSubscription(payload);
      
      if (res.success) {
        toast.success("Offline Subscription created successfully!");
        navigate("/dashboard/subscription-orders"); 
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-full">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Create Offline Subscription
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Setup a recurring dairy or grocery schedule for an offline customer.
          </p>
        </div>

        {/* 1. SELECTION BLOCK (Customer, Address, Slot, Product) */}
        <OfflineSelectionBlock 
          mode="subscription" 
          onChange={handleSelectionChange} 
        />

        {/* 2. SUBSCRIPTION CONFIGURATION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Repeat size={18} className="text-blue-600" /> Subscription Plan Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Plan</label>
              <select
                value={planId}
                onChange={(e) => {
                  setPlanId(e.target.value);
                  setPricingQuote(null);
                }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
              >
                <option value="">Choose a plan...</option>
                {activeSubPlans?.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} {plan.isCustom ? "(Custom)" : "(Fixed)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <CalendarRange size={14} className="text-gray-400"/> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPricingQuote(null);
                }}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
              />
            </div>
          </div>

          {activePlan && (
            <div className="pt-4 border-t border-gray-50">
              {activePlan.isCustom ? (
                /* CUSTOM PLAN: End Date & Clickable Days */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <CalendarRange size={14} className="text-gray-400"/> End Date (Custom)
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setPricingQuote(null);
                        }}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        min={startDate || new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                            selectedDays.includes(day.value) 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* FIXED PLAN: Duration Selector & Read-Only Days */
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Delivery Days</label>
                    <div className="flex flex-wrap gap-2">
                      {activePlan.defaultDays?.map(day => (
                        <span key={day} className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {day.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Duration</label>
                    <div className="flex flex-wrap gap-3">
                      {[1, 2, 3].map(months => {
                        const isSelected = durationMonths === months;
                        return (
                          <button
                            key={months}
                            type="button"
                            onClick={() => {
                              setDurationMonths(months);
                              setPricingQuote(null);
                            }}
                            className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                              isSelected 
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {months} {months === 1 ? 'Month' : 'Months'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. PRICING ENGINE & ACTION BUTTONS */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center space-y-4">
          
          {pricingQuote ? (
             <div className="w-full max-w-md bg-white p-6 rounded-lg border border-green-200 shadow-sm text-center">
                <CheckCircle className="text-green-500 mx-auto mb-2" size={28} />
                <h3 className="text-2xl font-bold text-gray-900">
                  ₹{pricingQuote.finalAmount?.toString() || pricingQuote.totalPrice?.toString() || "0.00"}
                </h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p><strong>{pricingQuote.totalDeliveries || 0}</strong> deliveries calculated.</p>
                  {pricingQuote.baseTotal && <p>Base: ₹{pricingQuote.baseTotal}</p>}
                </div>
                
                <div className="mt-5 pt-5 border-t border-gray-100 flex gap-3">
                   <button
                    onClick={() => setPricingQuote(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                   >
                     Recalculate
                   </button>
                   <button
                    onClick={handleSubmitSubscription}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
                   >
                     {loading ? "Starting..." : "Start Subscription"}
                   </button>
                </div>
             </div>
          ) : (
             <button
              onClick={handleCalculatePricing}
              disabled={loading || !formData?.cart?.length || !planId}
              className="px-8 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader size={16}/> : <Calculator size={18} />}
              Calculate Subscription Pricing
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default AddOfflineSubscription;