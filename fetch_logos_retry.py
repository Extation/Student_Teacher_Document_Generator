import os
import urllib.request
import urllib.parse
import urllib.error
import ssl
import time

def fetch_assets(output_dir):
    targets = {
        "UST":      "Seal_of_the_University_of_Santo_Tomas.svg",
        "Adamson":  "Adamson_university_marker.jpg",
        "Mapua":    "Mapua_Uni_logo.svg",
        "PSHS":     "Philippine_Science_High_School_System_(PSHS)_-_Pisay.svg",
        "ISM":      "Official_ISM_Logo.png",
        "Xavier":   "Xavier_School_Logo.svg",
        "USTSHS":   "Seal_of_the_University_of_Santo_Tomas.svg",
        "BSM":      "British_School_Manila_logo.png"
    }

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        'User-Agent': 'CoolBot/1.0 (contact@example.com)'
    }

    for name, filename in targets.items():
        encoded_file = urllib.parse.quote(filename)
        url = f"https://en.wikipedia.org/wiki/Special:FilePath/{encoded_file}?width=300"
        save_path = os.path.join(output_dir, f"{name}_logo.png")
        
        success = False
        for attempt in range(3):
            try:
                time.sleep(2)
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
                    content = response.read()
                    with open(save_path, 'wb') as f:
                        f.write(content)
                    print(f"OK: {name}_logo.png ({len(content)} bytes)")
                    success = True
                    break
            except Exception as e:
                print(f"FAIL: {name} (Attempt {attempt+1}) - {e}")
        if not success:
            print(f"FAILED permanently: {name}")

if __name__ == "__main__":
    fetch_assets("./school_logos")
