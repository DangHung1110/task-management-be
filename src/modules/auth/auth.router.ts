import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import passport from "../../config/passport.config";

import { AuthController } from "./auth.controller";
import { autoBindUtil, validateRequestMiddleware } from "../../common";
import { createApiResponse } from "../../swagger";

extendZodWithOpenApi(z);

// Zod Schemas
const RegisterRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().optional(),
});

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
});

const RefreshResponseSchema = z.object({
  accessToken: z.string(),
});

const ForgotPasswordRequestSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
});

const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1).openapi({ example: "<reset-token-from-email>" }),
  password: z.string().min(6).openapi({ example: "newStrongPassword123" })
});


export const authRegistry = new OpenAPIRegistry();

authRegistry.register("RegisterRequest", RegisterRequestSchema);
authRegistry.register("User", UserSchema);
authRegistry.register("LoginRequest", LoginRequestSchema);
authRegistry.register("LoginResponse", LoginResponseSchema);
authRegistry.register("RefreshResponse", RefreshResponseSchema);
authRegistry.register("ForgotPasswordRequest", ForgotPasswordRequestSchema);
authRegistry.register("ResetPasswordRequest", ResetPasswordRequestSchema);

// Initialize dependencies
const authController = new AuthController();
const router = express.Router({ mergeParams: true });
autoBindUtil(authController);

// POST /auth/register
authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/RegisterRequest" },
      },
    },
  },
  responses: createApiResponse(UserSchema, "User registered successfully", StatusCodes.CREATED),
});
router.post(
  "/register",
  validateRequestMiddleware(RegisterRequestSchema, "body"),
  authController.register
);

// POST /auth/login
authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/LoginRequest" },
      },
    },
  },
  responses: createApiResponse(LoginResponseSchema, "Login successful"),
});
router.post(
  "/login",
  validateRequestMiddleware(LoginRequestSchema, "body"),
  authController.login
);

// POST /auth/refresh
authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  description: "Reads refresh token from cookie and returns a new access token. Also sets a new refresh token cookie.",
  responses: createApiResponse(RefreshResponseSchema, "Refreshed tokens"),
});
router.post("/refresh", authController.refresh);

// POST /auth/logout
authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  description: "Clears the refreshToken cookie. In Swagger UI, also click 'Authorize' → 'Logout' to clear the in-memory bearer token.",
  responses: createApiResponse(z.null(), "Logged out"),
});
router.post("/logout", authController.logout);

// POST /auth/forgot-password
authRegistry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
      },
    },
  },
  responses: createApiResponse(z.null(), "If email exists, a reset link has been sent"),
});
router.post(
  "/forgot-password",
  validateRequestMiddleware(ForgotPasswordRequestSchema, "body"),
  authController.forgotPassword
);

// POST /auth/reset-password
authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
      },
    },
  },
  responses: createApiResponse(z.null(), "Password has been reset successfully"),
});
router.post(
  "/reset-password",
  validateRequestMiddleware(ResetPasswordRequestSchema, "body"),
  authController.resetPassword
);

// GET /auth/google
authRegistry.registerPath({
  method: "get",
  path: "/auth/google",
  tags: ["Auth"],
  responses: createApiResponse(z.null(), "Redirect to Google OAuth"),
});
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  })
);

// GET /auth/google/callback
authRegistry.registerPath({
  method: "get",
  path: "/auth/google/callback",
  tags: ["Auth"],
  responses: createApiResponse(LoginResponseSchema, "Login with Google successful"),
});
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  authController.googleLogin
);

// GET /auth/facebook
authRegistry.registerPath({
  method: "get",
  path: "/auth/facebook",
  tags: ["Auth"],
  responses: createApiResponse(z.null(), "Redirect to Facebook OAuth"),
});
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
    session: false,
  })
);

// GET /auth/facebook/callback
authRegistry.registerPath({
  method: "get",
  path: "/auth/facebook/callback",
  tags: ["Auth"],
  responses: createApiResponse(LoginResponseSchema, "Login with Facebook successful"),
});
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login", session: false }),
  authController.facebookLogin
);

export const authRouter = router;