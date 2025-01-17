# import requests
# headers = {
#     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36"
# }

# session = requests.Session()
# response = session.get("https://nakup.itesco.cz/groceries/cs-CZ/products/2001130613189", headers=headers)
# print(response.text)


from bs4 import BeautifulSoup
import json
import requests

# URL stránky
url = "https://nakup.itesco.cz/groceries/cs-CZ/products/2001130613189"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36"
}

# Stažení obsahu stránky
response = requests.get(url, headers=headers)
if response.status_code == 200:
    html_content = response.text

    # Parsování HTML pomocí BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')

    # Vyhledání všech <script> elementů s typem application/ld+json
    script_tags = soup.find_all('script', type='application/ld+json')

    # Zpracování a extrakce JSON dat
    for tag in script_tags:
        try:
            json_data = json.loads(tag.string)  # Parsování JSON obsahu
            print(json.dumps(json_data, indent=4, ensure_ascii=False))  # Naformátovaný výstup
        except json.JSONDecodeError:
            print("Chyba při parsování JSON dat.")
else:
    print(f"Chyba: {response.status_code}")
