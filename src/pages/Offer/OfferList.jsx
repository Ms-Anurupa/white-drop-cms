import React, { useEffect, useMemo, useState } from "react";


import { getOfferStatus, getRedemptions } from "../../utils/offerUtils";
import useOfferStore from "../../zustand/Store/offerStore";
import OfferHeader from "../../components/OfferHeader";
import OfferStats from "../../components/OfferStats";
import OfferFilters from "../../components/OfferFilter";
import OfferTable from "../../components/OfferTable";
import OfferPagination from "../../components/OfferPagination";
import CreateOffer from "../../components/CreateOffer";

const OfferList = ({ onEditOffer }) => {
  /* =========================================================
     ZUSTAND
  ========================================================= */

  const offers = useOfferStore((state) => state.offers);

  const pagination = useOfferStore((state) => state.pagination);

  const loading = useOfferStore((state) => state.loading);

  const error = useOfferStore((state) => state.error);

  const getAllOffers = useOfferStore((state) => state.getAllOffers);

  const createOffer = useOfferStore((state) => state.createOffer);

  const clearOfferError = useOfferStore((state) => state.clearOfferError);

  /* =========================================================
     LOCAL STATE
  ========================================================= */

  const [showCreateOffer, setShowCreateOffer] = useState(false);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("ALL");

  const [offerType, setOfferType] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  /* =========================================================
     OFFER TYPES

     Replace this with your offerType Zustand store if you
     already have one.
  ========================================================= */

  const offerTypes = [];

  const discountTypes = [];

  /* =========================================================
     FETCH OFFERS
  ========================================================= */

  useEffect(() => {
    getAllOffers({
      page,
      limit,
      search,
      offerType,
      fromDate,
      toDate,
    });
  }, [page, limit, search, offerType, fromDate, toDate, getAllOffers]);

  /* =========================================================
     PROCESS OFFERS
  ========================================================= */

  const processedOffers = useMemo(() => {
    return offers.map((offer) => ({
      ...offer,
      calculatedStatus: getOfferStatus(offer),
    }));
  }, [offers]);

  /* =========================================================
     STATUS FILTER
  ========================================================= */

  const filteredOffers = useMemo(() => {
    if (activeTab === "ALL") {
      return processedOffers;
    }

    return processedOffers.filter(
      (offer) => offer.calculatedStatus === activeTab,
    );
  }, [processedOffers, activeTab]);

  /* =========================================================
     STATS
  ========================================================= */

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

  /* =========================================================
     CREATE OFFER
  ========================================================= */

  const handleCreateOffer = async (payload) => {
    try {
      await createOffer(payload);

      setShowCreateOffer(false);

      await getAllOffers({
        page,
        limit,
        search,
        offerType,
        fromDate,
        toDate,
      });
    } catch (error) {
      console.error("Create offer failed:", error);
    }
  };

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const handleResetFilters = () => {
    setSearch("");
    setOfferType("");
    setFromDate("");
    setToDate("");
    setActiveTab("ALL");
    setPage(1);

    clearOfferError();
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const handleStatusChange = (value) => {
    setActiveTab(value);
    setPage(1);
  };

  /* =========================================================
     OFFER TYPE
  ========================================================= */

  const handleOfferTypeChange = (value) => {
    setOfferType(value);
    setPage(1);
  };

  /* =========================================================
     FROM DATE
  ========================================================= */

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setPage(1);
  };

  /* =========================================================
     TO DATE
  ========================================================= */

  const handleToDateChange = (value) => {
    setToDate(value);
    setPage(1);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-6">
        {/* ===================================================
            HEADER
        =================================================== */}

        <OfferHeader onCreateOffer={() => setShowCreateOffer(true)} />

        {/* ===================================================
            STATS
        =================================================== */}

        <OfferStats
          active={stats.active}
          scheduled={stats.scheduled}
          redemptions={stats.redemptions}
        />

        {/* ===================================================
            FILTERS
        =================================================== */}

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
        />

        {/* ===================================================
            ERROR
        =================================================== */}

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

        {/* ===================================================
            TABLE CARD
        =================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <OfferTable
            offers={filteredOffers}
            loading={loading}
            onEditOffer={onEditOffer}
          />
        </div>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        <OfferPagination
          pagination={pagination}
          page={page}
          limit={limit}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>

      {/* =====================================================
          CREATE OFFER
      ===================================================== */}

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
