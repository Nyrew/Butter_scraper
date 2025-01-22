from sqlalchemy import func, text
from sqlalchemy.orm import Session
from datetime import datetime
from database.model import Product, Product_info

def save_scraped_data(db: Session, scraped_data_multiple: list[dict]) -> None:
    """
    Save scraped data to the database, checking for duplicates.

    Args:
        db (Session): SQLAlchemy session.
        scraped_data_multiple (list[dict]): List of scraped data entries.

    Returns:
        None
    """
    for scraped_data in scraped_data_multiple:
        existing_product = db.query(Product).filter(
            Product.product_id == scraped_data['product_id'],
            Product.shop == scraped_data['shop'],
            func.date(Product.date) == datetime.now().date()
        ).first()

        if existing_product:
            continue
        
        db_item = Product(
                shop=scraped_data['shop'],
                product_id=scraped_data['product_id'],
                price=scraped_data['price'],
                date=datetime.now()
        )
        db.add(db_item)
    
    db.commit()

def get_all_data(db: Session) -> list[Product]:
    """
    Retrieve all product data from the database.

    Args:
        db (Session): SQLAlchemy session.

    Returns:
        list[Product]: List of all products in the database.
    """
    return db.query(Product).all()

def get_latest_data(db: Session) -> list[dict]:
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
            "product_id": product.product_id,
            "price": product.price,
            "quantity": product_info.quantity,
        }
        butter_info.append(product_dict)
    return butter_info

def check_columns(db: Session):
    """
    Check and print the column names of the 'products' table.

    Args:
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        None
    """
    try:
        result = db.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'products';
        """))

        columns = [row[0] for row in result]
        print("Columns in the 'products' table:")
        for column in columns:
            print(column)
    except Exception as e:
        print(f"Error checking columns: {e}")
        raise

def save_product_info(db: Session, products: list):
    """
    Save product information into the database.

    Args:
        db (Session): SQLAlchemy session for database interaction.
        products (list[dict]): List of products with 'name' and 'quantity'.

    Returns:
        list: List of inserted ProductInfo objects.
    """
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

        # Refresh the objects after committing
        for db_product in inserted_products:
            db.refresh(db_product)
        
        return inserted_products
    except Exception as e:
        db.rollback()
        print(f"Error saving product info: {e}")
        raise

    
def get_latest_scrape_date(db: Session):
    """
    Retrieve the latest scrape date from the 'products' table.

    Args:
        db (Session): SQLAlchemy session for database interaction.

    Returns:
        datetime | None: The latest scrape date if available, otherwise None.
    """
    try:
        result = db.query(Product).order_by(Product.date.desc()).first()
        return result.date if result else None
    except Exception as e:
        print(f"Error fetching the latest scrape date: {e}")
        return None
    
def get_price_history(product_id: int, db: Session):
    """
    Retrieve price history for a specific product.

    Args:
        product_id (int): ID of the product.
        db (Session): SQLAlchemy session.

    Returns:
        list[dict]: List of price history entries.
    """
    price_history = (
        db.query(Product.shop, Product.date, Product.price)
        .filter(Product.product_id == product_id)
        .order_by(Product.date)
        .all()
    )
    history = []
    for shop, date, price in price_history:
        history.append({
            "shop": shop,
            "date": date.strftime("%Y-%m-%d %H:%M:%S"), 
            "price": price
        })
    return history