const MODE = import.meta.env.VITE_MODE;

const CONFIG = {
    dev: {
        api: import.meta.env.VITE_API_URL_DEV,
    },
    prod: {
        api: import.meta.env.VITE_API_URL_PROD,
    }
};

//falback to dev
const current = CONFIG[MODE] || CONFIG.dev;

export const API_URL = current.api;