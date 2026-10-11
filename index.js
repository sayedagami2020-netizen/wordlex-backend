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
      return res.status(400).json({ error: "Please provide a word." });
    }

    // استخدام النموذج الذي طلبته واقترحته جوجل رسمياً
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    
    const prompt = `Analyze the English word "${word}" for language learners. Return ONLY a strict JSON object with NO markdown formatting, NO backticks, and NO extra text, using this exact structure:
{
  "word": "${word}",
  "cefr_level": "B2",
  "part_of_speech": "verb",
  "phonetic": "/${word}/",
  "definitions": [
    {
      "sense": "Primary use",
      "meaning": "Detailed English definition of the word.",
      "example": "A clear, natural contextual example sentence using the word."
    }
  ],
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1"],
  "forms": {
    "base": "${word}",
    "past_simple": "...",
    "past_participle": "...",
    "present_participle": "...",
    "third_person": "..."
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    let rawText = response.text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    res.json({ success: true, analysis: rawText });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Error: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
