"""Download MIT logo using API to get actual download URL."""
import urllib.request
import urllib.parse
import json
import os
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

OUTPUT_DIR = "school_logos"
HEADERS = {
    "User-Agent": "StudentTeacherDocGen/1.0 (Educational tool; contact: dev@example.com)"
}

def get_image_via_api(filename, width=500):
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": f"File:{filename}",
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": width,
        "format": "json",
    })
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    pages = data.get("query", {}).get("pages", {})
    for pid, pdata in pages.items():
        if "imageinfo" in pdata:
            ii = pdata["imageinfo"][0]
            thumb = ii.get("thumburl")
            orig = ii.get("url")
            print(f"  Thumb URL: {thumb}")
            print(f"  Original URL: {orig}")
            return thumb, orig
    return None, None

def download(url, filepath):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        content = resp.read()
        print(f"  Downloaded {len(content)} bytes")
        with open(filepath, "wb") as f:
            f.write(content)
        return len(content) > 2000

# Try MIT Seal (larger, more detailed image than the text logo)
for fname in ["MIT_Seal.svg", "MIT_2023_red_logo.svg", "MIT_logo_2003-2023.svg"]:
    print(f"\nTrying {fname}...")
    try:
        thumb, orig = get_image_via_api(fname, 500)
        if thumb:
            out_path = os.path.join(OUTPUT_DIR, "MIT_logo.png")
            if os.path.exists(out_path):
                os.remove(out_path)
            if download(thumb, out_path):
                print(f"  Success! {os.path.getsize(out_path):,} bytes")
                break
            else:
                print("  Too small, trying next...")
    except Exception as e:
        print(f"  Error: {e}")
