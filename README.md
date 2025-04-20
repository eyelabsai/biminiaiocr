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

## Usage

1. Upload an image by dragging and dropping or using the browse button
2. Click "Extract Text" to process the image using Bimini AI
3. View the extracted text and use the copy or download buttons to save the result

## Notes

- This application uses advanced AI which has excellent image understanding capabilities.
- Large images may take longer to process. Consider resizing very large images for faster results.
- The tool supports various image formats (jpg, png, etc.).
- This is a proof-of-concept application designed for local use. 