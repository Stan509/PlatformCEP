import React, { createContext, useContext, useState, useEffect } from 'react';

export type ViewMode = 'institutionnel' | 'technique';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isInstitutional: boolean;
  isTechnical: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'cep_admin_view_mode';

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'institutionnel' || saved === 'technique') {
      return saved;
    }
    return 'institutionnel'; // Mode épuré par défaut pour les membres du CEP
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  const toggleViewMode = () => {
    const nextMode = viewMode === 'institutionnel' ? 'technique' : 'institutionnel';
    setViewMode(nextMode);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        isInstitutional: viewMode === 'institutionnel',
        isTechnical: viewMode === 'technique',
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
