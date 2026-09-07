import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace PH school paths
content = re.sub(r"file: 'school_logos/(UP|Ateneo|DLSU|UST|Adamson|Mapua|PUP|Silliman|MSU|PSHS|AteneoSHS|UPIS|ISM|MaSci|DLSUSHS|Xavier|QueSci|BSM)_logo\.png'", r"file: 'school_logos/ph/\1_logo.png'", content)

# Replace US school paths
content = re.sub(r"file: 'school_logos/((?!ph/|us/).*?)_logo\.png'", r"file: 'school_logos/us/\1_logo.png'", content)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
