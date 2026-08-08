from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    AppException,
    DocumentNotResumeError,
    InvalidDocumentError,
    DocumentExtractionError,
    AIConnectionError,
    AIResponseError,
    AIInvalidJSONError,
)


async def app_exception_handler(
    request: Request,
    exc: AppException,
):
    status_code = 500

    if isinstance(exc, InvalidDocumentError):
        status_code = 400

    elif isinstance(exc, DocumentNotResumeError):
        status_code = 400

    elif isinstance(exc, DocumentExtractionError):
        status_code = 422

    elif isinstance(exc, AIConnectionError):
        status_code = 502

    elif isinstance(exc, AIResponseError):
        status_code = 502

    elif isinstance(exc, AIInvalidJSONError):
        status_code = 502

    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        },
    )