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

    clearOfferError: () => {
        set({
            error: null,
        });
    },
}));

export default useOfferStore;
