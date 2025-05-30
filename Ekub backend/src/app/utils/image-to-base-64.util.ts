import axios from "axios";

export const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const base64Encoded = Buffer.from(response.data, 'binary').toString('base64');
      return base64Encoded;
    } catch (error) {
      throw new Error(`Error fetching and encoding image: ${error}`);
    }
  };