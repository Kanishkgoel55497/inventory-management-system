from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas

# --- Product Operations ---
def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def create_product(db: Session, product: schemas.ProductCreate):
    if get_product_by_sku(db, product.sku):
        raise HTTPException(status_code=400, detail="Product SKU already exists")
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def update_product(db: Session, product_id: int, product_update: schemas.ProductCreate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    for key, value in product_update.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

# --- Customer Operations ---
def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    if get_customer_by_email(db, customer.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer

# --- Order Operations ---
def create_order(db: Session, order: schemas.OrderCreate):
    # 1. Validate Customer
    if not get_customer(db, order.customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
        
    # 2. Validate Product & Inventory
    product = get_product(db, order.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.quantity_in_stock < order.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient inventory. Only {product.quantity_in_stock} items left.")
        
    # 3. Calculate Total & Reduce Stock
    total_amount = product.price * order.quantity
    product.quantity_in_stock -= order.quantity
    
    # 4. Save Order
    db_order = models.Order(
        customer_id=order.customer_id,
        product_id=order.product_id,
        quantity=order.quantity,
        total_amount=total_amount
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        # Restore inventory when an order is cancelled
        product = get_product(db, db_order.product_id)
        if product:
            product.quantity_in_stock += db_order.quantity
            
        db.delete(db_order)
        db.commit()
    return db_order