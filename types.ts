export interface Item {
  id: string;
  name: string;
  tags: string[];
}

export interface Box {
  id: string;
  items: Item[];
}

export enum View {
  Dashboard,
  BoxView,
  AllBoxesView,
  SearchView,
  ScannerView,
}