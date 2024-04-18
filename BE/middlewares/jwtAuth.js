const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization;
  // const token = req.headers.authentication;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const Htoken = token.split(" ")[1];
  if (!Htoken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const user = jwt.verify(Htoken, env.JWT_SECRET);
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Lỗi đăng nhập",
    });
  }
};

module.exports = jwtAuth;
