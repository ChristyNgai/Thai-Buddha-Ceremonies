import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 设置 CORS，允许你的网站访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  // 处理预检请求 (Options)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. 从环境变量获取 Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // 2. 获取前端发来的问题
    const { prompt } = req.body;

    // 3. 呼叫 Google AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. 返回结果
    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "服务器出错了，请检查日志" });
  }
}