import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HistoricalData } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY || "";
if (!apiKey) {
  console.warn("Missing API_KEY in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const historicalDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    year: { type: Type.INTEGER },
    eraSummary: { type: Type.STRING, description: "关于该年份世界地缘政治局势的2-3句简明中文总结。" },
    empires: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "政权/国家/文明的中文名称" },
          latitude: { type: Type.NUMBER, description: "中心纬度" },
          longitude: { type: Type.NUMBER, description: "中心经度" },
          radiusKm: { type: Type.NUMBER, description: "影响范围半径（公里），用于近似其领土大小" },
          color: { type: Type.STRING, description: "用于区分的十六进制颜色代码" },
          description: { type: Type.STRING, description: "关于该政权当时状况的简短中文描述" }
        },
        required: ["name", "latitude", "longitude", "radiusKm", "color", "description"]
      }
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "事件中文标题" },
          description: { type: Type.STRING, description: "事件中文描述" },
          latitude: { type: Type.NUMBER },
          longitude: { type: Type.NUMBER },
          type: { 
            type: Type.STRING, 
            enum: ["战争", "政治", "文化", "探索", "灾害"] 
          }
        },
        required: ["title", "description", "latitude", "longitude", "type"]
      }
    }
  },
  required: ["year", "eraSummary", "empires", "events"]
};

export const fetchHistoricalData = async (year: number): Promise<HistoricalData> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `生成公元 ${year} 年（如果是负数则为公元前）的历史数据。
    
    任务要求：
    1. 全球视野：必须包含全世界范围内的主要政权和国家（包括亚洲、欧洲、非洲、美洲、大洋洲）。不要只局限于欧洲或中国。
    2. 全面性：请列出至少 15-20 个当时存在的国家、帝国、部落联盟或主要政权。
    3. 领土近似：为每个政权提供中心坐标和大概的半径（公里）来表示其领土大小或势力范围。
    4. 历史事件：列出 6-10 个当年或前后 10 年内发生的重大历史事件。
    5. 语言：所有文本内容必须使用中文。
    
    请确保地理坐标准确。`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: historicalDataSchema,
        systemInstruction: "你是一位严谨的历史地理学家和历史地图专家。你需要提供准确的全球历史数据，涵盖所有大洲。"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");

    return JSON.parse(text) as HistoricalData;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    // Return a fallback empty state to prevent app crash
    return {
      year,
      eraSummary: "无法加载该年份的历史数据。请检查 API Key 或稍后重试。",
      empires: [],
      events: []
    };
  }
};