import sys
import os
from PIL import Image

def process_image(image_path, output_path, medicine_name, mrp, b2b_price):
    try:
        # Load the image
        if not os.path.exists(image_path):
            print(f"Error: Input image path does not exist: {image_path}", file=sys.stderr)
            sys.exit(1)
            
        img = Image.open(image_path)
        img = img.convert("RGBA")
        
        # 1. Resize image to standard 800x800 size
        target_size = (800, 800)
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        # Keep the resized image clean (no logo/text overlay)
        final_img = img.convert("RGB") # Convert back to RGB for JPEG/PNG saving
        
        # Save output
        final_img.save(output_path, "JPEG", quality=95)
        print(output_path)  # Print to stdout so Node.js can read the path
        return True
    except Exception as e:
        print(f"Error processing image: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python image_processor.py <image_path> <output_path> <medicine_name> <mrp> <b2b_price>", file=sys.stderr)
        sys.exit(1)
        
    image_path = sys.argv[1]
    output_path = sys.argv[2]
    medicine_name = sys.argv[3]
    mrp = sys.argv[4]
    b2b_price = sys.argv[5]
    
    process_image(image_path, output_path, medicine_name, mrp, b2b_price)
