import sys
import os
from PIL import Image, ImageDraw, ImageFont

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
        
        # Create an overlay layer for transparency
        overlay = Image.new("RGBA", target_size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Try loading Arial font, otherwise fallback to default
        try:
            # Arial is usually available on Windows
            font_title = ImageFont.truetype("arial.ttf", 26)
            font_banner = ImageFont.truetype("arialbd.ttf", 24)
            font_logo = ImageFont.truetype("arialbd.ttf", 18)
        except Exception:
            font_title = ImageFont.load_default()
            font_banner = ImageFont.load_default()
            font_logo = ImageFont.load_default()
            
        # 2. Draw Logo at Top-Right
        # Let's draw a nice rounded rectangle pill for the logo
        logo_width, logo_height = 200, 50
        logo_x = 800 - logo_width - 25
        logo_y = 25
        
        # Draw pill shadow/border
        draw.rounded_rectangle(
            [logo_x, logo_y, logo_x + logo_width, logo_y + logo_height],
            radius=12,
            fill=(15, 118, 110, 230),  # Teal color (brand) with some transparency
            outline=(255, 255, 255, 255),
            width=2
        )
        
        # Add logo text
        logo_text = "GAYATRI PHARMA"
        # Center logo text
        try:
            text_bbox = draw.textbbox((0, 0), logo_text, font=font_logo)
            text_w = text_bbox[2] - text_bbox[0]
            text_h = text_bbox[3] - text_bbox[1]
        except AttributeError:
            # Fallback for older Pillow versions
            text_w, text_h = draw.textsize(logo_text, font=font_logo) if hasattr(draw, 'textsize') else (140, 20)
            
        text_x = logo_x + (logo_width - text_w) // 2
        text_y = logo_y + (logo_height - text_h) // 2 - 2
        draw.text((text_x, text_y), logo_text, fill=(255, 255, 255, 255), font=font_logo)
        
        # 3. Draw Semi-transparent Text Banner at the Bottom
        banner_height = 90
        banner_y = 800 - banner_height
        
        # Draw bottom banner background (dark slate with 80% opacity)
        draw.rectangle(
            [0, banner_y, 800, 800],
            fill=(15, 23, 42, 204) # RGBA: #0f172a with alpha 204
        )
        
        # Draw a thin teal divider line above the banner
        draw.line([0, banner_y, 800, banner_y], fill=(20, 184, 166, 255), width=3)
        
        # Compose text: "Medicine Name | MRP: ₹[X] | B2B Price: ₹[Y]"
        # To make it extra premium, let's display the Medicine Name and prices clearly
        text_banner = f"{medicine_name.upper()}  |  MRP: \u20B9{mrp}  |  B2B Price: \u20B9{b2b_price}"
        
        # Center the banner text
        try:
            banner_bbox = draw.textbbox((0, 0), text_banner, font=font_banner)
            banner_w = banner_bbox[2] - banner_bbox[0]
            banner_h = banner_bbox[3] - banner_bbox[1]
        except AttributeError:
            banner_w, banner_h = draw.textsize(text_banner, font=font_banner) if hasattr(draw, 'textsize') else (600, 30)
            
        bx = (800 - banner_w) // 2
        by = banner_y + (banner_height - banner_h) // 2 - 4
        
        # Draw text shadow for better contrast
        draw.text((bx + 1, by + 1), text_banner, fill=(0, 0, 0, 200), font=font_banner)
        draw.text((bx, by), text_banner, fill=(255, 255, 255, 255), font=font_banner)
        
        # Composite the image and overlay
        final_img = Image.alpha_composite(img, overlay)
        final_img = final_img.convert("RGB") # Convert back to RGB for JPEG/PNG saving
        
        # Save output
        final_img.save(output_path, "JPEG", quality=90)
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
