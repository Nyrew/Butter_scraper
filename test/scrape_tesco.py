def get_tesco_data(urls: list):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        #"Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
        #"Accept-Encoding": "gzip, deflate, br, zstd",
    }

    for url in urls:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            tree = html.fromstring(response.content)
            try:
                # Use XPath to extract the data
                name = tree.xpath('//h1[@class="ws-product-slug-main__title base-color--text h2 ml-md-2"]/text()')#'//h1[@class="product-details-tile__title"]/text()')
                print("got name")
                price = tree.xpath('//div[@class="ws-product-price-type__value regular-price--text h3"]/text()')
                # Clean and print the data
                #name = name[0].strip() if name else "N/A"
                #price = price[0].strip() if price else "N/A"
                print(f"Name: {name}, Price: {price}")
                
            except IndexError:
                print(f"Error parsing data for URL: {url}")
        else:
            print(f"Error loading page: {url}, Status code: {response.status_code}")