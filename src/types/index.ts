export interface SavedImage {
  id: number;
  local_uri: string;
  description?: string; // Make this optional for older rows
}