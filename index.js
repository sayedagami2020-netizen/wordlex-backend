const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/analyzeWord", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: "الرجاء إرسال الكلمة المطلوبة" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    
    const prompt = `Analyze the English word "${word}" for language learners and return ONLY a strict JSON object with no markdown formatting or extra text, using this exact structure:
{
  "word": "${word}",
  "part_of_speech": "verb/noun/adjective",
  "definitions": [
    {
      "sense": "Primary use or meaning",
      "meaning": "Clear definition including Arabic translation",
      "example": "A clear contextual example sentence using the word."
    }
  ],
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // تنظيف النص لضمان إرسال JSON نقي وسليم للتطبيق
    let rawText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

    res.json({ success: true, analysis: rawText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
