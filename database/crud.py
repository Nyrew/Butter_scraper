from sqlalchemy import delete, func, text
from sqlalchemy.orm import Session
from datetime import datetime
from database.model import Product, Product_info

def save_scraped_data(db: Session, scraped_data_multiple: list):

    for scraped_data in scraped_data_multiple:
        existing_product = db.query(Product).filter(
            Product.product_id == scraped_data['product_id'],
            Product.shop == scraped_data['shop'],
            func.date(Product.date) == datetime.now().date()
        ).first()

        if existing_product:
            print(f"Duplicate entry found for product_id: {scraped_data['product_id']} and shop: {scraped_data['shop']} on {datetime.now().date()}")
            continue
        
        db_item = Product(
                shop=scraped_data['shop'],
                product_id=scraped_data['product_id'],
                price=scraped_data['price'],
                date=datetime.now()
        )
        db.add(db_item)
    db.commit()
    db.refresh(db_item)
    print("Data successfully saved.")

def get_all_data(db: Session):
    return db.query(Product).all()

def get_latest_data(db: Session):
    subquery = (
        db.query(
            Product.product_id,
            func.max(func.date(Product.date)).label("latest_date")  
        )
        .group_by(Product.product_id)
        .subquery()
    )
    filtered_data = (
        db.query(Product, Product_info)
        .join(subquery, (Product.product_id == subquery.c.product_id) & (func.date(Product.date) == subquery.c.latest_date))
        .join(Product_info, Product.product_id == Product_info.id)
        .all()
    )
    butter_info = []
    for product, product_info in filtered_data:
        product_dict = {
            "shop": product.shop,
            "product_name": product_info.name,
            "price": product.price,
            "quantity": product_info.quantity,
        }
        butter_info.append(product_dict)
    return butter_info

def check_columns(db: Session):
    result = db.execute(text("""
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'products';
    """))

    columns = [row[0] for row in result]
    print("Sloupce v tabulce 'products':")
    for column in columns:
        print(column)

def save_product_info(db: Session, products: list):
    inserted_products = []
    try:
        for product in products:
            db_product = Product_info(
                name=product['name'],
                quantity=product['quantity']
            )
            db.add(db_product)
            inserted_products.append(db_product)
        
        db.commit()
        
        for db_product in inserted_products:
            db.refresh(db_product)
            
        return inserted_products
    
    except Exception as e:
        db.rollback()
        print(f"Error occurred: {e}")
        raise
    
def get_latest_scrape_date(db: Session):
    try:
        result = db.query(Product).order_by(Product.date.desc()).first()
        return result.date if result else None
    except Exception as e:
        print(f"Error fetching the latest scrape date: {e}")
        return None
    
def get_price_history(product_name: str, db: Session):
    # Vybere všechny ceny pro daný produkt a jejich čas
    price_history = (
        db.query(Product.shop, Product.date, Product.price)
        .join(Product_info, Product.product_id == Product_info.id)
        .filter(Product_info.name == product_name)
        .order_by(Product.date)
        .all()
    )
    # Zpracování dat do požadovaného formátu
    history = []
    for shop, date, price in price_history:
        history.append({
            "shop": shop,
            "date": date.strftime("%Y-%m-%d %H:%M:%S"),  # Formátujeme čas
            "price": price
        })
    return history