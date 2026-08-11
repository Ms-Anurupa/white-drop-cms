import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getOfferStatus, getRedemptions } from "../../utils/offerUtils";
import useOfferStore from "../../zustand/Store/offerStore";

import OfferHeader from "../../components/OfferHeader";
import OfferStats from "../../components/OfferStats";
import OfferFilters from "../../components/OfferFilter";
import OfferTable from "../../components/OfferTable";
import OfferPagination from "../../components/OfferPagination";
import CreateOffer from "../../components/CreateOffer";
import useDebounce from "../../utils/useDebounce";

const OfferList = () => {
  const navigate = useNavigate();

  const offers = useOfferStore((state) => state.offers);
  const pagination = useOfferStore((state) => state.pagination);
  const loading = useOfferStore((state) => state.loading);
  const error = useOfferStore((state) => state.error);

  const getAllOffers = useOfferStore((state) => state.getAllOffers);
  const createOffer = useOfferStore((state) => state.createOffer);
  const clearOfferError = useOfferStore((state) => state.clearOfferError);

  const [showCreateOffer, setShowCreateOffer] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [offerType, setOfferType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);


  const debouncedSearch = useDebounce(search, 500);
  const debouncedOfferType = useDebounce(offerType, 500);


  const offerTypes = [];
  const discountTypes = [];

  useEffect(() => {
    const hasBothDates = fromDate && toDate;

    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      return;
    }

    getAllOffers({
      page,
      limit,
      search: debouncedSearch,
      offerType: debouncedOfferType,
      fromDate: hasBothDates ? fromDate : "",
      toDate: hasBothDates ? toDate : "",
    });
  }, [
    page,
    limit,
    debouncedSearch,
    debouncedOfferType,
    fromDate,
    toDate,
    getAllOffers,
  ]);

  const handleEditOffer = (offer) => {
    if (!offer?.offerId) {
      console.error("Offer ID is missing:", offer);
      return;
    }
    navigate(`/dashboard/offers/edit/${offer.offerId}`);
  };

  const processedOffers = useMemo(() => {
    return offers.map((offer) => ({
      ...offer,
      calculatedStatus: getOfferStatus(offer),
    }));
  }, [offers]);

  const filteredOffers = useMemo(() => {
    if (activeTab === "ALL") {
      return processedOffers;
    }

    return processedOffers.filter(
      (offer) => offer.calculatedStatus === activeTab,
    );
  }, [processedOffers, activeTab]);

  const stats = useMemo(() => {
    let active = 0;
    let scheduled = 0;
    let redemptions = 0;

    processedOffers.forEach((offer) => {
      const status = offer.calculatedStatus;

      if (status === "ACTIVE") {
        active += 1;
      }

      if (status === "SCHEDULED") {
        scheduled += 1;
      }

      redemptions += Number(getRedemptions(offer)) || 0;
    });

    return {
      active,
      scheduled,
      redemptions,
    };
  }, [processedOffers]);

  const handleCreateOffer = async (payload) => {
    try {
      await createOffer(payload);

      setShowCreateOffer(false);

      await getAllOffers({
        page,
        limit,
        search: debouncedSearch,
        offerType: debouncedOfferType,
        fromDate,
        toDate,
      });
    } catch (error) {
      console.error("Create offer failed:", error);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setOfferType("");
    setFromDate("");
    setToDate("");
    setActiveTab("ALL");
    setPage(1);

    clearOfferError();
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setActiveTab(value);
    setPage(1);
  };

  const handleOfferTypeChange = (value) => {
    setOfferType(value);
    setPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setPage(1);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6">
        <OfferHeader onCreateOffer={() => setShowCreateOffer(true)} />

        <OfferStats
          active={stats.active}
          scheduled={stats.scheduled}
          redemptions={stats.redemptions}
        />

        <OfferFilters
          search={search}
          setSearch={handleSearch}
          activeTab={activeTab}
          setActiveTab={handleStatusChange}
          offerType={offerType}
          setOfferType={handleOfferTypeChange}
          fromDate={fromDate}
          setFromDate={handleFromDateChange}
          toDate={toDate}
          setToDate={handleToDateChange}
          onReset={handleResetFilters}
          isSearching={search !== debouncedSearch}
        />

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <p className="text-[11px] text-red-600">{error}</p>
            <button
              type="button"
              onClick={clearOfferError}
              className="text-[11px] font-medium text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[#E5E7F0] bg-white shadow-sm">
          <OfferTable
            offers={filteredOffers}
            loading={loading}
            onEditOffer={handleEditOffer}
          />
        </div>

        <OfferPagination
          pagination={pagination}
          page={page}
          limit={limit}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>

      {showCreateOffer && (
        <CreateOffer
          onClose={() => setShowCreateOffer(false)}
          onSubmit={handleCreateOffer}
          offerTypes={offerTypes}
          discountTypes={discountTypes}
          loading={loading}
        />
      )}
    </div>
  );
};

export default OfferList;
