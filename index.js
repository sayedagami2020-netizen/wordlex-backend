const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// استدعاء المفتاح بأمان من إعدادات المنصة
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/analyzeWord", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: "الرجاء إرسال الكلمة المطلوبة" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`قم بتحليل كلمة "${word}" لعشاق تعلم اللغة الإنجليزية. أرجع النتيجة بصيغة JSON تحتوي على: المعنى بالعربي، عائلة الكلمة (Word Family)، التصريفات، و3 أمثلة توضيحية.`);
    const response = await result.response;

    res.json({ success: true, analysis: response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
