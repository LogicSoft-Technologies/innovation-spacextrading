//adminAuthMiddleware
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

export const protectAdmin = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.id).select("-password");
    if (!req.admin)
      return res.status(401).json({ message: "Admin no longer exists" });

    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
