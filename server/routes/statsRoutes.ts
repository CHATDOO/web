import express, { Request, Response } from 'express';
import { storage } from '../storage';

const router = express.Router();

/**
 * Get dashboard statistics
 * GET /api/stats
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Fetch counts from storage
    const servers = await storage.getAllServers();
    const cars = await storage.getAllCars();
    
    // Calculate online servers
    const onlineServers = servers.filter(server => server.isOnline);
    
    // Calculate total player count (sum of players in all servers)
    const playerCount = servers.reduce((total, server) => {
      return total + (server.currentPlayers || 0);
    }, 0);
    
    // Calculate availability (percentage of online servers)
    const availability = servers.length > 0 
      ? Math.round((onlineServers.length / servers.length) * 100) 
      : 100;
    
    // Response object
    const stats = {
      serverCount: servers.length,
      carCount: cars.length,
      playerCount,
      availability: `${availability}%`,
      // Add more statistics as needed
    };
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

/**
 * Get download statistics
 * GET /api/stats/downloads
 */
router.get('/downloads', async (_req: Request, res: Response) => {
  try {
    // This would typically come from a database
    // For demonstration, we'll hard-code sample data
    const downloadStats = [
      { category: 'GT3', count: 145 },
      { category: 'GT4', count: 98 },
      { category: 'Drift', count: 120 },
      { category: 'Rallye', count: 75 },
      { category: 'Formula', count: 110 },
      { category: 'JDM', count: 130 },
      { category: 'Autre', count: 50 }
    ];
    
    return res.json(downloadStats);
  } catch (error) {
    console.error('Error fetching download statistics:', error);
    return res.status(500).json({ message: 'Failed to fetch download statistics' });
  }
});

/**
 * Get player activity statistics
 * GET /api/stats/player-activity
 */
router.get('/player-activity', async (_req: Request, res: Response) => {
  try {
    // Sample data for the last 7 days
    const today = new Date();
    const playerActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      
      // For demo purposes, generate random player counts that follow a weekly pattern
      // (higher on weekends, lower on weekdays)
      let playerCount = 30 + Math.floor(Math.random() * 20); // Base count between 30-50
      
      // Weekend boost
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = Sunday, 6 = Saturday
        playerCount += 20 + Math.floor(Math.random() * 20); // Add 20-40 more players on weekends
      }
      
      return {
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        count: playerCount
      };
    });
    
    return res.json(playerActivity);
  } catch (error) {
    console.error('Error fetching player activity:', error);
    return res.status(500).json({ message: 'Failed to fetch player activity' });
  }
});

/**
 * Get car distribution statistics
 * GET /api/stats/car-distribution
 */
router.get('/car-distribution', async (_req: Request, res: Response) => {
  try {
    // In a real application, you would fetch this from the database
    // For demonstration, we'll provide sample data
    const distribution = [
      { category: 'GT3', percentage: 35 },
      { category: 'Drift', percentage: 25 },
      { category: 'Rallye', percentage: 15 },
      { category: 'JDM', percentage: 15 },
      { category: 'Autre', percentage: 10 }
    ];
    
    return res.json(distribution);
  } catch (error) {
    console.error('Error fetching car distribution:', error);
    return res.status(500).json({ message: 'Failed to fetch car distribution' });
  }
});

export default router;