import os
import base64
import json

def update_logos_js():
    logos_dir = "school_logos"
    js_file = "logos.js"
    json_file = os.path.join(logos_dir, "logos_base64.json")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        logos = json.load(f)
        
    for filename in os.listdir(logos_dir):
        if filename.endswith("_logo.png"):
            name = filename.replace("_logo.png", "")
            with open(os.path.join(logos_dir, filename), "rb") as img_file:
                b64_string = base64.b64encode(img_file.read()).decode('utf-8')
                logos[name] = f"data:image/png;base64,{b64_string}"
                
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(logos, f, indent=4)
        
    js_content = f"const LOGO_DATA = {json.dumps(logos)};\n"
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("Updated logos.js and logos_base64.json")

if __name__ == "__main__":
    update_logos_js()
