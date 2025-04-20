require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.static(path.join(__dirname, '../public')));

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API endpoint for OCR
app.post('/api/extract-text', async (req, res) => {
  try {
    // Get image data and options from request
    const { image, extractBiometry } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Starting OpenAI API call...', extractBiometry ? 'with biometry extraction' : 'standard OCR');
    
    // Create the base prompt
    let promptText = "OCR this image and extract all the text content. Preserve the original formatting as much as possible, including paragraphs, bullet points, tables, indentation, and line breaks. If there are multiple columns, maintain the reading order.";
    
    // Add biometry extraction instructions if requested
    if (extractBiometry) {
      promptText += " Additionally, look for and extract biometry data for both eyes (OD = right eye, OS = left eye). For each eye, identify and list the following measurements if present: AL (Axial Length), K1 (Keratometry 1), K2 (Keratometry 2), ACD (Anterior Chamber Depth), LT (Lens Thickness), and CCT (Central Corneal Thickness). Organize these values in a clear table at the end of the text.";
    } else {
      promptText += " Do not add any explanations, just return the formatted text exactly as it appears in the image.";
    }
    
    // Make OpenAI API request with GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1500
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
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open your browser to http://localhost:${port} to use the app`);
  });
}

// Export the Express API for Vercel
module.exports = app; 