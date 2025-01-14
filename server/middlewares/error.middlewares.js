export const errorHandlerMiddleware = (err, req, res, next) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const AsyncTryCatch = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (err) {
    next(err);
  }
};
