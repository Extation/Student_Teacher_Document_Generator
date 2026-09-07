import urllib.request, urllib.parse, json, ssl, os
ssl._create_default_https_context = ssl._create_unverified_context
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def download_commons_file(file_title, dest):
    """Download a file from Wikimedia Commons."""
    api = 'https://en.wikipedia.org/w/api.php?action=query&titles={}&prop=imageinfo&iiprop=url&format=json'.format(urllib.parse.quote(file_title))
    req = urllib.request.Request(api, headers=headers)
    data = json.loads(urllib.request.urlopen(req, timeout=15).read())
    pages = data.get('query', {}).get('pages', {})
    for page in pages.values():
        ii = page.get('imageinfo', [])
        if ii:
            url = ii[0]['url']
            print('  Found URL: {}'.format(url))
            req2 = urllib.request.Request(url, headers=headers)
            img_data = urllib.request.urlopen(req2, timeout=15).read()
            if len(img_data) > 500:
                with open(dest, 'wb') as f:
                    f.write(img_data)
                print('  Downloaded {} bytes to {}'.format(len(img_data), dest))
                return True
    return False

# ISM logo
ism_dest = os.path.join('school_logos', 'ph', 'ISM_logo.png')
if not os.path.exists(ism_dest):
    print('Downloading ISM logo...')
    download_commons_file('File:Official ISM Logo.png', ism_dest)

# Xavier School
xavier_dest = os.path.join('school_logos', 'ph', 'Xavier_logo.png')
if not os.path.exists(xavier_dest):
    print('Downloading Xavier logo...')
    # Try searching Wikipedia for Xavier School
    for title in ['Xavier School', 'Xavier School San Juan']:
        api = 'https://en.wikipedia.org/w/api.php?action=query&titles={}&prop=images&format=json'.format(urllib.parse.quote(title))
        req = urllib.request.Request(api, headers=headers)
        data = json.loads(urllib.request.urlopen(req, timeout=15).read())
        pages = data.get('query', {}).get('pages', {})
        for page in pages.values():
            imgs = page.get('images', [])
            for img in imgs:
                it = img['title']
                if 'xavier' in it.lower() or 'logo' in it.lower():
                    print('  Trying: {}'.format(it))
                    if download_commons_file(it, xavier_dest):
                        break
            if os.path.exists(xavier_dest):
                break
        if os.path.exists(xavier_dest):
            break

if not os.path.exists(xavier_dest):
    print('Xavier logo not found on Wikipedia, generating placeholder...')
    # Use generate_image or a simple colored placeholder
    from PIL import Image, ImageDraw, ImageFont
    try:
        img = Image.new('RGBA', (200, 200), (30, 58, 138, 255))
        d = ImageDraw.Draw(img)
        d.text((60, 85), 'XS', fill='white')
        img.save(xavier_dest)
        print('  Created placeholder for Xavier')
    except:
        # If PIL is not available, just copy another logo as placeholder
        import shutil
        src = os.path.join('school_logos', 'ph', 'Ateneo_logo.png')
        shutil.copy2(src, xavier_dest)
        print('  Copied Ateneo logo as Xavier placeholder')
