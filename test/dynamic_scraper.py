from playwright.sync_api import sync_playwright

def fetch_dynamic_data():
    url = "https://nakup.itesco.cz/groceries/cs-CZ/products/2001018209377"

    with sync_playwright() as p:
        # Spusťte prohlížeč
        browser = p.chromium.launch(
            headless=False,  # Změňte na True pro režim bez grafického okna
            args=[
                "--disable-blink-features=AutomationControlled",  # Skryje automatizaci
                "--start-maximized",  # Simuluje běžné okno
            ]
        )
        page = browser.new_page()

        # Napodobení hlaviček
        page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
        })
        # Otevřete URL
        page.goto(url)

        try:
            # XPath selektor
            xpath_selector = '//h1[@class="product-details-tile__title"]/text()'
            
            # Počkejte, až se prvek objeví
            page.wait_for_selector(f"xpath={xpath_selector}", timeout=5000)

            # Získejte prvek pomocí XPath
            element = page.locator(f"xpath={xpath_selector}")
            if element:
                price = element.inner_text()
                print(f"Price: {price}")
            else:
                print("Price element not found.")
        except Exception as e:
            print(f"Error fetching price: {e}")
        finally:
            # Zavřete prohlížeč
            browser.close()

fetch_dynamic_data()
