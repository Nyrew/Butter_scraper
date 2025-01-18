from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import get_db
from database.model import Product_info
from database.crud import save_scraped_data, get_all_data, get_latest_data
from scraper.config import CONFIGS, PRODUCT_INFO
from scraper.scraper import scrape_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nyrew.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)

db = next(get_db())

@app.get("/get_all_data")
def get_all():
    all_data = get_all_data(db)
    for item in all_data:
        
        print((f"ALL: ID: {item.product_id}, Name: {item.shop}, Price: {item.price}, Date: {item.date}"))
    return all_data

@app.get("/get_latest_data")
def get_latest():
    data = get_latest_data(db)
    for item in data:
        print(f"LATEST: Name: {item['product_name']}, Shop: {item['shop']}, Price: {item['price']}, Quantity: {item['quantity']}")
    return data

@app.get("/get_product_info")
def get_product_info():
    data = db.query(Product_info).all()
    for item in data:
        print(f"ID: {item.id}, Name: {item.name}, Quantity: {item.quantity}")

@app.post("/scrape")
def scrape():
    try:
        scraped_data = scrape_data(CONFIGS)
        for item in scraped_data:
            print(item)
    except Exception as e:
        print(f"Trying to scrape data and got this error: {e}")
        
    return scraped_data

@app.post("/scrape_save")
def scrape_and_save():
    try:
        scraped_data = scrape_data(CONFIGS)
        print("Scrape successful!!")
        
        saved_data = []
        for item in scraped_data:
            product_info = next((prod for prod in PRODUCT_INFO if prod["id"] == item['product_id']), None)
            saved_data.append({
            "shop": item['shop'],
            "product_name": product_info["name"] if product_info else None,  # Napáruj name
            "price": item['price'],
            "quantity": product_info['quantity'] if product_info else None
        })
            
        save_scraped_data(db, scraped_data)
        
    except Exception as e:
        print(f"Trying to scrape and save data and got this error: {e}")
    
    return saved_data





