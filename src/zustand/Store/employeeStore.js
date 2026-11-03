import { create } from "zustand";
import api from "../axios";

const DEFAULT_FILTERS = () => ({
  search: "",
  month: "",
  year: new Date().getFullYear(),
  salaryDate: "",
  employeeId: "",
});

const employeeStore = create((set, get) => ({
  employees: [],
  employeeMeta: null,

  // Per-employee payment history (employeeSalaryLog)
  salaryRecords: [],
  salaryPagination: null,
  salarySummary: null,
  salaryEmployee: null,

  // Per-employee salary package + increment history (employeeSalary)
  incrementLogs: [],
  incrementPagination: null,
  currentPackage: null, // { basePay, pTax, esi, finalPay, lastUpdated }
  currentBasePay: null,

  // All-employee payment log listing
  salaryLogs: [],
  salaryLogPagination: null,
  salaryLogSummary: null,
  salaryFilters: DEFAULT_FILTERS(),

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

    try {
      const response = await api.post(
        "/admin/addSalaryPaymentLog",
        salaryData,
        { withAuth: true },
      );

      set({ loading: false });

      return response.data;
    } catch (error) {
      set({
        loading: false,
        error:
          error.response?.data?.message || "Failed to record salary payment",
      });
      throw error;
    }
  },

  // First-time salary package for an employee (addEmployeeSalaryInfo)
  addEmployeeSalaryInfo: async (salaryInfo) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post(
        "/admin/addEmployeeSalaryInfo",
        salaryInfo,
        {
          withAuth: true,
        },
      );

      set({ loading: false });

      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to save salary package",
      });
      throw error;
    }
  },

  // NEW: revise an existing package and log the increment (addSalaryIncrementLog)
  addSalaryIncrementLog: async (payload) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/admin/addSalaryIncrementLog", payload, {
        withAuth: true,
      });

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

  // Update filters and refetch page 1 (all-employee listing)
  setSalaryFilters: (newFilters) => {
    set((state) => ({
      salaryFilters: { ...state.salaryFilters, ...newFilters },
    }));
    get().getSalaryPaymentLogs(1);
  },

  resetSalaryFilters: () => {
    set({ salaryFilters: DEFAULT_FILTERS() });
    get().getSalaryPaymentLogs(1);
  },

  // All-employee payment logs (page based)
  getSalaryPaymentLogs: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });

    const { salaryFilters } = get();

    try {
      const response = await api.get("/admin/getSalaryPaymentLogs", {
        params: { page, limit, ...salaryFilters },
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

  // One employee's payment history. Page based: pass { page, limit, fy, startDate, endDate }.
  // Uses the same controller as getSalaryPaymentLogs (employeeId switches it to single-employee mode).
  getSalaryPaymentLogsById: async (employeeId, params = {}, append = false) => {
    set({ loading: true, error: null });

    try {
      const response = await api.get("/admin/getSalaryPaymentLogs", {
        params: { employeeId, ...params },
        withAuth: true,
      });

      const newRecords = response.data.data || [];

      set((state) => ({
        salaryRecords: append
          ? [...state.salaryRecords, ...newRecords]
          : newRecords,
        salaryPagination: response.data.pagination || null,
        salarySummary: response.data.summary || null,
        salaryEmployee: response.data.employee || state.salaryEmployee,
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

  // Salary package + increment history (cursor = ISO date of the last entry)
  getSalaryIncrementLogsById: async (
    employeeId,
    params = {},
    append = false,
  ) => {
    const response = await api.get("/admin/getSalaryIncrementLogsById", {
      params: { employeeId, ...params },
      withAuth: true,
    });

    const payload = response.data.data || {};
    const newLogs = payload.increments || [];

    set((state) => ({
      incrementLogs: append ? [...state.incrementLogs, ...newLogs] : newLogs,
      incrementPagination: response.data.pagination || null,
      currentPackage: payload.currentPackage || null,
      currentBasePay: payload.currentBasePay ?? 0,
    }));

    return response.data;
  },

  // Reset when switching employees
  clearSalaryRecords: () =>
    set({
      salaryRecords: [],
      salaryPagination: null,
      salarySummary: null,
      salaryEmployee: null,
    }),

  clearIncrementLogs: () =>
    set({
      incrementLogs: [],
      incrementPagination: null,
      currentPackage: null,
      currentBasePay: null,
    }),

  clearError: () => set({ error: null }),
}));

export default employeeStore;
