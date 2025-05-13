import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';
import { saveCarFile, extractCarFile, extractCarMetadata } from '../utils/carFileHandler';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only zip files
    if (file.mimetype === 'application/zip' || 
        file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

/**
 * Upload a car ZIP file
 * POST /api/cars/upload
 */
router.post('/upload', upload.single('carFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { originalname, buffer } = req.file;
    
    // Save the uploaded file
    const saveResult = await saveCarFile(buffer, originalname);
    
    if (!saveResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save file',
        error: saveResult.error
      });
    }
    
    // Extract the ZIP file
    const extractResult = await extractCarFile(saveResult.filePath);
    
    if (!extractResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to extract ZIP file',
        error: extractResult.error
      });
    }
    
    // Extract metadata from the car files
    const metadataResult = await extractCarMetadata(extractResult.extractedPath);
    
    // Prepare car data
    const carName = metadataResult.success && metadataResult.metadata && 
                    typeof metadataResult.metadata === 'object' && 'name' in metadataResult.metadata 
      ? String(metadataResult.metadata.name)
      : path.basename(originalname, '.zip');
    
    const specs = metadataResult.success ? metadataResult.metadata : {};
    
    // Generate a download URL for the car
    const carId = uuidv4().split('-')[0];
    const downloadUrl = `/api/cars/${carId}/download`;
    
    // Determine the car category based on metadata or filename
    let category = "Sport";
    if (metadataResult.success && metadataResult.metadata && 
        typeof metadataResult.metadata === 'object' && 'category' in metadataResult.metadata) {
      category = String(metadataResult.metadata.category);
    } else if (originalname.toLowerCase().includes('drift')) {
      category = "Drift";
    } else if (originalname.toLowerCase().includes('gt')) {
      category = "GT";
    } else if (originalname.toLowerCase().includes('jdm')) {
      category = "JDM";
    } else if (originalname.toLowerCase().includes('f1')) {
      category = "F1";
    } else if (originalname.toLowerCase().includes('rally')) {
      category = "Rally";
    }
    
    // Store car in database
    const car = await storage.createCar({
      name: carName,
      category,
      imageUrl: metadataResult.success && metadataResult.mainImage 
        ? metadataResult.mainImage.replace(process.cwd(), '') 
        : undefined,
      downloadUrl,
      rating: 40, // Default rating
      specs,
      filePath: saveResult.filePath,
      extractedPath: extractResult.extractedPath,
      model3dPath: extractResult.model3dPath
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Car uploaded and processed successfully',
      car
    });
    
  } catch (error) {
    console.error('Error uploading car:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing car upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Download a car file
 * GET /api/cars/:id/download
 */
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({ success: false, message: 'Invalid car ID' });
    }
    
    const car = await storage.getCarById(carId);
    
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    // If we have a file path, send the file
    if (car.filePath) {
      const filePath = car.filePath;
      const fileName = path.basename(filePath);
      
      // Check if file exists
      await fs.access(filePath);
      
      // Set content disposition and type
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/zip');
      
      // Stream the file
      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // If we don't have a file path, return a placeholder response
      res.json({ 
        success: true, 
        message: `Download started for ${car.name}`,
        downloadUrl: car.downloadUrl
      });
    }
  } catch (error) {
    console.error('Error downloading car:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing car download',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get 3D model file
 * GET /api/cars/:id/model3d
 */
router.get('/:id/model3d', async (req: Request, res: Response) => {
  try {
    const carId = parseInt(req.params.id);
    
    if (isNaN(carId)) {
      return res.status(400).json({ success: false, message: 'Invalid car ID' });
    }
    
    const car = await storage.getCarById(carId);
    
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    // If we have a 3D model path, return information about it
    if (car.model3dPath) {
      res.json({
        success: true,
        model3dPath: car.model3dPath,
        fileName: path.basename(car.model3dPath)
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'No 3D model available for this car'
      });
    }
  } catch (error) {
    console.error('Error retrieving 3D model:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving 3D model',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;