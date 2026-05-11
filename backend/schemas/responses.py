from pydantic import BaseModel


class ValidationResult(BaseModel):
    job_id: str
    score: int
    verdict: str
    market: str
    competitors: str
    risks: str
    monetisation: str
    synthesis: str
