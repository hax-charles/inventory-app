import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View } from './types';
import type { Box } from './types';
import Dashboard from './components/Dashboard';
import BoxView from './components/BoxView';
import AllBoxesView from './components/AllBoxesView';
import SearchView from './components/SearchView';
import ScannerView from './components/ScannerView';
import { ICONS } from './constants';
import { getBoxes, saveBoxes as saveBoxesToStorage } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Dashboard);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBoxes = async () => {
      setIsLoading(true);
      const fetchedBoxes = await getBoxes();
      setBoxes(fetchedBoxes);
      setIsLoading(false);
    };
    loadBoxes();
  }, []);

  const allItemNames = useMemo(() => {
    const itemNames = new Set<string>();
    boxes.forEach(box => {
      box.items.forEach(item => {
        itemNames.add(item.name);
      });
    });
    return Array.from(itemNames);
  }, [boxes]);

  const saveBoxes = useCallback(async (newBoxes: Box[]) => {
    setBoxes(newBoxes); // Optimistically update the UI
    try {
      await saveBoxesToStorage(newBoxes);
    } catch (error) {
      console.error("Failed to save boxes:", error);
      // In a real app, you might show an error to the user and revert the state
    }
  }, []);

  const handleNavigateToBox = useCallback((boxId: string) => {
    setActiveBoxId(boxId);
    setView(View.BoxView);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setActiveBoxId(null);
    setSearchQuery('');
    setView(View.Dashboard);
  }, []);
  
  const handleShowAllBoxes = useCallback(() => {
    setView(View.AllBoxesView);
  }, []);
  
  const handleNavigateToScanner = useCallback(() => {
    setView(View.ScannerView);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setView(View.SearchView);
  }, []);

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-gray-300">Loading Shared Boxes...</p>
        </div>
      );
    }

    switch(view) {
      case View.ScannerView:
        return <ScannerView 
          onScanSuccess={handleNavigateToBox}
          onBack={handleBackToDashboard} 
        />;
      case View.BoxView:
        return <BoxView 
          boxId={activeBoxId!} 
          onBack={handleBackToDashboard}
          boxes={boxes}
          saveBoxes={saveBoxes}
          allItemNames={allItemNames}
          />;
      case View.AllBoxesView:
        return <AllBoxesView 
          boxes={boxes} 
          onBack={handleBackToDashboard} 
          onSelectBox={handleNavigateToBox}
          />;
      case View.SearchView:
        return <SearchView 
          query={searchQuery} 
          boxes={boxes} 
          onBack={handleBackToDashboard}
          onSelectBox={handleNavigateToBox} 
          />;
      case View.Dashboard:
      default:
        return <Dashboard 
          isLoading={isLoading}
          boxes={boxes} 
          onNavigateToScanner={handleNavigateToScanner} 
          onShowAllBoxes={handleShowAllBoxes}
          onSearch={handleSearch}
          />;
    }
  };

  return (
    <div className="min-h-screen bg-base-900 font-sans text-neutral">
      <header className="bg-base-800 text-white border-b border-base-700 sticky top-0 z-10">
        <div className="container mx-auto p-4 flex justify-between items-center max-w-3xl">
          <div className="flex items-center gap-2">
            {ICONS.box}
            <h1 className="text-xl font-bold">Inventory QR Manager</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 max-w-3xl">
        {renderView()}
      </main>
    </div>
  );
};

export default App;