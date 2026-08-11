import React from "react";
import { useNavigate } from "react-router-dom";

const OfferHeader = () => {
    const navigate = useNavigate();

    const handleCreateOffer = () => {
        navigate("/dashboard/offers/create");
    };

    return (
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-[20px] font-semibold tracking-tight text-slate-800">
                    Offer Engine
                </h1>

                <p className="mt-1 text-[11px] text-slate-500">
                    Configure and monitor every live promotion rule
                </p>
            </div>

            <button
                type="button"
                onClick={handleCreateOffer}
                className="cursor-pointer flex h-9 w-fit items-center gap-1.5 rounded-md bg-[#6655df] px-4 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#5746d2] active:scale-[0.98]"
            >
                <span className="text-[16px] leading-none">+</span>
                New offer
            </button>
        </div>
    );
};

export default OfferHeader;
