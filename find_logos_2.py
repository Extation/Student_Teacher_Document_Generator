import urllib.request, json, urllib.parse
pages = [
    'Quezon City Science High School',
    'University of the Philippines Integrated School'
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
                    print(f"  {img['title']}")
    except Exception as e:
        print(f'{p}: error {e}')
