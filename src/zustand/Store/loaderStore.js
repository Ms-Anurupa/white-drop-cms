import { create } from "zustand";

const loaderStore = create ((set) => ({
    loading: false,

    showLoader: () => set({loading: true}),
    hideLoader: () => set({loading: false})

}));
export default loaderStore;