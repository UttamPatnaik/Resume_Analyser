class AppException(Exception):
    """Base exception for application-level errors."""

    def __init__(
        self,
        message: str,
        code: str = "APP_ERROR",
    ):
        self.message = message
        self.code = code
        super().__init__(message)


class DocumentError(AppException):
    """Base class for document processing errors."""


class InvalidDocumentError(DocumentError):
    """The uploaded document is invalid."""


class DocumentNotResumeError(DocumentError):
    """The uploaded document is not a resume."""


class DocumentExtractionError(DocumentError):
    """The document could not be extracted correctly."""


class AIServiceError(AppException):
    """Base class for AI provider errors."""


class AIConnectionError(AIServiceError):
    """Could not communicate with the AI provider."""


class AIResponseError(AIServiceError):
    """AI provider returned an invalid or unexpected response."""


class AIInvalidJSONError(AIServiceError):
    """AI provider returned invalid JSON."""