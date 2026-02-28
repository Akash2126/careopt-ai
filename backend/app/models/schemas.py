from pydantic import BaseModel

class SearchRequest(BaseModel):
    treatment: str
    city: str
    budget: int
