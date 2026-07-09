const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.status) {
    statusCode = err.status;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
  }

  res.status(statusCode);

  res.json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
