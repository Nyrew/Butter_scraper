import requests

url = "https://butter-scraper.onrender.com/scrape_save" # docker - render

try:
    response = requests.post(url)
    response.raise_for_status()  # Vyvolá chybu, pokud HTTP status není 200
    data = response.json()
    print("Response from Render endpoint:")
    print(data)
    for item in data:
        print(item)
except requests.exceptions.RequestException as e:
    print(f"Error connecting to endpoint: {e}")