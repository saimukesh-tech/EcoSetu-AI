import os

class Settings:
    PROJECT_NAME: str = "EcoSetu AI ML Service"
    VERSION: str = "1.0.0"
    
    # Allowed origins dynamically loaded from env or default dev/prod fallback
    ALLOWED_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "ML_ALLOWED_ORIGINS",
            "http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173,https://ecosetu-ai.vercel.app,https://frontend-olive-mu-zals2li3b6.vercel.app"
        ).split(",")
        if origin.strip()
    ]

settings = Settings()
