
import type { Box, Item } from '../types';

// --- GOOGLE SHEETS AS A DATABASE ---
// This service is now configured to use a Google Sheet as a backend.

// --- PART 1: READING DATA ---
// We read data by fetching the JSON feed from a sheet "Published to the web".
// NOTE: The old `/feeds/list` API was deprecated and shut down by Google.
// We now use the Google Visualization API (`/gviz/tq`) which provides a reliable JSON output for public sheets.
// 1. Open your Google Sheet.
// 2. Go to File > Share > Publish to the web.
// 3. Publish the entire document as a Web Page.
// 4. Ensure your sheet has the headers: box_id, item_id, item_name, item_tags
const SHEET_ID = '1nJOeAC3MmlSEmhLrLuzpXuaFI2A2_l4BKh1E2EbF-1A';
// By adding `&headers=1`, we explicitly tell the API to treat the first row as headers.
const READ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1`;


// --- PART 2: WRITING DATA ---
// We write data by sending it to a Google Apps Script deployed as a Web App.
// This provides a secure endpoint to modify the sheet without exposing credentials.
// 1. Open your sheet, go to Extensions > Apps Script.
// 2. Paste the provided doPost(e) function from the prompt.
// 3. Deploy as a Web App with "Anyone" access.
// 4. PASTE THE GENERATED WEB APP URL BELOW.
const WRITE_URL = 'https://script.google.com/macros/s/AKfycbwgmlCnLtp9FmiZDeNhbZCsbG198b6z2r87Tq43CNSNJTMdkgq1MTbGcsL_20FZ7qBBhw/exec';


/**
 * Fetches and parses box data from the public Google Sheet JSON feed using the Google Visualization API.
 */
export const getBoxes = async (): Promise<Box[]> => {
  console.log("Fetching boxes from Google Sheet...");
  try {
    const response = await fetch(READ_URL);
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    const responseText = await response.text();
    
    // Handle the JSONP wrapper returned by the gviz endpoint. The actual JSON is inside the outer parentheses.
    const jsonString = responseText.substring(responseText.indexOf('(') + 1, responseText.lastIndexOf(')'));
    const data = JSON.parse(jsonString);

    if (data.status === 'error') {
      const errorMessage = data.errors.map((e: { detailed_message: string }) => e.detailed_message).join('\n');
      throw new Error(`Google Sheets API error: ${errorMessage}`);
    }

    const cols = data.table.cols.map((col: { label: string }) => col.label.toLowerCase().trim());
    const rows = data.table.rows || [];

    // Find indices of our required columns to be robust against column reordering
    const boxIdIndex = cols.indexOf('box_id');
    const itemIdIndex = cols.indexOf('item_id');
    const itemNameIndex = cols.indexOf('item_name');
    const itemTagsIndex = cols.indexOf('item_tags');
    
    if ([boxIdIndex, itemIdIndex, itemNameIndex, itemTagsIndex].some(index => index === -1)) {
        const errorMessage = "Could not load data. Please ensure your Google Sheet has these exact headers in the first row: box_id, item_id, item_name, item_tags";
        alert(errorMessage);
        throw new Error(errorMessage);
    }

    const boxesMap = new Map<string, Box>();

    for (const row of rows) {
      const rowData = row.c;
      // Cell can be null if empty, so we use optional chaining (?.) and provide defaults
      const boxId = rowData[boxIdIndex]?.v;
      if (!boxId) continue; // Skip rows without a box_id

      const itemName = rowData[itemNameIndex]?.v;
      if (!itemName) continue; // Skip items without a name, as they are likely empty/malformed rows

      const item: Item = {
        id: rowData[itemIdIndex]?.v || `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        tags: rowData[itemTagsIndex]?.v?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
      };

      if (boxesMap.has(boxId)) {
        boxesMap.get(boxId)!.items.push(item);
      } else {
        boxesMap.set(boxId, { id: boxId, items: [item] });
      }
    }
    
    const boxes = Array.from(boxesMap.values());
    console.log("Fetched and parsed boxes:", boxes);
    return boxes;

  } catch (error) {
    console.error("Failed to fetch or parse boxes from Google Sheet:", error);
    if (error.message.includes('Network response was not ok')) {
        alert("Could not connect to Google Sheets. Please check your internet connection and ensure the sheet is 'Published to the web'.");
    }
    return [];
  }
};

/**
 * Saves the entire box collection to the Google Sheet via an Apps Script Web App.
 */
export const saveBoxes = async (boxes: Box[]): Promise<void> => {
  if (WRITE_URL.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
    console.warn("Google Apps Script URL not set. Skipping save.");
    alert("Save is not configured. Please follow Step 2 in the instructions and paste your Web App URL into `services/storageService.ts`.");
    return;
  }
  
  console.log("Saving boxes to Google Sheet...", boxes);

  // Flatten the boxes array into a 2D array suitable for the sheet
  const dataToSave: (string | number)[][] = [];
  for (const box of boxes) {
      if (box.items.length === 0) { // If a box is empty, we still want to know it exists
          dataToSave.push([box.id, '', '', '']);
      } else {
        for (const item of box.items) {
          dataToSave.push([
            box.id,
            item.id,
            item.name,
            item.tags.join(','),
          ]);
        }
      }
  }

  try {
    const response = await fetch(WRITE_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify(dataToSave),
      // Redirect is important for Apps Script web apps
      redirect: 'follow',
    });

    const result = await response.json();

    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown error from Apps Script');
    }
    
    console.log("Boxes saved successfully to Google Sheet.");

  } catch (error) {
    console.error("Failed to save boxes to Google Sheet:", error);
    alert(`Error saving data: ${error.message}. Please check the console and your Apps Script deployment.`);
    throw error;
  }
};
