"""
Download US University logos from Wikipedia.
Uses the MediaWiki API to find each university's page image,
then downloads the thumbnail as a PNG file.
"""
import urllib.request
import urllib.parse
import json
import os
import time
import ssl

# Disable SSL verification for corporate proxies if needed
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

OUTPUT_DIR = "school_logos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Map of key -> Wikipedia page title for each university
US_UNIVERSITIES = {
    "MIT":       "Massachusetts Institute of Technology",
    "Harvard":   "Harvard University",
    "Stanford":  "Stanford University",
    "Yale":      "Yale University",
    "Princeton": "Princeton University",
    "Caltech":   "California Institute of Technology",
    "Columbia":  "Columbia University",
    "JHU":       "Johns Hopkins University",
    "UPenn":     "University of Pennsylvania",
    "NWU":       "Northwestern University",
    "UCB":       "University of California, Berkeley",
    "UCLA":      "University of California, Los Angeles",
    "UMich":     "University of Michigan",
    "UVA":       "University of Virginia",
    "GaTech":    "Georgia Institute of Technology",
    "UNC":       "University of North Carolina at Chapel Hill",
    "UCSD":      "University of California, San Diego",
    "UIUC":      "University of Illinois Urbana-Champaign",
    "UWMad":     "University of Wisconsin–Madison",
    "UTAustin":  "University of Texas at Austin",
    "Cornell":   "Cornell University",
    "USC":       "University of Southern California",
    "CMU":       "Carnegie Mellon University",
    "UWash":     "University of Washington",
    "NYU":       "New York University",
    "UFL":       "University of Florida",
    "BU":        "Boston University",
    "UCSB":      "University of California, Santa Barbara",
    "UCD":       "University of California, Davis",
    "UCI":       "University of California, Irvine",
    "UMN":       "University of Minnesota",
    "UPitt":     "University of Pittsburgh",
    "OSU":       "Ohio State University",
    "UMD":       "University of Maryland, College Park",
    "Purdue":    "Purdue University",
    "URoch":     "University of Rochester",
    "UMiami":    "University of Miami",
    "CUBoulder": "University of Colorado Boulder",
    "UAZ":       "University of Arizona",
    "NotreDame": "University of Notre Dame",
    "UConn":     "University of Connecticut",
    "UGA":       "University of Georgia",
    "UIC":       "University of Illinois Chicago",
    "TAMU":      "Texas A&M University",
    "UMass":     "University of Massachusetts Amherst",
    "IUB":       "Indiana University Bloomington",
    "UCSC":      "University of California, Santa Cruz",
    "UDel":      "University of Delaware",
    "UOregon":   "University of Oregon",
    "MSU_US":    "Michigan State University",
    "ISM":       "International School Manila",
    "QueSci":    "Quezon City Science High School",
    "BSM":       "British School Manila",
    "Xavier":    "Xavier School San Juan",
}

HEADERS = {
    "User-Agent": "StudentTeacherDocGen/1.0 (Educational tool; contact: dev@example.com)"
}

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
    except Exception as e:
        print(f"  API error for '{page_title}': {e}")
        return None, None
    
    pages = data.get("query", {}).get("pages", {})
    for page_id, page_data in pages.items():
        if "thumbnail" in page_data:
            return page_data["thumbnail"]["source"], page_data.get("pageimage", "")
    return None, None


def download_image(url, filepath):
    """Download an image from url and save to filepath."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            content = resp.read()
            with open(filepath, "wb") as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False


def main():
    success = 0
    failed = []
    
    total = len(US_UNIVERSITIES)
    for i, (key, title) in enumerate(US_UNIVERSITIES.items(), 1):
        out_path = os.path.join(OUTPUT_DIR, f"{key}_logo.png")
        
        # Skip if already downloaded
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            print(f"[{i}/{total}] {key}: Already exists, skipping")
            success += 1
            continue
        
        print(f"[{i}/{total}] {key}: Fetching from '{title}'...")
        
        thumb_url, image_name = get_wiki_image_url(title)
        
        if not thumb_url:
            print(f"  ✗ No image found for {title}")
            failed.append(key)
            time.sleep(0.5)
            continue
        
        # Try to get a larger version
        # Replace the thumb size in URL to get 300px version
        thumb_url_large = thumb_url
        for size in ["50px", "100px", "150px", "200px", "220px", "250px"]:
            thumb_url_large = thumb_url_large.replace(size, "300px")
        
        print(f"  Image: {image_name}")
        print(f"  URL: {thumb_url_large[:80]}...")
        
        if download_image(thumb_url_large, out_path):
            file_size = os.path.getsize(out_path)
            print(f"  ✓ Saved ({file_size:,} bytes)")
            success += 1
        else:
            # Fallback to original thumb URL
            if download_image(thumb_url, out_path):
                file_size = os.path.getsize(out_path)
                print(f"  ✓ Saved with fallback ({file_size:,} bytes)")
                success += 1
            else:
                print(f"  ✗ Failed to download")
                failed.append(key)
        
        time.sleep(0.3)  # Be polite to Wikipedia API
    
    print(f"\n{'='*50}")
    print(f"Results: {success}/{total} logos downloaded")
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(failed)}")
    print(f"\nNow run: python update_logos_js.py")


if __name__ == "__main__":
    main()
