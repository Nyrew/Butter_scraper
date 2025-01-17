import requests

def get_albert_data():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    }
    url = "https://www.albert.cz/api/v1/?operationName=ProductDetails&variables=%7B%22productCode%22%3A%2226247038%22%2C%22lang%22%3A%22cs%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22a149b8459b9e8558a7f03682a39b5d7579fec291cb8bb95f837335f01a055997%22%7D%7D"
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response Text (first 500 chars): {response.text[:500]}")  # Show the first 500 characters

    if response.status_code == 200:
        try:
            data = response.json()
            print("Data successfully retrieved:")
            print(data["data"]["productDetails"]["description"])
        except requests.exceptions.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            print("Raw Response Text:")
            print(response.text)
    else:
        print(f"Unexpected status code: {response.status_code}")
        
if __name__=="__main__":
    get_albert_data()