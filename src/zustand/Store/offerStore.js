import { create } from "zustand";
import api from "../axios";

const useOfferStore = create((set) => ({
    offers: [],
    offerTypes: [],

    pagination: {
        page: 1,
        limit: 10,
        totalOffers: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    },

    loading: false,
    error: null,

    getAllOffers: async ({
        page = 1,
        limit = 10,
        search = "",
        offerType = "",
        fromDate = "",
        toDate = "",
        active = "",
    } = {}) => {
        try {
            set({
                loading: true,
                error: null,
            });

            const res = await api.get("/admin/getAllOffers", {
                withAuth: true,
                params: {
                    page,
                    limit,
                    search,
                    offerType,
                    fromDate,
                    toDate,
                    active,
                },
            });

            set({
                offers: res.data?.offers || [],
                pagination: res.data?.pagination || {
                    page,
                    limit,
                    totalOffers: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
                loading: false,
            });

            return res.data;
        } catch (error) {
            console.error("Failed to fetch offers:", error);

            set({
                offers: [],
                loading: false,
                error: error?.response?.data?.message || "Failed to fetch offers",
            });

            throw error;
        }
    },

    getAllOfferTypes: async () => {
        try {
            set({
                loading: true,
                error: null,
            });

            const res = await api.get("/admin/getAllOfferTypes", {
                withAuth: true,
            });

            set({
                offerTypes: res.data?.offerTypes || [],
                loading: false,
            });

            return res.data;
        } catch (error) {
            console.error("Failed to fetch offer types:", error);

            set({
                offerTypes: [],
                loading: false,
                error: error?.response?.data?.message || "Failed to fetch offer types",
            });

            throw error;
        }
    },

    clearOfferError: () => {
        set({
            error: null,
        });
    },

    createOffer: async (payload) => {
        try {
            set({
                creating: true,
                createError: null,
            });

            const res = await api.post(
                "/admin/createOffer",
                payload,
                {
                    withAuth: true,
                }
            );

            set({
                creating: false,
                createError: null,
            });

            return res.data;
        } catch (error) {
            console.error("Failed to create offer:", error);

            set({
                creating: false,
                createError:
                    error?.response?.data?.message ||
                    "Failed to create offer",
            });

            throw error;
        }
    },
}));

export default useOfferStore;
