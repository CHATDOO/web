import { Router, Request, Response } from 'express';
import { parseAcServerLink, checkServerStatus } from '../utils/acServerParser';
import { storage } from '../storage';

const router = Router();

/**
 * Parse Assetto Corsa server link
 * POST /api/servers/parse-link
 * 
 * Body: {
 *   connectionLink: "https://acstuff.ru/s/q:race/online/join?ip=82.67.56.137&httpPort=11411"
 * }
 */
router.post('/parse-link', async (req: Request, res: Response) => {
  try {
    const { connectionLink } = req.body;
    
    if (!connectionLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'Connection link is required' 
      });
    }
    
    // Parse the connection link
    const parseResult = await parseAcServerLink(connectionLink);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to parse connection link',
        error: parseResult.error
      });
    }
    
    // Return the parsed server info
    res.json({
      success: true,
      serverInfo: parseResult.serverInfo,
      serverIP: parseResult.serverIP,
      httpPort: parseResult.httpPort
    });
    
  } catch (error) {
    console.error('Error parsing server link:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error parsing server link',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create server from parsed link
 * POST /api/servers/create-from-link
 * 
 * Body: {
 *   connectionLink: "https://acstuff.ru/s/q:race/online/join?ip=82.67.56.137&httpPort=11411",
 *   category: "GT3"  // Optional - will try to determine from server info
 * }
 */
router.post('/create-from-link', async (req: Request, res: Response) => {
  try {
    const { connectionLink, category } = req.body;
    
    if (!connectionLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'Connection link is required' 
      });
    }
    
    // Parse the connection link
    const parseResult = await parseAcServerLink(connectionLink);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to parse connection link',
        error: parseResult.error
      });
    }
    
    const { serverInfo, serverIP, httpPort } = parseResult;
    
    // Determine server category
    let serverCategory = category || "GT3";
    if (!category) {
      const { name, track } = serverInfo;
      if (name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('drift')) serverCategory = "Drift";
        else if (lowerName.includes('touge')) serverCategory = "Touge";
        else if (lowerName.includes('street')) serverCategory = "Street";
        else if (lowerName.includes('gt3')) serverCategory = "GT3";
        else if (lowerName.includes('freestyle')) serverCategory = "Freestyle";
      }
    }
    
    // Check server status
    const isOnline = await checkServerStatus(serverIP, httpPort);
    
    // Create server in database
    const server = await storage.createServer({
      name: serverInfo.name,
      description: serverInfo.description || `${serverInfo.name} server`,
      category: serverCategory,
      map: serverInfo.map,
      maxPlayers: serverInfo.maxClients,
      currentPlayers: serverInfo.clients,
      isOnline,
      connectionLink,
      trackCount: 1, // Default to 1
      serverIP,
      httpPort,
      serverDetails: serverInfo.serverDetails
    });
    
    // Return the created server
    res.status(201).json({
      success: true,
      message: 'Server created successfully',
      server
    });
    
  } catch (error) {
    console.error('Error creating server from link:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating server from link',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update server status and info
 * POST /api/servers/:id/update-status
 */
router.post('/:id/update-status', async (req: Request, res: Response) => {
  try {
    const serverId = parseInt(req.params.id);
    
    if (isNaN(serverId)) {
      return res.status(400).json({ success: false, message: 'Invalid server ID' });
    }
    
    const server = await storage.getServerById(serverId);
    
    if (!server) {
      return res.status(404).json({ success: false, message: 'Server not found' });
    }
    
    // If server doesn't have IP and port info, try to parse from connection link
    let serverIP = server.serverIP;
    let httpPort = server.httpPort;
    
    if (!serverIP || !httpPort) {
      const parseResult = await parseAcServerLink(server.connectionLink);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to parse connection link',
          error: parseResult.error
        });
      }
      
      serverIP = parseResult.serverIP;
      httpPort = parseResult.httpPort;
    }
    
    // Check server status
    const isOnline = await checkServerStatus(serverIP, httpPort);
    
    // Update server in database
    const updatedServer = await storage.updateServer(serverId, {
      isOnline,
      lastUpdated: new Date(),
      serverIP,
      httpPort
    });
    
    // If server is online, try to update current players
    if (isOnline) {
      try {
        const parseResult = await parseAcServerLink(server.connectionLink);
        
        if (parseResult.success) {
          const { serverInfo } = parseResult;
          
          await storage.updateServer(serverId, {
            currentPlayers: serverInfo.clients,
            serverDetails: serverInfo.serverDetails
          });
        }
      } catch (error) {
        console.error('Error updating server details:', error);
        // Continue anyway - we already updated the online status
      }
    }
    
    // Return the updated server
    res.json({
      success: true,
      message: 'Server status updated',
      server: updatedServer
    });
    
  } catch (error) {
    console.error('Error updating server status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating server status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;