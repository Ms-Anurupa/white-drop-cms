/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const excelStore = create((set) => ({
  isDownloading: false,

  downloadExcel: async (type) => {
    set({ isDownloading: true });
    try {
      const response = await api.get(`admin/exportToExcel`, {
        params: {type},
        withAuth: true,
        responseType: "blob",
      });

      // Create a Blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL and trigger a hidden anchor click
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Fallback filename if the backend doesn't provide one via Content-Disposition
      link.setAttribute("download", `${type}-register.xlsx`); 
      
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