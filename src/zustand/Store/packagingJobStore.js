import { create } from "zustand";
import api from "../axios";
// adjust to your project's actual axios instance path

const DEFAULT_FILTERS = {
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
    sortBy: "deliveryDate",
    sortOrder: "desc",
};

const usePackagingJobStore = create((set, get) => ({
    // -----------------------------------------------------------------
    // List state
    // -----------------------------------------------------------------
    filters: { ...DEFAULT_FILTERS },
    jobs: [],
    pagination: null,
    summary: null,
    loading: false,
    refreshing: false,
    error: null,

    // -----------------------------------------------------------------
    // Single-job detail state (slide-over)
    // -----------------------------------------------------------------
    selectedJobId: null,
    selectedJob: null,
    selectedJobLoading: false,
    selectedJobError: null,

    // -----------------------------------------------------------------
    // Filter actions — changing any filter other than page resets to page 1
    // -----------------------------------------------------------------
    setFilters: (patch) =>
        set((state) => ({
            filters: {
                ...state.filters,
                ...patch,
                page: Object.prototype.hasOwnProperty.call(patch, "page")
                    ? patch.page
                    : 1,
            },
        })),

    setPage: (page) => set((state) => ({ filters: { ...state.filters, page } })),

    resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

    // -----------------------------------------------------------------
    // Fetch list (+ meta.summary) for current filters
    // -----------------------------------------------------------------
    fetchPackagingJobs: async (isRefresh = false) => {
        const { filters } = get();
        set(
            isRefresh
                ? { refreshing: true, error: null }
                : { loading: true, error: null },
        );

        try {
            const { data } = await api.get("/admin/getPackagingList", {
                params: filters,
                withAuth: true,
            });

            set({
                jobs: data.data ?? [],
                pagination: data.pagination ?? null,
                summary: data.meta?.summary ?? null,
            });
        } catch (err) {
            set({
                error:
                    err?.response?.data?.message ||
                    err.message ||
                    "Failed to load packaging jobs.",
            });
        } finally {
            set({ loading: false, refreshing: false });
        }
    },

    // -----------------------------------------------------------------
    // Fetch single job's detail for the slide-over.
    // This hits a separate endpoint from the list — /getPackagingDetailsById
    // — with the id passed as a `targetId` query param, not a route param.
    // -----------------------------------------------------------------
    getPackagingDetailsById: async (id) => {
        set({
            selectedJobId: id,
            selectedJob: null,
            selectedJobLoading: true,
            selectedJobError: null,
        });

        try {
            const { data } = await api.get("/admin/getPackagingDetailsById", {
                params: { targetId: id },
                withAuth: true,
            });
            set({ selectedJob: data.data });
        } catch (err) {
            set({
                selectedJobError:
                    err?.response?.data?.message ||
                    err.message ||
                    "Failed to load job detail.",
            });
        } finally {
            set({ selectedJobLoading: false });
        }
    },

    clearSelectedJob: () =>
        set({ selectedJobId: null, selectedJob: null, selectedJobError: null }),
}));

export default usePackagingJobStore;
