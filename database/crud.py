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
    # Filtrovaná data seřazená podle produktu a nejnovějšího data
    subquery = (
        db.query(
            Product.product_id,
            func.max(Product.date).label("latest_date")
        )
        .group_by(Product.product_id)
        .subquery()
    )

    # Připojení na původní tabulky pro získání detailů
    filtered_data = (
        db.query(Product, Product_info)
        .join(subquery, (Product.product_id == subquery.c.product_id) & (Product.date == subquery.c.latest_date))
        .join(Product_info, Product.product_id == Product_info.id)
        .all()
    )

    # Sestavení výsledku
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



def delete_all_products(db: Session):
    stmt = delete(Product)
    db.execute(stmt)
    db.commit()
    print("Deleted")
       
def delete_product_by_product_criteria(db: Session, product_id: int, date: datetime):
    stmt = delete(Product).where(
        Product.product_id == product_id,
        Product.date < date
    )
    db.execute(stmt)
    db.commit()
    print("Deleted")
    
def check_product_exists(db: Session, product_id: int, date: datetime) -> bool:    
    check_date = date.date()
    
    result = db.query(Product).filter(
        Product.product_id == product_id,
        func.date(Product.date) == check_date
    ).first()
    
    return result is not None

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