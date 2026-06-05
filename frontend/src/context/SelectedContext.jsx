import React, { useState, useEffect, useContext, useCallback } from "react";

const SelectedContext = React.createContext({ selected: null, setSelected: () => {} })

export const useSelected = () => useContext(SelectedContext)


export function SelectedProvider({ children }) {
    const [selected,setSelected] = useState(null)

    const value = {
        selected,
        setSelected
    };

    return (
        <SelectedContext.Provider value={value}>
            {children}
        </SelectedContext.Provider>
    );
}