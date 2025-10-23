
import React from 'react';
import type { Box } from '../types';
import { ICONS } from '../constants';

interface AllBoxesViewProps {
  boxes: Box[];
  onBack: () => void;
  onSelectBox: (boxId: string) => void;
}

const AllBoxesView: React.FC<AllBoxesViewProps> = ({ boxes, onBack, onSelectBox }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <button onClick={onBack} className="flex items-center gap-1 text-primary hover:underline">
          {ICONS.back}
          <span>Dashboard</span>
        </button>
      </div>

      <div className="bg-base-800 p-4 rounded-lg border border-base-700">
        <h2 className="text-xl font-bold text-white">All Boxes ({boxes.length})</h2>
      </div>

      {boxes.length === 0 ? (
        <div className="text-center py-10 bg-base-800 rounded-lg border border-base-700">
          <p className="text-gray-400">No boxes have been added yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {boxes.map(box => (
            <li key={box.id}>
              <button 
                onClick={() => onSelectBox(box.id)}
                className="w-full text-left bg-base-800 p-4 rounded-lg border border-base-700 hover:border-primary transition-all flex justify-between items-center">
                <div>
                  <p className="font-semibold text-primary break-all">{box.id}</p>
                  <p className="text-sm text-gray-400">{box.items.length} item(s)</p>
                </div>
                <span className="text-gray-500">
                  {ICONS.go}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllBoxesView;
