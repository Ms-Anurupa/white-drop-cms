import { create } from "zustand";
import api from "../axios";

const employeeStore = create((set) => ({
    employees: [],
    employeeMeta: null,
    salaryRecords: [],
    salaryPagination: null,
    loading: false,
    error: null,

    registerEmployee: async (employeeData) => {
        set({ loading: true, error: null });

        try {
            const response = await api.post("/admin/registerEmployee", employeeData,
                { withAuth: true },
            );

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

    // Create employee salary
    addEmployeeSalary: async (salaryData) => {
        set({ loading: true, error: null });

        try {
            const response = await api.post("/admin/addEmployeeSalary", salaryData,
                { withAuth: true },
            );

            set({ loading: false });

            return response.data;
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || "Failed to create salary record",
            });
            throw error;
        }
    },

    // Get employee salaries with cursor pagination
    getEmployeeSalariesById: async (employeeId, params = {}, append = false) => {
        set({ loading: true, error: null });

        try {
            const response = await api.get("/admin/getEmployeeSalariesById", {
              params,
              withAuth: true,
            });

            const newRecords = response.data.data || [];

            set((state) => ({
                salaryRecords: append ? [...state.salaryRecords, ...newRecords] : newRecords,
                salaryPagination: response.data.pagination || null,
                loading: false,
            }));

            return response.data;
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || "Failed to fetch employee salary records",
            });
            throw error;
        }
    },

    // Reset salary records when switching employees
    clearSalaryRecords: () =>
        set({
            salaryRecords: [],
            salaryPagination: null,
        }),

    clearError: () => set({ error: null }),
}));

export default employeeStore;
