import { StatusCodes } from "http-status-codes";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import User from "../models/UserModel.js";
import { createJWT } from "../utils/tokenUtils.js";
import { UnauthenticatedError, BadRequestError } from "../errors/customErrors.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError("Name, email, and password are required.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already in use.");
    }

    const hashedPassword = await hashPassword(password);
    req.body.password = hashedPassword;

    const users = await User.countDocuments();
    if (users === 0) {
      req.body.role = "admin";
    }

    const user = await User.create(req.body);
    res.status(StatusCodes.CREATED).json({ msg: "User registered successfully." });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthenticatedError("Invalid credentials.");
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid credentials.");
    }

    const token = createJWT({
      userId: user._id,
      role: user.role,
      username: user.name,
    });

    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.status(StatusCodes.OK).json({
      msg: `Welcome back, ${user.name}`,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res, next) => {
  try {
    res.cookie("token", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: "User logged out successfully." });
  } catch (error) {
    next(error);
  }
};
