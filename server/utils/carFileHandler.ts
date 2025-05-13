import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';

// Directory paths
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const EXTRACTED_DIR = path.join(process.cwd(), 'uploads', 'extracted');

/**
 * Ensures that the required directories exist
 */
async function ensureDirectories() {
  try {
    await fsp.mkdir(UPLOADS_DIR, { recursive: true });
    await fsp.mkdir(EXTRACTED_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error('Error creating directories:', error);
    return false;
  }
}

/**
 * Saves an uploaded car file to disk
 * @param fileBuffer - The file buffer
 * @param fileName - Original filename
 * @returns Object with file path information
 */
export async function saveCarFile(fileBuffer: Buffer, fileName: string) {
  try {
    await ensureDirectories();
    
    // Create a unique filename to prevent collisions
    const uniqueId = uuidv4().split('-')[0];
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${path.parse(safeName).name}_${uniqueId}${path.extname(safeName)}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);
    
    // Write the file to disk
    await fsp.writeFile(filePath, fileBuffer);
    
    return {
      success: true,
      filePath,
      originalName: fileName,
      uniqueFileName
    };
  } catch (error) {
    console.error('Error saving car file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extracts a ZIP file containing car data
 * @param filePath - Path to the ZIP file
 * @returns Object with extraction information
 */
export async function extractCarFile(filePath: string) {
  try {
    await ensureDirectories();
    
    // Create a unique extraction directory
    const fileName = path.basename(filePath, path.extname(filePath));
    const extractDir = path.join(EXTRACTED_DIR, fileName);
    
    // Ensure the extraction directory exists
    await fsp.mkdir(extractDir, { recursive: true });
    
    // Extract the ZIP
    const zip = new AdmZip(filePath);
    zip.extractAllTo(extractDir, true);
    
    // Look for 3D model files (.kn5)
    const modelFiles = await findFiles(extractDir, '.kn5');
    let model3dPath = '';
    
    if (modelFiles.length > 0) {
      model3dPath = modelFiles[0]; // Use the first found model file
    }
    
    return {
      success: true,
      extractedPath: extractDir,
      model3dPath
    };
  } catch (error) {
    console.error('Error extracting car file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Recursively find files with a specific extension
 * @param directory - Directory to search in
 * @param extension - File extension to look for
 * @returns Array of file paths
 */
async function findFiles(directory: string, extension: string): Promise<string[]> {
  let results: string[] = [];
  
  try {
    const files = await fsp.readdir(directory, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      
      if (file.isDirectory()) {
        const nestedFiles = await findFiles(fullPath, extension);
        results = [...results, ...nestedFiles];
      } else if (path.extname(file.name).toLowerCase() === extension.toLowerCase()) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error finding files in ${directory}:`, error);
  }
  
  return results;
}

/**
 * Extracts metadata from the car directory
 * Assetto Corsa cars typically have a data.acd file with car info
 * or ui_car.json with some metadata
 */
export async function extractCarMetadata(extractedPath: string) {
  try {
    // Look for common metadata files
    const metadataFiles = [
      path.join(extractedPath, 'ui_car.json'),
      path.join(extractedPath, 'ui', 'ui_car.json')
    ];
    
    let metadata: Record<string, any> = {};
    let foundMetadata = false;
    
    // Try each potential metadata file
    for (const filePath of metadataFiles) {
      try {
        const exists = await fsp.access(filePath).then(() => true).catch(() => false);
        
        if (exists) {
          const data = await fsp.readFile(filePath, 'utf-8');
          metadata = JSON.parse(data);
          foundMetadata = true;
          break;
        }
      } catch (error) {
        console.warn(`Failed to read metadata from ${filePath}:`, error);
      }
    }
    
    // Look for preview/car images
    const imageExtensions = ['.png', '.jpg', '.jpeg'];
    let mainImage = '';
    
    for (const ext of imageExtensions) {
      try {
        const imageFiles = await findFiles(extractedPath, ext);
        
        // Try to find a preview image file
        const previewImages = imageFiles.filter(file => 
          file.toLowerCase().includes('preview') || 
          file.toLowerCase().includes('car')
        );
        
        if (previewImages.length > 0) {
          mainImage = previewImages[0];
          break;
        } else if (imageFiles.length > 0) {
          // If no preview image, use the first image found
          mainImage = imageFiles[0];
          break;
        }
      } catch (error) {
        console.warn(`Failed to find ${ext} images:`, error);
      }
    }
    
    return {
      success: true,
      metadata,
      mainImage
    };
  } catch (error) {
    console.error('Error extracting car metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {}
    };
  }
}