import React, { useMemo } from 'react';
import type { Box } from '../types';
import { ICONS } from '../constants';

interface SearchViewProps {
  query: string;
  boxes: Box[];
  onBack: () => void;
  onSelectBox: (boxId: string) => void;
}

const HighlightedText: React.FC<{text: string, highlight: string}> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-400 text-black rounded px-1">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};


const SearchView: React.FC<SearchViewProps> = ({ query, boxes, onBack, onSelectBox }) => {
  const searchResults = useMemo(() => {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    return boxes
      .map(box => {
        const matchingItems = box.items.filter(
          item =>
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            item.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
        );
        return { ...box, items: matchingItems };
      })
      .filter(box => box.items.length > 0);
  }, [query, boxes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <button onClick={onBack} className="flex items-center gap-1 text-primary hover:underline">
          {ICONS.back}
          <span>Dashboard</span>
        </button>
      </div>

      <div className="bg-base-800 p-4 rounded-lg border border-base-700">
        <h2 className="text-xl font-bold text-white">Search Results</h2>
        <p className="text-gray-400">Found {searchResults.length} box(es) for "<span className="font-semibold text-neutral">{query}</span>"</p>
      </div>

      {searchResults.length === 0 ? (
        <div className="text-center py-10 bg-base-800 rounded-lg border border-base-700">
          <p className="text-gray-400">No items found matching your search.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {searchResults.map(box => (
            <li key={box.id} className="bg-base-800 p-4 rounded-lg border border-base-700 space-y-2">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-primary break-all">{box.id}</h3>
                 <button onClick={() => onSelectBox(box.id)} className="text-sm text-accent hover:underline">View Box</button>
              </div>
              <ul className="space-y-2 pt-1 pl-4 border-l-2 border-accent">
                {box.items.map(item => (
                  <li key={item.id} className="text-neutral">
                    <HighlightedText text={item.name} highlight={query} />
                     {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 text-xs">
                        {item.tags.map(tag => (
                          <span key={tag} className="bg-base-700 text-gray-300 px-2 py-0.5 rounded-full">
                           <HighlightedText text={tag} highlight={query} />
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchView;