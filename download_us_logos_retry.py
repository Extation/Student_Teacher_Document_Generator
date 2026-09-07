"""
Retry downloading logos that failed in the first pass.
Uses alternative Wikipedia page titles and direct Wikimedia Commons file lookups.
"""
import urllib.request
import urllib.parse
import json
import os
import time
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

OUTPUT_DIR = "school_logos"
HEADERS = {
    "User-Agent": "StudentTeacherDocGen/1.0 (Educational tool; contact: dev@example.com)"
}

# Direct Wikimedia Commons file names for schools that failed pageimages lookup
DIRECT_FILES = {
    "Caltech":  "Seal_of_the_California_Institute_of_Technology.svg",
    "JHU":      "Johns_Hopkins_University_seal.svg",
    "GaTech":   "Georgia_Tech_seal.svg",
    "CMU":      "Carnegie_Mellon_University_seal.svg",
    "UWash":    "University_of_Washington_seal.svg",
    "UFL":      "Seal_of_the_University_of_Florida.svg",
    "UPitt":    "University_of_Pittsburgh_seal.svg",
    "OSU":      "Ohio_State_University_seal.svg",
    "Purdue":   "Purdue_University_seal.svg",
    "URoch":    "University_of_Rochester_seal.svg",
    "UAZ":      "Arizona_Wildcats_logo.svg",
    "UConn":    "Connecticut_Huskies_logo.svg",
    "UIC":      "University_of_Illinois_at_Chicago_circle_logo.svg",
    "TAMU":     "Texas_A%26M_University_seal.svg",
    "IUB":      "Indiana_University_seal.svg",
    "MSU_US":   "Michigan_State_University_wordmark.svg",
    "ISM":      "International_School_Manila_Logo.png",
    "Xavier":   "Xavier_School_Logo.png",
}

# Alternative Wikipedia page titles to try
ALT_PAGES = {
    "Caltech":  ["Caltech", "California_Institute_of_Technology"],
    "JHU":      ["Johns_Hopkins_University"],
    "GaTech":   ["Georgia_Tech", "Georgia_Tech_Yellow_Jackets"],
    "CMU":      ["Carnegie_Mellon_University", "Carnegie_Mellon"],
    "UWash":    ["University_of_Washington", "Washington_Huskies"],
    "UFL":      ["Florida_Gators", "University_of_Florida"],
    "UPitt":    ["Pitt_Panthers", "University_of_Pittsburgh"],
    "OSU":      ["Ohio_State_Buckeyes", "The_Ohio_State_University"],
    "Purdue":   ["Purdue_Boilermakers", "Purdue_University"],
    "URoch":    ["University_of_Rochester"],
    "UAZ":      ["Arizona_Wildcats", "University_of_Arizona"],
    "UConn":    ["UConn_Huskies", "University_of_Connecticut"],
    "UIC":      ["University_of_Illinois_at_Chicago"],
    "TAMU":     ["Texas_A%26M_Aggies", "Texas_A%26M"],
    "IUB":      ["Indiana_Hoosiers", "Indiana_University"],
    "MSU_US":   ["Michigan_State_Spartans", "Michigan_State_University"],
    "ISM":      ["International_School_Manila"],
    "Xavier":   ["Xavier_School_(San_Juan)"],
}


def get_commons_thumb_url(filename, width=300):
    """Get thumbnail URL for a Wikimedia Commons file."""
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
        print(f"    Commons API error: {e}")
    return None


def get_wiki_image_url(page_title, thumb_size=300):
    """Query Wikipedia API for the page's main image thumbnail URL."""
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": page_title,
        "prop": "pageimages",
        "format": "json",
        "pithumbsize": thumb_size,
        "piprop": "thumbnail|name",
    })
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for pid, pdata in pages.items():
            if "thumbnail" in pdata:
                return pdata["thumbnail"]["source"]
    except Exception as e:
        print(f"    API error: {e}")
    return None


def download_image(url, filepath):
    """Download an image from url and save to filepath."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            content = resp.read()
            if len(content) < 500:
                print(f"    File too small ({len(content)} bytes), likely error page")
                return False
            with open(filepath, "wb") as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"    Download error: {e}")
        return False


def main():
    success = 0
    still_failed = []

    for key in DIRECT_FILES:
        out_path = os.path.join(OUTPUT_DIR, f"{key}_logo.png")

        # Skip if already exists and valid
        if os.path.exists(out_path) and os.path.getsize(out_path) > 2000:
            print(f"{key}: Already exists, skipping")
            success += 1
            continue

        print(f"\n{key}: Trying direct Commons file lookup...")

        # Strategy 1: Direct Wikimedia Commons file
        filename = DIRECT_FILES[key]
        thumb_url = get_commons_thumb_url(filename)
        if thumb_url:
            print(f"  Found Commons URL: {thumb_url[:80]}...")
            if download_image(thumb_url, out_path):
                sz = os.path.getsize(out_path)
                print(f"  OK Saved ({sz:,} bytes)")
                success += 1
                time.sleep(0.3)
                continue

        # Strategy 2: Try alternative Wikipedia pages
        print(f"  Trying alternative page titles...")
        found = False
        for alt_title in ALT_PAGES.get(key, []):
            img_url = get_wiki_image_url(alt_title)
            if img_url:
                print(f"  Found via '{alt_title}': {img_url[:80]}...")
                if download_image(img_url, out_path):
                    sz = os.path.getsize(out_path)
                    print(f"  OK Saved ({sz:,} bytes)")
                    success += 1
                    found = True
                    break
            time.sleep(0.3)

        if not found:
            print(f"  FAILED - no image found for {key}")
            still_failed.append(key)
        time.sleep(0.3)

    print(f"\n{'='*50}")
    print(f"Retry results: {success}/{len(DIRECT_FILES)} logos")
    if still_failed:
        print(f"Still failed: {', '.join(still_failed)}")
    print(f"\nNow run: python update_logos_js.py")


if __name__ == "__main__":
    main()
