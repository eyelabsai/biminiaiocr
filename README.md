# Bimini AI OCR

A web application that uses Bimini AI to extract text from images (OCR).

## Setup

1. Clone this repository

2. Install the required dependencies:
   ```
   npm install
   ```

3. Set up your OpenAI API key in the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual OpenAI API key.

4. Start the local server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deploying to Vercel

1. Fork or clone this repository to your GitHub account

2. Sign up for a [Vercel account](https://vercel.com/signup) if you don't have one

3. Create a new project on Vercel:
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Other
     - Root Directory: ./
     - Build Command: npm run vercel-build
     - Output Directory: public
   - Add Environment Variable:
     - Name: OPENAI_API_KEY
     - Value: your_openai_api_key_here

4. Click "Deploy"

5. Your application will be deployed and available at the URL provided by Vercel

## Usage

1. Upload an image by dragging and dropping or using the browse button
2. Paste a screenshot directly into the app using Ctrl+V / Cmd+V
3. Click "Extract Text" to process the image using Bimini AI
4. View the extracted text and use the copy or download buttons to save the result

## Notes

- This application uses advanced AI which has excellent image understanding capabilities.
- Large images may take longer to process. Consider resizing very large images for faster results.
- The tool supports various image formats (jpg, png, etc.).
- Text formatting from the original image is preserved in the output. 