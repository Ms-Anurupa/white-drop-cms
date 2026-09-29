/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const excelStore = create((set) => ({
  isDownloading: false,

  downloadExcel: async (type, dateFrom, dateTo) => {
    set({ isDownloading: true });
    try {
      const response = await api.get(`admin/exportToExcel`, {
        params: { type, dateFrom, dateTo },
        withAuth: true,
        responseType: "blob",
      });

      // --- NEW LOGIC: Extract the dynamic filename from headers ---
      let filename = `${type}-register.xlsx`; // Fallback name
      const contentDisposition = response.headers["content-disposition"];

      if (contentDisposition) {
        // Regex to extract the filename from inside the quotes
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length >= 2) {
          filename = filenameMatch[1]; // This grabs "Expense 2026-09-29 14-30-00.xlsx"
        }
      }
      // ------------------------------------------------------------

      // Create a Blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL and trigger a hidden anchor click
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Set the download attribute to our dynamically extracted filename
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      // Cleanup to avoid memory leaks
      link.remove();
      window.URL.revokeObjectURL(url);

      set({ isDownloading: false });
    } catch (error) {
      console.error("Failed to download Excel file:", error);
      set({ isDownloading: false });
      throw error;
    }
  },
}));

export default excelStore;
