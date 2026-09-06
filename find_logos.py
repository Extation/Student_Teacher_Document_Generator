import urllib.request, json, urllib.parse
pages = [
    'Philippine Science High School System',
    'Ateneo de Manila University',
    'University of the Philippines',
    'International School Manila',
    'Manila Science High School',
    'De La Salle University',
    'Xavier School',
    'University of Santo Tomas',
    'Quezon City Science High School',
    'British School Manila'
]
for p in pages:
    url = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + urllib.parse.quote(p) + '&prop=images&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            for page_id in data['query']['pages']:
                images = data['query']['pages'][page_id].get('images', [])
                print(f'{p}:')
                for img in images:
                    t = img['title'].lower()
                    if 'logo' in t or 'seal' in t or 'pisay' in t or 'emblem' in t or 'crest' in t or 'coat of arms' in t or 'marker' in t:
                        print(f"  {img['title']}")
    except Exception as e:
        print(f'{p}: error {e}')
