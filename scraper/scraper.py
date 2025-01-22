import requests
from lxml import html
#from config import *


def get_kosik_data(config: dict, headers: dict) -> dict:
    """
    Fetch product data from KOSIK API.

    Args:
        config (dict): Configuration for the specific product.
        headers (dict): HTTP headers for the request.

    Returns:
        dict: Updated configuration with the price.
    """
    try:
        response = requests.get(config["url"], headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        # name = data["product"]["name"]
        price = data["product"]["price"]
        # quantity = data["product"]["productQuantity"]["value"]
        if price:
            config["price"] = price
        else:
            print(f"KOSIK: Price not found for {config['url']}")
    except Exception as e:
        print(f"Error in get_kosik_data for {config['url']}: {e}")
    return config


def get_billa_data(config: dict, headers: dict) -> dict:
    """
    Fetch product data from BILLA.

    Args:
        config (dict): Configuration for the specific product.
        headers (dict): HTTP headers for the request.

    Returns:
        dict: Updated configuration with the price.
    """
    try:
        response = requests.get(config["url"], headers=headers)
        response.raise_for_status()
        tree = html.fromstring(response.content)
        # name = tree.xpath('//h1[@class="ws-product-slug-main__title text-base-color h2 ml-md-2"]/text()')
        price = tree.xpath('//div[contains(@class, "product-slug-main")]//div[contains(@class, "product-price-type__value")]/text()')
        if price:
            config["price"] = float(price[0].replace('Kč', '').replace(',', '.').replace('\xa0', '').strip())
        else:
            print(f"BILLA: Price not found for {config['url']}")
    except Exception as e:
        print(f"Error in get_billa_data for {config['url']}: {e}")
    return config

def get_albert_data(config: dict, headers: dict) -> dict:
    """
    Fetch product data from ALBERT API.

    Args:
        config (dict): Configuration for the specific product.
        headers (dict): HTTP headers for the request.

    Returns:
        dict: Updated configuration with the price.
    """
    try:
        response = requests.get(config["url"], headers=headers)
        response.raise_for_status()
        data = response.json()
        # name = data["data"]["productDetails"]["description"]
        price_data = data.get("data", {}).get("productDetails", {}).get("price", {})
        discounted_price = price_data.get("discountedPriceFormatted")
        price = float(price_data.get("value", 0)) if not discounted_price else float(discounted_price.replace('Kč', '').replace(',', '.').strip())

        if price:
            config["price"] = price
        else:
            print(f"ALBERT: Price not found for {config['url']}")
    except Exception as e:
        print(f"Error in get_albert_data for {config['url']}: {e}")
    return config
    

def get_globus_data(config: dict, headers: dict) -> dict:
    """
    Fetch product data from GLOBUS.

    Args:
        config (dict): Configuration for the specific product.
        headers (dict): HTTP headers for the request.

    Returns:
        dict: Updated configuration with the price.
    """
    try:
        response = requests.get(config["url"], headers=headers)
        response.raise_for_status()
        tree = html.fromstring(response.content)
        # name = tree.xpath('//h1[@class="font-secondary text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600 mb-2 sm:mb-4"]/text()')
        price = tree.xpath('//div[@class="max-md:mx-auto max-md:relative"]//span[contains(@class,"group-price")]/text()')
        if price:
            price_value = price[0].replace('Kč', '').replace(',', '.').replace('\xa0', '').strip()
            price_value = float(price_value) + (0.90 if '.' not in price_value else 0.0)
            config["price"] = price_value
        else:
            print(f"GLOBUS: Price not found for {config['url']}")
    except Exception as e:
        print(f"Error in get_globus_data for {config['url']}: {e}")
    return config

def scrape_data(configs: list[dict]) -> list[dict]:
    """
    Scrape data for all configured shops.

    Args:
        configs (list[dict]): List of configurations for each product.

    Returns:
        list[dict]: List of updated configurations with scraped prices.
    """
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