// generate token file 
import jwt from "jsonwebtoken";

export const generateToken = (id, role, expiresIn = "7d") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};
