import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createUnzip } from 'zlib';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';

const streamPipeline = promisify(pipeline);

// Base directory for uploaded car files
const UPLOADS_DIR = path.resolve('./uploads');
const CARS_DIR = path.resolve(UPLOADS_DIR, 'cars');
const EXTRACTED_DIR = path.resolve(UPLOADS_DIR, 'extracted');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(CARS_DIR, { recursive: true });
  await fs.mkdir(EXTRACTED_DIR, { recursive: true });
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
    
    const fileId = uuidv4();
    const fileExt = path.extname(fileName);
    const safeFileName = `${fileId}${fileExt}`;
    const filePath = path.join(CARS_DIR, safeFileName);
    
    await fs.writeFile(filePath, fileBuffer);
    
    return {
      success: true,
      filePath,
      fileName: safeFileName,
      originalName: fileName
    };
  } catch (error) {
    console.error('Error saving car file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error saving file'
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
    
    const fileId = path.basename(filePath, path.extname(filePath));
    const extractionDir = path.join(EXTRACTED_DIR, fileId);
    
    // Create extraction directory
    await fs.mkdir(extractionDir, { recursive: true });
    
    // Extract the ZIP file
    const zip = new AdmZip(filePath);
    zip.extractAllTo(extractionDir, true);
    
    // Look for .kn5 files (3D models)
    const files = await findFiles(extractionDir, '.kn5');
    const kn5Files = files.filter(file => file.endsWith('.kn5'));
    
    return {
      success: true,
      extractedPath: extractionDir,
      model3dFiles: kn5Files,
      model3dPath: kn5Files.length > 0 ? kn5Files[0] : null
    };
  } catch (error) {
    console.error('Error extracting car file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error extracting file'
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
  
  const items = await fs.readdir(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      results = results.concat(await findFiles(fullPath, extension));
    } else if (item.isFile() && item.name.endsWith(extension)) {
      results.push(fullPath);
    }
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
      'ui_car.json',
      'car.json',
      'info.json'
    ];
    
    let metadata = {};
    
    for (const file of metadataFiles) {
      try {
        const filePath = path.join(extractedPath, file);
        const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
        
        if (fileExists) {
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          metadata = { ...metadata, ...data };
        }
      } catch (error) {
        console.warn(`Could not read metadata from ${file}`);
      }
    }
    
    // Look for preview images
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const imageFiles = [];
    
    for (const ext of imageExtensions) {
      const files = await findFiles(extractedPath, ext);
      imageFiles.push(...files);
    }
    
    // Return extracted metadata
    return {
      success: true,
      metadata,
      previewImages: imageFiles,
      mainImage: imageFiles.length > 0 ? imageFiles[0] : null
    };
  } catch (error) {
    console.error('Error extracting car metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error extracting metadata'
    };
  }
}