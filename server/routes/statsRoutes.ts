import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

/**
 * Get dashboard statistics
 * GET /api/stats
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const servers = await storage.getAllServers();
    const cars = await storage.getAllCars();
    
    const stats = {
      serverCount: servers.length,
      carCount: cars.length,
      playerCount: servers.reduce((sum, server) => sum + server.currentPlayers, 0),
      availability: "24/7"
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

/**
 * Get download statistics
 * GET /api/stats/downloads
 */
router.get('/downloads', async (_req: Request, res: Response) => {
  try {
    const cars = await storage.getAllCars();
    
    // In a real application, we would track actual downloads
    // For demo, we'll generate some random download stats
    const downloadStats = {
      totalDownloads: 2367,
      topDownloaded: cars.slice(0, 3).map(car => ({ 
        id: car.id, 
        name: car.name, 
        downloads: Math.floor(Math.random() * 500) + 100 
      })),
      weeklyGrowth: "+12.5%",
      monthlyGrowth: "+34.2%"
    };
    
    res.json(downloadStats);
  } catch (error) {
    console.error('Error fetching download stats:', error);
    res.status(500).json({ message: 'Failed to fetch download statistics' });
  }
});

/**
 * Get player activity statistics
 * GET /api/stats/player-activity
 */
router.get('/player-activity', async (_req: Request, res: Response) => {
  try {
    const servers = await storage.getAllServers();
    
    // Generate player activity data
    // In a real app, this would come from a database tracking player sessions
    const playerActivity = {
      currentOnline: servers.reduce((sum, server) => sum + server.currentPlayers, 0),
      peakToday: servers.reduce((sum, server) => sum + server.currentPlayers, 0) + 12,
      weeklyAverage: Math.floor(servers.reduce((sum, server) => sum + server.currentPlayers, 0) * 0.75),
      activityByHour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        players: Math.floor(Math.random() * 40) + 5
      })),
      activityByDay: Array.from({ length: 7 }, (_, day) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
        players: Math.floor(Math.random() * 60) + 20
      }))
    };
    
    res.json(playerActivity);
  } catch (error) {
    console.error('Error fetching player activity:', error);
    res.status(500).json({ message: 'Failed to fetch player activity statistics' });
  }
});

/**
 * Get car distribution statistics
 * GET /api/stats/car-distribution
 */
router.get('/car-distribution', async (_req: Request, res: Response) => {
  try {
    const cars = await storage.getAllCars();
    
    // Count cars by category
    const categoryCounts: Record<string, number> = {};
    cars.forEach(car => {
      categoryCounts[car.category] = (categoryCounts[car.category] || 0) + 1;
    });
    
    // Format for chart display
    const carDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));
    
    res.json(carDistribution);
  } catch (error) {
    console.error('Error fetching car distribution:', error);
    res.status(500).json({ message: 'Failed to fetch car distribution statistics' });
  }
});

export default router;