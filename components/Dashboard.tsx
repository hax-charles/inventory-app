import React, { useState, useMemo } from 'react';
import type { Box } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  boxes: Box[];
  onNavigateToScanner: () => void;
  onShowAllBoxes: () => void;
  onSearch: (query: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ boxes, onNavigateToScanner, onShowAllBoxes, onSearch }) => {
  const [searchInput, setSearchInput] = useState('');

  const totalItems = useMemo(() => boxes.reduce((sum, box) => sum + box.items.length, 0), [boxes]);
  const totalBoxes = boxes.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-base-800 p-4 rounded-lg border border-base-700">
          <p className="text-3xl font-bold text-primary">{totalBoxes}</p>
          <p className="text-gray-400">Total Boxes</p>
        </div>
        <div className="bg-base-800 p-4 rounded-lg border border-base-700">
          <p className="text-3xl font-bold text-primary">{totalItems}</p>
          <p className="text-gray-400">Total Items</p>
        </div>
      </div>
      
      <div className="bg-base-800 p-4 rounded-lg border border-base-700 space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-base-700 pb-2">Actions</h2>
        
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <label htmlFor="search" className="font-medium text-gray-300">Search Items</label>
          <div className="flex items-center gap-2">
            <input 
              id="search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g., Laptop Charger"
              className="w-full px-3 py-2 bg-base-900 border border-base-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="bg-primary text-white p-2.5 rounded-md hover:bg-accent transition-colors shrink-0">
              {ICONS.search}
            </button>
          </div>
        </form>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button 
            onClick={onNavigateToScanner}
            className="w-full flex items-center justify-center gap-2 bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors">
            {ICONS.qr}
            <span>Scan Box</span>
          </button>
          <button 
            onClick={onShowAllBoxes}
            className="w-full flex items-center justify-center gap-2 bg-base-700 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-600 transition-colors">
            {ICONS.list}
            <span>See All Boxes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;