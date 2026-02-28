import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

// custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Initialize with empty/default values - NO localStorage
  const [searchParams, setSearchParams] = useState({
    treatment: '',
    city: '',
    budget: 100000
  });

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  const value = {
    searchParams,
    setSearchParams,
    hospitals,
    setHospitals,
    selectedHospital,
    setSelectedHospital
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
