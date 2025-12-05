import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // ★ 修改点：更安全的解析方式
    let data = req.body;
    // 如果 Vercel 没有自动解析，它就是字符串，我们需要手动 parse
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return res.status(400).json({ error: "无效的 JSON 数据" });
        }
    }
    
    const { prompt, history } = data;

    // 检查是否有 prompt
    if (!prompt) {
        return res.status(400).json({ error: "问题不能为空" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: history || []
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error("服务器报错详情:", error); // 这行字会出现在 Vercel Logs 里
    res.status(500).json({ error: "服务器内部错误，请查看 Vercel Logs" });
  }
}