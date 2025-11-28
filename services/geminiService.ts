import { GoogleGenAI } from "@google/genai";
import { LocationDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLocationDetails = async (
  latitude: number,
  longitude: number
): Promise<LocationDetails> => {
  try {
    const prompt = `
      I am currently located at Latitude: ${latitude}, Longitude: ${longitude}.
      
      Using Google Maps, perform a precise reverse geocoding to find the exact address. 
      I need a highly detailed location report similar to a delivery app.
      
      Please identify and list the following specific details:
      - House Number / Building Name (if available)
      - Road / Street Name
      - Colony / Area / Sector / Village
      - Nearest Landmark
      - City / District
      - State
      - Pincode (Postal Code)
      
      After listing these, provide a single "Full Address" paragraph that combines them.
      
      Format the output clearly with bold labels.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude
            }
          }
        }
      },
    });

    const text = response.text || "Detailed address could not be found.";
    
    // Extract grounding sources from Google Maps
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const sources = groundingChunks
      ?.map((chunk: any) => {
        // Handle Google Maps grounding chunks
        if (chunk.maps) {
          return { 
            uri: chunk.maps.sourceUri || chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, 
            title: chunk.maps.title || "Google Maps Place" 
          };
        }
        // Fallback for generic web chunks if any
        if (chunk.web) {
          return { uri: chunk.web.uri, title: chunk.web.title };
        }
        return undefined;
      })
      .filter((source: any) => source !== undefined) || [];

    // If no sources returned but we have coords, add a manual link
    if (sources.length === 0) {
        sources.push({
            uri: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            title: "View on Google Maps"
        });
    }

    return {
      text,
      sources,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to retrieve detailed address info.");
  }
};
