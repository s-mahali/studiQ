export const successHandlerMiddleware = (req, res, next) => {
  res.success = function (payload, message = "Success", statusCode = 200) {
    return this.status(statusCode).json({ success: true, message, payload });
  };
  next();
};
