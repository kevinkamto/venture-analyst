import os
import sys

from dotenv import load_dotenv

load_dotenv()

# Add the parent directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from loguru import logger  # noqa: E402

from backend.api.routes import router  # noqa: E402

logger.add("logs/app.log", rotation="10 MB", retention="7 days", level="INFO")

app = FastAPI(title="Startup Validator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup() -> None:
    logger.info("Startup Validator API started")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app="backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug",
    )
