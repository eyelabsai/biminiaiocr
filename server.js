require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.static('public'));

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API endpoint for OCR
app.post('/api/extract-text', async (req, res) => {
  try {
    // Get image data from request
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Starting OpenAI API call...');
    
    // Make OpenAI API request with GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "OCR this image and extract all the text content. Return only the text without additional explanation." },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1024
    });

    console.log('OpenAI API call completed successfully');

    // Extract the response text
    const extractedText = response.choices[0].message.content;

    // Return the result
    res.json({ text: extractedText });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: `Error processing image: ${error.message}` });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Open your browser to http://localhost:${port} to use the app`);
}); 