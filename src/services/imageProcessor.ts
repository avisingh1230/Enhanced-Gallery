// src/services/imageProcessor.ts
import { describeImage } from './aiService';
import { updateImageDescription } from '../database/db';
import { File, Paths } from 'expo-file-system';
import { saveImageUri } from '../database/db';
import { createEmbeddings } from './embed';


export const processImageDescription = async (id: number, uri: string, onComplete?: () => void) => {
  try {
    console.log(`[Background] Starting AI description for image ID: ${id}`);
    
    const description = await describeImage(uri);
    
    console.log(`Generated for Image Id-${id},\n Desciption:${description}`)
    
    
    
    // Update the local SQLite database
    updateImageDescription(id, description);
    
    console.log(`[Background] Successfully updated ID ${id}`);
    
    // Call the refresh callback if provided (to update UI)
    if (onComplete) onComplete();
    
  } catch (error) {
    console.error(`[Background] Failed for ID ${id}:`, error);
  }
};

export async function saveImage(sourceUri:string){
  const fileName = sourceUri.split('/').pop() || `img_${Date.now()}.jpg`;
  const tempFile = new File(sourceUri);
  const permanentFile = new File(Paths.document, fileName);

  tempFile.copy(permanentFile);
  // 1. SAVE IMMEDIATELY to DB
  const newId = saveImageUri(permanentFile.uri);

  // 3. START AI IN BACKGROUND (Don't 'await' this)
  processImageDescription(newId, permanentFile.uri);
  
}