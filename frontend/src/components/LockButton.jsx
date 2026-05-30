import { useState } from "react"

const LockButton = ({ locked }) => {
    return (
        <div
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
        ${locked
                    ? "bg-red-100 text-red-500 hover:bg-red-200"
                    : "bg-green-100 text-green-500 hover:bg-green-200"
                }`}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Corps du cadenas — commun aux deux états */}
                <rect x="3" y="11" width="18" height="11" rx="2" />

                {/* Anse : fermée vs ouverte */}
                {locked ? (
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                ) : (
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                )}
            </svg>
        </div>
    )
}

export default LockButton