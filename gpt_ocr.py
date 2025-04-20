import os
import base64
import argparse
from dotenv import load_dotenv
from openai import OpenAI

def encode_image(image_path):
    """Encode an image to base64 for API transmission"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def extract_text_from_image(image_path, output_file=None):
    """Extract text from an image using OpenAI's GPT-4 Vision API"""
    # Load API key from .env file
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        raise ValueError("OpenAI API key not found. Please check your .env file.")
    
    # Create OpenAI client
    client = OpenAI(api_key=api_key)
    
    # Encode the image
    base64_image = encode_image(image_path)
    
    # Make the API request
    response = client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "OCR this image and extract the text."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=1024
    )
    
    # Extract the text from the response
    extracted_text = response.choices[0].message.content
    
    # Save to a file if specified
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(extracted_text)
        print(f"Extracted text saved to {output_file}")
    
    return extracted_text

def main():
    parser = argparse.ArgumentParser(description='Extract text from images using OpenAI GPT-4 Vision API')
    parser.add_argument('image_path', help='Path to the image file')
    parser.add_argument('--output', '-o', default=None, help='Path to save the extracted text (default: image_name.txt)')
    
    args = parser.parse_args()
    
    # If no output file specified, use the image name with .txt extension
    output_file = args.output
    if not output_file:
        base_name = os.path.splitext(os.path.basename(args.image_path))[0]
        output_file = f"{base_name}.txt"
    
    # Extract text and print the result
    extracted_text = extract_text_from_image(args.image_path, output_file)
    print("\nExtracted Text:\n")
    print(extracted_text)

if __name__ == "__main__":
    main() 