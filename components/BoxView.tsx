
import React, { useState, useEffect } from 'react';
import type { Box, Item } from '../types';
import { ICONS } from '../constants';
import { generateTags } from '../services/geminiService';

interface BoxViewProps {
  boxId: string;
  onBack: () => void;
  boxes: Box[];
  saveBoxes: (newBoxes: Box[]) => void;
  allItemNames: string[];
}

const BoxView: React.FC<BoxViewProps> = ({ boxId, onBack, boxes, saveBoxes, allItemNames }) => {
  const [box, setBox] = useState<Box | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemTags, setNewItemTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isTagging, setIsTagging] = useState(false);

  useEffect(() => {
    const existingBox = boxes.find(b => b.id === boxId);
    if (existingBox) {
      setBox(existingBox);
    } else {
      setBox({ id: boxId, items: [] });
      setIsEditing(true); // new box starts in edit mode
    }
  }, [boxId, boxes]);

  const handleSave = () => {
    if (box) {
      const otherBoxes = boxes.filter(b => b.id !== boxId);
      const existingBox = boxes.find(b => b.id === boxId);
      // Only add box if it has items or if it's an existing box being updated
      if (box.items.length > 0 || existingBox) {
         saveBoxes([...otherBoxes, box]);
      } else {
        // If it's a new box with no items, don't save it.
        saveBoxes(otherBoxes);
        onBack(); // Go back since the box was not saved
        return;
      }
    }
    setIsEditing(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim() && box) {
      const newItem: Item = {
        id: `ITEM-${Date.now()}`,
        name: newItemName.trim(),
        tags: newItemTags,
      };
      setBox({ ...box, items: [...box.items, newItem] });
      setNewItemName('');
      setNewItemTags([]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (box) {
      setBox({ ...box, items: box.items.filter(item => item.id !== itemId) });
    }
  };

  const handleAutoTag = async () => {
    if (newItemName.trim()) {
      setIsTagging(true);
      const tags = await generateTags(newItemName.trim());
      setNewItemTags(tags);
      setIsTagging(false);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemTags(e.target.value.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean));
  };

  if (!box) {
    return <div>Loading...</div>;
  }
  
  const isNewBox = !boxes.some(b => b.id === boxId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={isEditing ? handleSave : onBack} className="flex items-center gap-1 text-primary hover:underline">
          {ICONS.back}
          <span>Dashboard</span>
        </button>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-accent text-white font-semibold py-2 px-3 rounded-md hover:bg-blue-600 transition-colors">
            {ICONS.edit}
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="bg-base-800 p-4 rounded-lg border border-base-700">
        <h2 className="text-xl font-bold text-primary break-all">{box.id}</h2>
        <p className="text-gray-400">{isNewBox ? 'New Box' : `${box.items.length} item(s)`}</p>
      </div>

      {isEditing && (
        <div className="bg-base-800 p-4 rounded-lg border border-base-700 space-y-4">
          <h3 className="text-lg font-semibold text-white">Add Item</h3>
          <form onSubmit={handleAddItem} className="space-y-3">
            <div>
              <label htmlFor="itemName" className="font-medium text-gray-300 block mb-1">Item Name</label>
              <input
                id="itemName"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Winter Jacket"
                list="item-suggestions"
                className="w-full px-3 py-2 bg-base-900 border border-base-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <datalist id="item-suggestions">
                {allItemNames.map(name => <option key={name} value={name} />)}
              </datalist>
            </div>
             <div>
              <label htmlFor="itemTags" className="font-medium text-gray-300 block mb-1">Tags (comma-separated)</label>
              <div className="flex items-center gap-2">
                 <input
                  id="itemTags"
                  type="text"
                  value={newItemTags.join(', ')}
                  onChange={handleTagInputChange}
                  placeholder="e.g., clothing, outdoor, warm"
                  className="w-full px-3 py-2 bg-base-900 border border-base-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button 
                  type="button" 
                  onClick={handleAutoTag}
                  disabled={isTagging || !newItemName}
                  className="bg-purple-600 text-white p-2.5 rounded-md hover:bg-purple-700 transition-colors shrink-0 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  aria-label="Generate Tags"
                  >
                  {isTagging ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : ICONS.magic}
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <div className="flex w-full sm:w-1/2 gap-3">
                <button 
                    type="submit" 
                    className="w-1/2 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-accent transition-colors"
                >
                    {ICONS.add}
                    <span>Add</span>
                </button>
                <button 
                    type="button"
                    onClick={handleSave}
                    className="w-1/2 flex items-center justify-center gap-2 bg-success text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                    {ICONS.save}
                    <span>Save</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-base-800 p-4 rounded-lg border border-base-700 space-y-3">
        <h3 className="text-lg font-semibold text-white border-b border-base-700 pb-2">Items in Box</h3>
        {box.items.length === 0 && <p className="text-gray-400 text-center py-4">This box is empty. Add items to get started.</p>}
        <ul className="space-y-2">
          {box.items.map(item => (
            <li key={item.id} className="flex items-start justify-between p-2.5 border border-base-700 rounded-md bg-base-900">
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
                        {ICONS.tag} {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isEditing && (
                <button onClick={() => handleRemoveItem(item.id)} className="text-error hover:text-red-500 p-1 shrink-0 ml-2" aria-label={`Remove ${item.name}`}>
                  {ICONS.trash}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BoxView;
