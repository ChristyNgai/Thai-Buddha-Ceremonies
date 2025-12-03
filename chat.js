import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // 1. 获取前端发来的：当前问题 (prompt) 和 历史记录 (history)
    const { prompt, history } = JSON.parse(req.body);

    // 2. 准备模型
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 3. 开启聊天模式 (startChat)
    // 这里我们将前端传来的 history 喂给它，恢复上下文
    const chat = model.startChat({
      history: history || [] // 如果没有历史，就用空数组
    });

    // 4. 发送新消息 (sendMessage) 而不是 generateContent
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. 返回结果
    res.status(200).json({ text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
}