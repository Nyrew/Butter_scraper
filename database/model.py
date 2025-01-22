from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.database import Base

class Product_info(Base):
    __tablename__ = 'product_info'
    
    id = Column(Integer, primary_key=True,  autoincrement=True)
    name = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    
    products = relationship("Product", back_populates="product_info")


class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True,  autoincrement=True)
    shop = Column(String(50), nullable=False)
    product_id = Column(Integer, ForeignKey('product_info.id'), nullable=False)
    price = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    
    product_info = relationship("Product_info", back_populates="products")

