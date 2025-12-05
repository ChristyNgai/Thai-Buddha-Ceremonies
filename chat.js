import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. 设置允许跨域 (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. 验证 API Key 是否存在
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key 未在 Vercel 环境变量中设置");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 3. 安全解析数据 (最容易出错的地方)
    let data = req.body;
    // 如果 data 是字符串，尝试解析它；如果是对象，直接使用
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.error("JSON解析失败:", e);
            return res.status(400).json({ error: "发送的数据格式不正确" });
        }
    }
    
    const { prompt, history } = data;

    if (!prompt) {
        return res.status(400).json({ error: "问题不能为空" });
    }

    // 4. 启动模型和对话
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // 确保 history 是数组
    const chat = model.startChat({
      history: Array.isArray(history) ? history : []
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. 返回结果
    res.status(200).json({ text });

  } catch (error) {
    console.error("后端详细报错:", error);
    // 把具体的错误发回前端，方便我们看是什么问题
    res.status(500).json({ error: error.message || "服务器内部错误" });
  }
}