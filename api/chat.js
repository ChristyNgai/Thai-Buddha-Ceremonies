import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS 配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ==========================================
    // ▼▼▼ 请在下面填入你的 API KEY ▼▼▼
    // 注意：必须保留双引号，把 Key 放在引号中间
    const apiKey = "AIza..."; 
    // ▲▲▲ ====================================

    console.log("正在尝试使用的 Key 前5位:", apiKey.substring(0, 5)); // 这一行会打印到日志帮我们排查

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 解析数据
    let data = req.body;
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
    }
    const { prompt, history } = data || {};

    if (!prompt) return res.status(400).json({ error: "问题不能为空" });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({ history: Array.isArray(history) ? history : [] });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error("服务器崩溃详情:", error);
    res.status(500).json({ error: error.message || "服务器代码运行出错" });
  }
}
