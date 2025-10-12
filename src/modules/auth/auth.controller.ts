import { AuthService } from "./auth.service";
import { Request, Response, NextFunction } from "express";
import { HttpResponseDto } from "../../common";
import { ServiceResponse, ResponseStatus } from "../../common/dtos/serviceResponse.dto";

declare global {
  namespace Express {
    interface User {
    }
  }
}

export class AuthController {
    private authService = new AuthService();
    private httpResponse = new HttpResponseDto();

    async register(req: Request, res: Response) {
        const { name, email, password } = req.body;
        const user = await this.authService.register(name, email, password);

        const response = new ServiceResponse(ResponseStatus.Success, 'User registered successfully', user, 201);
        return this.httpResponse.created(response);
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await this.authService.login(email, password);

        const refreshToken = (result as any).refreshtoken ?? (result as any).refreshToken;
        const accessToken = (result as any).accesstoken ?? (result as any).accessToken;
        const userData = (result as any).userData ?? (result as any).user;

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        if (refreshToken) {
          res.cookie("refreshToken", refreshToken, cookieOptions);
        }

        const response = new ServiceResponse(ResponseStatus.Success, 'Login successful', { accessToken, user: userData }, 200);
        return this.httpResponse.success(response);
    }

    async refresh(req: Request, res: Response) {
        const result = await this.authService.refreshToken(req);
        const accessToken = (result as any).data?.accessToken ?? (result as any).access_token;
        const refreshToken = (result as any).data?.refreshToken ?? (result as any).refresh_token;

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        if (refreshToken) {
          res.cookie("refreshToken", refreshToken, cookieOptions);
        }

        const response = new ServiceResponse(ResponseStatus.Success, (result as any).msg ?? "Refreshed tokens", { accessToken }, 200);
        return this.httpResponse.success(response);
    }

    async googleLogin(req: Request, res: Response, next: NextFunction) {
        const { accessToken, refreshToken } = await this.authService.googleLogin(req.user);
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        if (refreshToken) res.cookie("refreshToken", refreshToken, cookieOptions);
        const response = new ServiceResponse(ResponseStatus.Success, "Login with Google successful", { accessToken, user: req.user }, 200);
        return this.httpResponse.success(response);
    }

    async facebookLogin(req: Request, res: Response, next: NextFunction) {
        const { accessToken, refreshToken } = await this.authService.facebookLogin(req.user);
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        if (refreshToken) res.cookie("refreshToken", refreshToken, cookieOptions);
        const response = new ServiceResponse(ResponseStatus.Success, "Login with Facebook successful", { accessToken, user: req.user }, 200);
        return this.httpResponse.success(response);
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies?.refreshToken;
        await this.authService.logout(refreshToken, res);
        const response = new ServiceResponse(ResponseStatus.Success, "Logged out. Please also click 'Authorize' → 'Logout' to clear bearer token in Swagger.", null, 200);
        return this.httpResponse.success(response);
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body as { email: string };
        const result = await this.authService.forgotPassword(email);
        const response = new ServiceResponse(ResponseStatus.Success, result.msg, null, 200);
        return this.httpResponse.success(response);
    }

    async resetPassword(req: Request, res: Response) {
        const { token, password } = req.body as { token: string; password: string };
        const result = await this.authService.resetPassword(token, password);
        const response = new ServiceResponse(ResponseStatus.Success, result.msg, null, 200);
        return this.httpResponse.success(response);
    }
}