from pydantic import BaseModel


class ValidateRequest(BaseModel):
    idea: str
