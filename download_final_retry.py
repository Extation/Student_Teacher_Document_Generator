"""Final retry for the last 4 missing logos."""
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

# Try multiple Commons filenames for each
ATTEMPTS = {
    "JHU": [
        "Seal_of_Johns_Hopkins_University.svg",
        "Johns_Hopkins_University_logo.svg",
        "JHU_seal.svg",
        "JHU_Logo.png",
    ],
    "TAMU": [
        "Texas_A&M_University_seal.svg",
        "TAM-Logo.svg",
        "Texas_A&M_Aggies_logo.svg",
        "TexasAM-logo.svg",
    ],
    "ISM": [
        "International_School_Manila_logo.png",
        "ISManila_logo.png",
    ],
    "Xavier": [
        "Xavier_School_logo.png",
        "Xavier_School_San_Juan_logo.png",
    ],
}

def get_commons_thumb_url(filename, width=300):
    encoded = urllib.parse.quote(filename, safe='')
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
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for pid, pdata in pages.items():
            if "imageinfo" in pdata:
                ii = pdata["imageinfo"][0]
                return ii.get("thumburl") or ii.get("url")
    except Exception as e:
        print(f"    Error: {e}")
    return None

def download_image(url, filepath):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            content = resp.read()
            if len(content) < 500:
                return False
            with open(filepath, "wb") as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"    Download error: {e}")
        return False

def main():
    for key, filenames in ATTEMPTS.items():
        out_path = os.path.join(OUTPUT_DIR, f"{key}_logo.png")
        if os.path.exists(out_path) and os.path.getsize(out_path) > 2000:
            print(f"{key}: Already exists")
            continue

        print(f"\n{key}: Trying {len(filenames)} filenames...")
        found = False
        for fn in filenames:
            print(f"  Trying: {fn}")
            url = get_commons_thumb_url(fn)
            if url:
                print(f"  Got URL: {url[:80]}...")
                if download_image(url, out_path):
                    sz = os.path.getsize(out_path)
                    print(f"  OK! Saved ({sz:,} bytes)")
                    found = True
                    break
        if not found:
            print(f"  All attempts failed for {key}")

if __name__ == "__main__":
    main()
