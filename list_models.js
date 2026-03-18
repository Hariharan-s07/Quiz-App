const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function listModels() {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, 'utf8');
      const match = env.match(/GEMINI_API_KEY=(.+)/);
      if (match) apiKey = match[1].trim();
    }
  }

  if (!apiKey) {
    console.error("Please set GEMINI_API_KEY environment variable.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the standard model object method or generic fetch fallback
    console.log("Checking api list models request...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      const names = data.models.map(m => m.name).join('\n');
      fs.writeFileSync('models_list.txt', names);
      console.log("Written to models_list.txt");
    } else {
      console.log("Response Error:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();
