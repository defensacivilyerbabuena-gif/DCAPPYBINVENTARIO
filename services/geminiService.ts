import { GoogleGenAI } from "@google/genai";
import { InventoryItem } from "../types";

// Clave API proporcionada para el entorno de demostración.
// PRECAUCIÓN: En un entorno de producción público, mueva esta clave a las variables de entorno (process.env.API_KEY)
// para evitar su exposición en el código fuente.
const DEMO_API_KEY = "AIzaSyCVkoRDKgPGUN-oVPtqHuJdvH9MoexGGQ0";

// Se prioriza la variable de entorno, si no existe, se usa la clave demo.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || DEMO_API_KEY });

export const generateInventoryResponse = async (
  query: string,
  inventoryContext: InventoryItem[]
): Promise<string> => {
  
  // Create a lightweight context string from the inventory
  const contextString = inventoryContext.map(item =>
    `- ${item.name} (${item.category}): Total ${item.quantity}, Disponible ${item.available}. ID: ${item.id}. Specs: ${JSON.stringify(item.specifications)}`
  ).join('\n');

  const systemPrompt = `
    Eres el Asistente Inteligente de Defensa Civil Yerba Buena.
    Tu misión es ayudar al personal a localizar equipos y gestionar el inventario.
    
    INVENTARIO ACTUAL:
    ${contextString}
    
    INSTRUCCIONES:
    1. Responde preguntas sobre disponibilidad basándote SOLO en el inventario actual provisto arriba.
    2. Si te piden sugerencias para un nuevo equipo (que no está en la lista), sugiere especificaciones técnicas estándar para emergencias.
    3. Sé conciso, profesional y usa un tono de servicio de emergencia.
    4. Si preguntan por algo que no existe, dilo claramente.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "No pude generar una respuesta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, hubo un error al consultar a la IA. Verifique su conexión o clave API.";
  }
};