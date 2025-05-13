import axios from 'axios';
import { URL } from 'url';

const AC_LINK_PATTERNS = [
  { regex: /acstuff\.ru\/s\/[^\/]+\/online\/join\?ip=([^&]+)&httpPort=(\d+)/, format: 'acstuff' },
  { regex: /assetto-corsa\.fr\/join\/\?ip=([^&]+)&httpPort=(\d+)/, format: 'ac-fr' },
  { regex: /\/join\/\?ip=([^&]+)&httpPort=(\d+)/, format: 'generic' }
];

/**
 * Parses an Assetto Corsa server link
 * Example: https://acstuff.ru/s/q:race/online/join?ip=82.67.56.137&httpPort=11411
 */
export async function parseAcServerLink(connectionLink: string) {
  try {
    // Match the link against known patterns
    let serverIP = '';
    let httpPort = '';
    let matchedFormat = '';
    
    for (const pattern of AC_LINK_PATTERNS) {
      const match = connectionLink.match(pattern.regex);
      if (match) {
        serverIP = match[1];
        httpPort = match[2];
        matchedFormat = pattern.format;
        break;
      }
    }
    
    // If no pattern matched, try to parse as URL
    if (!serverIP || !httpPort) {
      try {
        const url = new URL(connectionLink);
        serverIP = url.searchParams.get('ip') || '';
        httpPort = url.searchParams.get('httpPort') || '';
        
        if (serverIP && httpPort) {
          matchedFormat = 'url';
        }
      } catch (error) {
        console.warn('Failed to parse as URL:', error);
      }
    }
    
    // If still no match, extract from connectionLink
    if (!serverIP || !httpPort) {
      const ipMatch = connectionLink.match(/ip=([^&]+)/);
      const portMatch = connectionLink.match(/httpPort=(\d+)/);
      
      if (ipMatch) serverIP = ipMatch[1];
      if (portMatch) httpPort = portMatch[1];
      
      if (serverIP && httpPort) {
        matchedFormat = 'regex';
      }
    }
    
    // Validate extracted values
    if (!serverIP || !httpPort) {
      return {
        success: false,
        error: 'Could not extract server IP and HTTP port from the connection link'
      };
    }
    
    // Fetch server info
    const serverInfo = await fetchServerInfo(serverIP, httpPort);
    
    return {
      success: true,
      serverIP,
      httpPort,
      format: matchedFormat,
      serverInfo
    };
  } catch (error) {
    console.error('Error parsing AC server link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fetches server information from Assetto Corsa server API
 */
async function fetchServerInfo(ip: string, httpPort: string) {
  try {
    const timeout = 5000; // 5 second timeout
    const apiUrl = `http://${ip}:${httpPort}/api/details`;
    
    const response = await axios.get(apiUrl, { timeout });
    
    if (response.status === 200 && response.data) {
      // Extract and normalize server data
      const { 
        name, 
        cars, 
        track,
        maxclients: maxClients, 
        clients, 
        description,
        ...rest
      } = response.data;
      
      return { 
        name, 
        cars, 
        map: track,
        maxClients, 
        clients, 
        description,
        serverDetails: rest
      };
    }
    
    return undefined;
  } catch (error) {
    console.warn(`Failed to fetch server info from ${ip}:${httpPort}:`, error);
    return undefined;
  }
}

/**
 * Pings an Assetto Corsa server to check if it's online
 */
export async function checkServerStatus(ip: string, httpPort: string): Promise<boolean> {
  try {
    const timeout = 3000; // 3 second timeout
    const apiUrl = `http://${ip}:${httpPort}/api/ping`;
    
    const response = await axios.get(apiUrl, { timeout });
    return response.status === 200;
  } catch (error) {
    console.warn(`Server at ${ip}:${httpPort} appears to be offline:`, error);
    return false;
  }
}