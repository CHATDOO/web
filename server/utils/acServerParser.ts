import axios from 'axios';

/**
 * Parses an Assetto Corsa server link
 * Example: https://acstuff.ru/s/q:race/online/join?ip=82.67.56.137&httpPort=11411
 */
export async function parseAcServerLink(connectionLink: string) {
  try {
    // Extract query parameters from the URL
    const url = new URL(connectionLink);
    const ip = url.searchParams.get('ip');
    const httpPort = url.searchParams.get('httpPort');
    
    if (!ip || !httpPort) {
      throw new Error('Invalid server link format: missing IP or HTTP port');
    }
    
    // Attempt to fetch server details from the server API
    const serverInfo = await fetchServerInfo(ip, httpPort);
    
    return {
      serverIP: ip,
      httpPort,
      serverInfo,
      success: true
    };
  } catch (error) {
    console.error('Error parsing AC server link:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error parsing server link',
      success: false
    };
  }
}

/**
 * Fetches server information from Assetto Corsa server API
 */
async function fetchServerInfo(ip: string, httpPort: string) {
  try {
    // Construct the server info URL
    const infoUrl = `http://${ip}:${httpPort}/api/details`;
    
    // Fetch server details
    const response = await axios.get(infoUrl, { timeout: 5000 });
    const data = response.data;
    
    // Extract relevant information
    return {
      name: data.name || 'Unknown Server',
      map: data.track?.name || data.track || 'Unknown Track',
      cars: data.cars || [],
      maxClients: data.maxClients || 0,
      clients: data.clients?.length || 0,
      description: data.description || '',
      serverDetails: data
    };
  } catch (error) {
    console.error('Error fetching server info:', error);
    throw new Error('Could not fetch server information. The server may be offline.');
  }
}

/**
 * Pings an Assetto Corsa server to check if it's online
 */
export async function checkServerStatus(ip: string, httpPort: string): Promise<boolean> {
  try {
    const response = await axios.get(`http://${ip}:${httpPort}/api/ping`, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}