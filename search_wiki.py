import urllib.request, urllib.parse, json, ssl, os
ssl._create_default_https_context = ssl._create_unverified_context
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

for title in ['International School Manila', 'Xavier School San Juan', 'Xavier School (San Juan, Metro Manila)']:
    api = 'https://en.wikipedia.org/w/api.php?action=query&titles={}&prop=pageimages|images&format=json&pithumbsize=300'.format(urllib.parse.quote(title))
    req = urllib.request.Request(api, headers=headers)
    data = json.loads(urllib.request.urlopen(req, timeout=15).read())
    pages = data.get('query', {}).get('pages', {})
    for pid, page in pages.items():
        t = page.get('title', 'N/A')
        thumb = page.get('thumbnail', {}).get('source', 'NONE')
        print('{} -> pageid={}, title={}, thumb={}'.format(title, pid, t, thumb))
        imgs = page.get('images', [])
        for img in imgs[:5]:
            print('  image: {}'.format(img['title']))
