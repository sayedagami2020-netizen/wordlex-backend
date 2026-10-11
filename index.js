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

    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    
    // Prompt مختصر وسريع لضمان الاستجابة الفورية بدون Timeout
    const prompt = `Analyze "${word}". Return ONLY valid JSON (no markdown) with this format:
{
  "word": "${word}",
  "cefr_level": "B2",
  "part_of_speech": "verb",
  "phonetic": "/${word}/",
  "definitions": [{"sense": "Main", "meaning": "Definition here", "example": "Example here."}],
  "synonyms": ["syn1"],
  "antonyms": ["ant1"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    let rawText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    res.json({ success: true, analysis: rawText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "AI Error: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
