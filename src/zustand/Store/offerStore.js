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

    getAllOfferTypes: async ({
        page = 1,
        limit = 10,
        search = "",
        status = "",
    }) => {
        try {
            set({
                loading: true,
                error: null,
            });

            const res = await api.get("/admin/getAllOfferTypes", {
                params: {
                    page,
                    limit,
                    search,
                    status,
                },
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

            const res = await api.post("/admin/createOffer", payload, {
                withAuth: true,
            });

            set({
                creating: false,
                createError: null,
            });

            return res.data;
        } catch (error) {
            console.error("Failed to create offer:", error);

            set({
                creating: false,
                createError: error?.response?.data?.message || "Failed to create offer",
            });

            throw error;
        }
    },
    deleteOfferType: async (payload) => {
        try {
            set({
                creating: true,
                createError: null,
            });

            const res = await api.post("/admin/deleteOfferType", payload, {
                withAuth: true,
            });

            set({
                creating: false,
                createError: null,
            });

            return res.data;
        } catch (error) {
            console.error("Failed to delete offer type:", error);

            set({
                creating: false,
                createError:
                    error?.response?.data?.message || "Failed to delete offer type",
            });

            throw error;
        }
    },

    updateOfferTypeStatus: async (payload) => {
        try {
            console.log(payload);

            set({
                creating: true,
                createError: null,
            });

            const res = await api.post("/admin/updateOfferTypeStatus", payload, {
                withAuth: true,
            });

            set({
                creating: false,
                createError: null,
            });

            return res.data;
        } catch (error) {
            console.error("Failed to update offer type status:", error);

            set({
                creating: false,
                createError:
                    error?.response?.data?.message ||
                    "Failed to update offer type status",
            });

            throw error;
        }
    },
    
    deleteOffer: async (payload) => {
        try {
            set({
                deleting: true,
                deleteError: null,
            });

            const res = await api.post("/admin/deleteOffer", payload, {
                withAuth: true,
            });

            set({
                deleting: false,
                deleteError: null,
            });

            return res.data;
        } catch (error) {
            console.error("Failed to delete offer:", error);

            set({
                deleting: false,
                deleteError:
                    error?.response?.data?.message ||
                    "Failed to delete offer",
            });

            throw error;
        }
    },
}));

export default useOfferStore;
