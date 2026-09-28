import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type AtlasEntityType = 'PROJECT' | 'SUPPLIER' | 'CONTRACT' | 'TENDER' | 'ASSET' | 'SUBSTATION' | 'TRANSMISSION_LINE' | 'RISK' | 'EVENT' | 'DOCUMENT' | 'WORKFLOW' | 'FINANCIAL_RECORD';

export interface AtlasEntityContext {
  id: string;
  type: AtlasEntityType;
  label: string;
  status?: string;
  source?: string;
  updatedAt?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

interface AtlasContextValue {
  currentModule: string;
  selectedEntity: AtlasEntityContext | null;
  inspectorOpen: boolean;
  setCurrentModule: (module: string) => void;
  selectEntity: (entity: AtlasEntityContext) => void;
  closeInspector: () => void;
}

const AtlasContext = createContext<AtlasContextValue | undefined>(undefined);

export function AtlasContextProvider({ children }: { children: React.ReactNode }) {
  const [currentModule, setCurrentModule] = useState('overview');
  const [selectedEntity, setSelectedEntity] = useState<AtlasEntityContext | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const selectEntity = useCallback((entity: AtlasEntityContext) => {
    setSelectedEntity(entity);
    setInspectorOpen(true);
  }, []);
  const closeInspector = useCallback(() => setInspectorOpen(false), []);

  const value = useMemo(() => ({ currentModule, selectedEntity, inspectorOpen, setCurrentModule, selectEntity, closeInspector }), [currentModule, selectedEntity, inspectorOpen, selectEntity, closeInspector]);
  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}

export function useAtlasContext() {
  const context = useContext(AtlasContext);
  if (!context) throw new Error('useAtlasContext must be used within AtlasContextProvider');
  return context;
}
