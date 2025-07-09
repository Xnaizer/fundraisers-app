// lib/pinataService.ts
export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export class PinataService {
  private static readonly API_URL = 'https://api.pinata.cloud';
  private static readonly GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';

  private static getHeaders() {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!jwt) {
      throw new Error('Pinata JWT not configured');
    }

    return {
      'Authorization': `Bearer ${jwt}`,
    };
  }

  static async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: `fundraisers-${Date.now()}-${file.name}`,
        keyvalues: {
          project: 'fundraisers',
          type: 'program-image'
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const response = await fetch(`${this.API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Pinata upload failed: ${errorData}`);
      }

      const result: PinataResponse = await response.json();
      return `${this.GATEWAY_URL}/${result.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/data/testAuthentication`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Pinata connection test failed:', error);
      return false;
    }
  }
}