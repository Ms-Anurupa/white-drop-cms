import { create } from "zustand";
import api from "../axios";

const employeeStore = create((set, get) => ({
    employees: [],
    employeeMeta: null,
    salaryRecords: [],
    salaryPagination: null,

    // NEW: increment history for the Manage Salary page
    incrementLogs: [],
    incrementPagination: null,
    currentBasePay: null,

    salaryLogs: [],
    salaryLogPagination: null,
    salaryLogSummary: null,
    salaryFilters: {
        search: "",
        month: "",
        year: new Date().getFullYear(),
        salaryDate: "",
        employeeId: "",
    },

    loading: false,
    error: null,

    registerEmployee: async (employeeData) => {
        set({ loading: true, error: null });

        try {
            const response = await api.post("/admin/registerEmployee", employeeData, {
                withAuth: true,
            });

            set({ loading: false });

            return response.data;
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || "Failed to register employee",
            });
            throw error;
        }
    },

    // Get paginated employee list
    getEmployeeList: async (params = {}) => {
        set({ loading: true, error: null });

        try {
            const response = await api.get("/admin/getEmployeeList", {
                params,
                withAuth: true,
            });

            set({
                employees: response.data.data || [],
                employeeMeta: response.data.meta || null,
                loading: false,
            });

            return response.data;
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || "Failed to fetch employees",
            });
            throw error;
        }
    },

    // Record a salary payment (addSalaryPaymentLog)
    addEmployeeSalary: async (salaryData) => {
        set({ loading: true, error: null });
        console.log("enter");
        try {
            const response = await api.post(
                "/admin/addSalaryPaymentLog",
                salaryData,
                {
                    withAuth: true,
                },
            );

            set({ loading: false });

            return response.data;
        } catch (error) {
            set({
                loading: false,
                error:
                    error.response?.data?.message || "Failed to create salary record",
            });
            throw error;
        }
    },

    // Update filters and automatically trigger fetch for page 1
    setSalaryFilters: (newFilters) => {
        set((state) => ({
            salaryFilters: { ...state.salaryFilters, ...newFilters },
        }));
        get().fetchSalaryLogs(1);
    },

    // Reset salary filters to default (current year)
    resetSalaryFilters: () => {
        set({
            salaryFilters: {
                search: "",
                month: "",
                year: new Date().getFullYear(),
                salaryDate: "",
                employeeId: "",
            },
        });
        get().fetchSalaryLogs(1);
    },

    // Fetch paginated salary logs
    getSalaryPaymentLogs: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });

        const { salaryFilters } = get();

        try {
            const response = await api.get("/admin/getSalaryPaymentLogs", {
                params: {
                    page,
                    limit,
                    ...salaryFilters,
                },
                withAuth: true,
            });

            const { data, pagination, summary } = response.data;

            set({
                salaryLogs: data || [],
                salaryLogPagination: pagination || null,
                salaryLogSummary: summary || null,
                loading: false,
            });
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || "Failed to fetch salary logs",
            });
        }
    },

    // NEW: Add a salary increment (addSalaryIncrementLog)
    // ⚠️ Change the URL to match your router.
    addSalaryIncrementLog: async (incrementData) => {
        set({ loading: true, error: null });

        try {
            const response = await api.post(
                "/admin/addSalaryIncrementLog",
                incrementData,
                { withAuth: true },
            );

            set({ loading: false });

            return response.data;
        } catch (error) {
            set({
                loading: false,
                error:
                    error.response?.data?.message || "Failed to save salary increment",
            });
            throw error;
        }
    },

    // Get employee salary payments with cursor pagination
    getSalaryPaymentLogsById: async (employeeId, params = {}, append = false) => {
        set({ loading: true, error: null });

        try {
            const response = await api.get("/admin/getSalaryPaymentLogsById", {
                params: { employeeId, ...params },
                withAuth: true,
            });

            const newRecords = response.data.data || [];

            set((state) => ({
                salaryRecords: append
                    ? [...state.salaryRecords, ...newRecords]
                    : newRecords,
                salaryPagination:
                    response.data.pagination || response.data.meta || null,
                loading: false,
            }));

            return response.data;
        } catch (error) {
            set({
                loading: false,
                error:
                    error.response?.data?.message ||
                    "Failed to fetch employee salary records",
            });
            throw error;
        }
    },

    // NEW: Get increment history (cursor = ISO date of last entry)
    // ⚠️ Change the URL to match your router.
    getSalaryIncrementLogsById: async (
        employeeId,
        params = {},
        append = false,
    ) => {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await api.get("/admin/getSalaryIncrementLogsById", {
                params: { employeeId, ...params },
                withAuth: true,
            });

            const payload = response.data.data || {};
            const newLogs = payload.increments || [];

            set((state) => ({
                incrementLogs: append ? [...state.incrementLogs, ...newLogs] : newLogs,
                incrementPagination: response.data.pagination || null,
                currentBasePay: payload.currentBasePay ?? 0,
            }));

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Reset salary records when switching employees
    clearSalaryRecords: () =>
        set({
            salaryRecords: [],
            salaryPagination: null,
        }),

    // NEW
    clearIncrementLogs: () =>
        set({
            incrementLogs: [],
            incrementPagination: null,
            currentBasePay: null,
        }),

    clearError: () => set({ error: null }),
}));

export default employeeStore;
