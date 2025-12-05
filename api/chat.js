import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = "AIza...;
    if (!apiKey) throw new Error("API Key 缺失");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    let data = req.body;
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
    }
    
    const { prompt, history } = data || {};
    if (!prompt) return res.status(400).json({ error: "请输入问题" });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({ history: Array.isArray(history) ? history : [] });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "服务器内部错误" });
  }
}
