/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
import { create } from "zustand";
import api from "../axios";

const corporateDataStore = create((set) => ({
  corporateData: [],

  createCorporateOrderAdmin: async (payload) => {
    try {
      const res = await api.post("/admin/createCorporateOrderAdmin", payload, {
        withAuth: true,
    });

      return res.data;
    } catch (err) {
      console.log("err", err);
      throw err
    }
  },

}));

export default corporateDataStore;
