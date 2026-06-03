from pydantic import BaseModel, EmailStr, Field

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(gt=0, description="Price must be greater than zero")
    quantity_in_stock: int = Field(ge=0, description="Quantity cannot be negative")

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderBase(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(gt=0, description="Must order at least 1 item")

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    total_amount: float
    class Config:
        from_attributes = True