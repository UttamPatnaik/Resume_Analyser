from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    NVIDIA_API_KEY: str

    NVIDIA_API_URL: str = "https://integrate.api.nvidia.com/v1/chat/completions"

    MODEL_NAME: str = "meta/llama-3.1-8b-instruct"

    REQUEST_TIMEOUT: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()