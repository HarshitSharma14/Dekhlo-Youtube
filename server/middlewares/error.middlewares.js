export const errorHandlerMiddleware = (err, req, res, next) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") {
    err.message = `Invalid Formate of path ${err.path}`;
    err.statusCode = 400;
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const AsyncTryCatch = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (err) {
    console.log("erro in try cath");
    next(err);
  }
};
