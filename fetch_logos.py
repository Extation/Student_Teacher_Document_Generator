import os
import urllib.request
import urllib.parse
import urllib.error
import ssl

def fetch_assets(output_dir):
    # Verified filenames from Wikipedia API search
    targets = {
        "UP":       "University_of_the_Philippines_seal.svg",
        "Ateneo":   "Ateneo_de_Manila_University_seal.svg",
        "DLSU":     "De_La_Salle_University_Seal.svg",
        "UST":      "Seal_of_the_University_of_Santo_Tomas.svg",
        "Adamson":  "Adamson_university_marker.jpg",
        "Mapua":    "Mapua_Uni_logo.svg",
        "PUP":      "PUP.png",
        "Silliman": "Silliman_university_logo.png",
        "MSU":      "Seal_of_the_Mindanao_State_University.png",
        "PSHS":     "Philippine_Science_High_School_System_(PSHS)_-_Pisay.svg",
        "AteneoSHS":"Ateneo_de_Manila_University_seal.svg",
        "UPIS":     "University_of_the_Philippines_seal.svg",
        "ISM":      "Official_ISM_Logo.png",
        "MaSci":    "Manila_Science_High_School_Logo.svg",
        "DLSUSHS":  "De_La_Salle_University_Seal.svg",
        "Xavier":   "Xavier_School_Logo.svg",
        "USTSHS":   "Seal_of_the_University_of_Santo_Tomas.svg",
        "QueSci":   "Quezon_City_Science_High_School_logo.png",
        "BSM":      "British_School_Manila_logo.png"
    }

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created: {output_dir}")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    for name, filename in targets.items():
        encoded_file = urllib.parse.quote(filename)
        # ?width=300 forces PNG thumbnail output (even for SVGs)
        url = f"https://en.wikipedia.org/wiki/Special:FilePath/{encoded_file}?width=300"
        save_path = os.path.join(output_dir, f"{name}_logo.png")
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
                content = response.read()
                with open(save_path, 'wb') as f:
                    f.write(content)
                print(f"OK: {name}_logo.png ({len(content)} bytes)")
        except Exception as e:
            print(f"FAIL: {name} - {e}")

if __name__ == "__main__":
    fetch_assets("./school_logos")
