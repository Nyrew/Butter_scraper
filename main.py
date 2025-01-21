from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database.database import get_db
from database.model import Product_info
from database.crud import (
    save_scraped_data, 
    get_all_data, 
    get_latest_data, 
    get_latest_scrape_date, 
    get_price_history
)
from scraper.config import CONFIGS, PRODUCT_INFO
from scraper.scraper import scrape_data
from typing import List, Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nyrew.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#db = next(get_db())

@app.get("/get_all_data")
def get_all(db: Session = Depends(get_db)) -> List:
    """
    Fetch all data from the database.

    Args:
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        List: List of all data entries.
    """
    all_data = get_all_data(db)
    return [
        {
            "product_id": item.product_id,
            "shop": item.shop,
            "price": item.price,
            "date": item.date.isoformat()
        }
        for item in all_data
    ]

@app.get("/get_last_scrape_date")
def get_last_scrape(db: Session = Depends(get_db)) -> Dict:
    """
    Fetch the date of the latest scrape.

    Args:
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        Dict: Date of the last scrape in ISO format.
    """
    last_scrape_date = get_latest_scrape_date(db)
    return {"date": last_scrape_date.isoformat() if last_scrape_date else "No data"}

@app.get("/get_latest_data")
def get_latest(db: Session = Depends(get_db)) -> List:
    """
    Fetch the latest data for all products.

    Args:
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        List: List of the latest data entries grouped by product.
    """
    data = get_latest_data(db)
    grouped_data = {}
    for item in data:
        product_name = item['product_name']
        if product_name not in grouped_data:
            grouped_data[product_name] = {
                'product_name': product_name,
                'product_id': item['product_id'],
                'quantity': item['quantity'],
                'shops': []
            }
        grouped_data[product_name]['shops'].append({
            'shop': item['shop'],
            'price': item['price']
        })
    return list(grouped_data.values())

@app.get("/get_product_info")
def get_product_info(db: Session = Depends(get_db)) -> List:
    """
    Fetch all product information from the database.

    Args:
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        List: List of product information.
    """
    data = db.query(Product_info).all()
    return [
        {
            "id": item.id,
            "name": item.name,
            "quantity": item.quantity
        }
        for item in data
    ]

@app.post("/scrape")
def scrape() -> List:
    """
    Perform scraping and return the results.

    Returns:
        List: List of scraped data entries.
    """
    try:
        scraped_data = scrape_data(CONFIGS)
        return scraped_data
    except Exception as e:
        return {"error": f"Error during scraping: {e}"}

@app.post("/scrape_save")
def scrape_and_save(db: Session = Depends(get_db)) -> List:
    """
    Perform scraping and save the results to the database.

    Args:
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        List: List of saved data entries.
    """
    try:
        scraped_data = scrape_data(CONFIGS)
        saved_data = []
        for item in scraped_data:
            product_info = next((prod for prod in PRODUCT_INFO if prod["id"] == item['product_id']), None)
            saved_data.append({
                "shop": item['shop'],
                "product_name": product_info["name"] if product_info else None,
                "price": item['price'],
                "quantity": product_info['quantity'] if product_info else None
            })
        save_scraped_data(db, scraped_data)
        return saved_data
    except Exception as e:
        return {"error": f"Error during scraping and saving: {e}"}

@app.get("/get_price_history/{product_id}")
def get_product_history(product_id: int, db: Session = Depends(get_db)) -> List:
    """
    Fetch the price history of a specific product.

    Args:
        product_id (int): ID of the product.
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        List: List of price history entries.
    """
    history = get_price_history(product_id, db)
    return history