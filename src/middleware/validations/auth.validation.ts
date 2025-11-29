import { body } from "express-validator";

export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email address"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email address"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
