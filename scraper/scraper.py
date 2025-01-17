import requests
from lxml import html
#from config import *


def get_kosik_data(config: dict, headers: dict) -> dict:
    try:
        response = requests.get(config["url"], headers=headers)
        data = response.json()
        # name = data["product"]["name"]
        price = data["product"]["price"]
        # quantity = data["product"]["productQuantity"]["value"]
        if price:
            config["price"] = price
        else:
            print(f"KOSIK: Price not found for {config['url']}")
        # print(f"KOSIK: Name:{name}, price:{price}, quantity:{quantity}")
    except Exception as e:
        print(f"Error in get_kosik_data for {config['url']}: {e}")
    return config

def get_billa_data(config: dict, headers: dict) -> dict:
    try:
        response = requests.get(config["url"], headers=headers)
        tree = html.fromstring(response.content)
        # name = tree.xpath('//h1[@class="ws-product-slug-main__title text-base-color h2 ml-md-2"]/text()')
        price = tree.xpath('//div[contains(@class, "product-slug-main")]//div[contains(@class, "product-price-type__value")]/text()')
        price = price[0].replace('Kč', '').replace(',', '.').replace('\xa0', '').strip()
        price = float(price)
        if price:
            config["price"] = price
        else:
            print(f"BILLA: Price not found for {config['url']}")
        # print(f"BILLA: Name: {name}, Price: {price}")
    except Exception as e:
        print(f"Error in get_billa_data for {config['url']}: {e}")
    return config

def get_albert_data(config: dict, headers: dict) -> dict:
    try:
        response = requests.get(config["url"], headers=headers)
        data = response.json()
        # name = data["data"]["productDetails"]["description"]
        price = data["data"]["productDetails"]["price"]["value"]
        # quantity = data["data"]["productDetails"]["price"]["supplementaryPriceLabel2"]
        if price:
            config["price"] = price
        else:
            print(f"GLOBUS: Price not found for {config['url']}")
        # print(f"ALBERT: Name:{name}, price:{price}, quantity:{quantity}")
    except Exception as e:
        print(f"Error in get_albert_data for {config['url']}: {e}")
    return config
    

def get_globus_data(config: dict, headers: dict) -> dict:
    try:
        response = requests.get(config["url"], headers=headers)
        tree = html.fromstring(response.content)
        # name = tree.xpath('//h1[@class="font-secondary text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600 mb-2 sm:mb-4"]/text()')
        price = tree.xpath('//div[@class="max-md:mx-auto max-md:relative"]//span[contains(@class,"group-price")]/text()')
        price = price[0].replace('Kč', '').replace(',', '.').replace('\xa0', '').strip()
        price = float(price) + (0.90 if '.' not in price else 0.0)
        if price:
            config["price"] = price
        else:
            print(f"GLOBUS: Price not found for {config['url']}")
        # print(f"GLOBUS: Name: {name}, Price: {price}")
    except Exception as e:
        print(f"Error in get_globus_data for {config['url']}: {e}")
    return config

# Funkce pro scraping
def scrape_data(configs: list) -> list:
    headers: dict = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
    
    shop_functions: list = {
        "KOSIK": get_kosik_data,
        "BILLA": get_billa_data,
        "ALBERT": get_albert_data,
        "GLOBUS": get_globus_data,
    }

    for config in configs:
        shop = config.get('shop')
        if shop in shop_functions:
            shop_functions[shop](config, headers)
        else:
            print(f"Unsupported shop: {shop}")
    return configs

            
# if __name__=="__main__":
#     #get_kosik_data(KOSIK_ENDPOINT)
#     #get_tesco_data(TESCO_ENDPOINT)
#     #get_albert_data(ALBERT_ENDPOINT)
#     result = scrape_data(CONFIGS)
#     for item in result:
#         print(item)
