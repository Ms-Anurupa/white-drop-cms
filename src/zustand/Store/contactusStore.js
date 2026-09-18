import { create } from "zustand";
import api from "../axios";

const initialPagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
};

const contactUsStore = create((set, get) => ({
    contacts: [],
    pagination: initialPagination,
    filter: "", // "" | "today" | "yesterday" | "this_week" | "this_month"
    fromDate: "", // "" | "YYYY-MM-DD" — mutually exclusive with `filter`
    toDate: "",
    loading: false,
    error: null,

    setFilter: (filter) => {
        set({
            filter,
            fromDate: "",
            toDate: "",
            pagination: { ...get().pagination, page: 1 },
        });
        get().fetchContactUsReqs();
    },

    // Only calls the API once both ends of the range are set (or both are
    // cleared) — same isPartialDateRange guard as the shared DateFilter
    // component, so a lone fromDate/toDate never fires a half-range fetch.
    setDateRange: (fromDate, toDate) => {
        const isPartialDateRange = Boolean(fromDate) !== Boolean(toDate);

        set({
            fromDate,
            toDate,
            filter: "",
            pagination: { ...get().pagination, page: 1 },
        });

        if (!isPartialDateRange) {
            get().fetchContactUsReqs();
        }
    },

    setPage: (page) => {
        set({ pagination: { ...get().pagination, page } });
        get().fetchContactUsReqs();
    },

    fetchContactUsReqs: async () => {
        set({ loading: true, error: null });
        try {
            const { page, limit } = get().pagination;
            const { filter, fromDate, toDate } = get();

            const { data } = await api.get("/admin/getContactusReqs", {
                withAuth: true,
                params: {
                    page,
                    limit,
                    ...(filter && { filter }),
                    ...(!filter &&
                        fromDate &&
                        toDate && { startDate: fromDate, endDate: toDate }),
                },
            });

            set({
                contacts: data.constactUsReqs ?? [],
                pagination: {
                    page: data.pagination?.page ?? page,
                    limit: data.pagination?.limit ?? limit,
                    total: data.pagination?.total ?? 0,
                    totalPages: data.pagination?.totalPages ?? 1,
                },
                loading: false,
            });
        } catch (error) {
            console.error(error);
            set({ error: "Couldn't load contact requests.", loading: false });
        }
    },

    createContactusReq: async (payload) => {
        // Public endpoint — no auth required
        try {
            const { data } = await api.post("/user/createContactusReq", payload);
            return { success: true, data };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error:
                    error?.response?.data?.message || "Couldn't submit your request.",
            };
        }
    },

    reset: () =>
        set({
            contacts: [],
            pagination: initialPagination,
            filter: "",
            fromDate: "",
            toDate: "",
            loading: false,
            error: null,
        }),
}));

export default contactUsStore;
