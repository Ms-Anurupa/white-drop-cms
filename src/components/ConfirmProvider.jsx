/* eslint-disable */
import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

const ConfirmContext = createContext(null);


export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    title: "",
    message: "",
    resolve: null,
  });

  const confirm = ({ title = "Are you sure?", message = "" }) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        message,
        resolve,
      });
    });
  };

  const handleClose = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    handleClose();
  };

  const handleCancel = () => {
    state.resolve?.(false);
    handleClose();
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state.open &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999]">
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 w-[400px] rounded-lg shadow-lg p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{state.title}</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{state.message}</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                  style={{cursor: "pointer"}}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm rounded bg-red-500 text-white"
                  style={{cursor: "pointer"}}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
};
