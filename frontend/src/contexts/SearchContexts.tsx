import React, { createContext, useContext, useState, ReactNode } from "react";

type LocationCoords = { latitude: number; longitude: number } | null;

interface SearchContextType {
  startLocation: string;
  endLocation: string;
  startCoords: LocationCoords;
  endCoords: LocationCoords;
  setSearch: (
    startLocation: string,
    endLocation: string,
    startCoords: LocationCoords,
    endCoords: LocationCoords
  ) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<LocationCoords>(null);
  const [endCoords, setEndCoords] = useState<LocationCoords>(null);

  const setSearch = (
    start: string,
    end: string,
    startC: LocationCoords,
    endC: LocationCoords
  ) => {
    setStartLocation(start);
    setEndLocation(end);
    setStartCoords(startC);
    setEndCoords(endC);
  };

  const clearSearch = () => {
    setStartLocation("");
    setEndLocation("");
    setStartCoords(null);
    setEndCoords(null);
  };

  return (
    <SearchContext.Provider
      value={{
        startLocation,
        endLocation,
        startCoords,
        endCoords,
        setSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used within SearchProvider");
  return ctx;
};