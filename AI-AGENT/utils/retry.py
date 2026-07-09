import asyncio
import functools
from typing import Callable, Any, Tuple, Type
from utils.logger import get_logger

logger = get_logger("retry_decorator")

def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: Tuple[Type[BaseException], ...] = (Exception,)
):
    """
    A decorator that retries an asynchronous function with exponential backoff.
    
    :param max_attempts: Maximum number of times to run the function.
    :param delay: Initial delay in seconds between retries.
    :param backoff: Multiplier to apply to the delay after each retry.
    :param exceptions: A tuple of exception classes that trigger a retry.
    """
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            current_delay = delay
            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        logger.error(
                            f"Async function {func.__name__} failed on final attempt {attempt}/{max_attempts}. Error: {e}"
                        )
                        raise e
                    logger.warning(
                        f"Attempt {attempt}/{max_attempts} failed for async {func.__name__}. "
                        f"Retrying in {current_delay:.2f} seconds... Error: {e}"
                    )
                    await asyncio.sleep(current_delay)
                    current_delay *= backoff
            return None
        return wrapper
    return decorator
