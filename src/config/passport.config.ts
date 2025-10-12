import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from "passport-facebook";
import { AccountProviderRepository } from "../modules/auth/repository";
import { UserRepo } from "../modules/user/repository";
import { AppDataSource } from "./db.config";
import { ProviderType } from "../entities";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ?? "";

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID ?? "";
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET ?? "";
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL ?? "";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const userRepo = new UserRepo(AppDataSource);
        const providerRepo = new AccountProviderRepository(AppDataSource);

        const linked = await providerRepo.findByProviderId(ProviderType.GOOGLE, profile.id);
        if (linked?.user) return done(null, linked.user);

        const email = (profile._json as any)?.email ?? "";
        if (!email) return done(new Error("Google profile missing email"));

        let user = await userRepo.findByEmail(email);
        if (!user) {
          user = await userRepo.createAndSave({
            name: profile.displayName ?? (profile._json as any)?.name ?? "",
            email,
            isActive: true,
          } as any);
        }

        await providerRepo.createAndSave({
          user,
          provider: ProviderType.GOOGLE,
          providerId: profile.id,
          accessToken,
          refreshToken,
        } as any);

        return done(null, user);
      } catch (err) {
        return done(err as any);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "emails", "name"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: FacebookProfile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const userRepo = new UserRepo(AppDataSource);
        const providerRepo = new AccountProviderRepository(AppDataSource);

        const linked = await providerRepo.findByProviderId(ProviderType.FACEBOOK, profile.id);
        if (linked?.user) return done(null, linked.user);

        const email = (profile._json as any)?.email ?? "";
        if (!email) return done(new Error("Facebook profile missing email"));

        let user = await userRepo.findByEmail(email);
        if (!user) {
          user = await userRepo.createAndSave({
            name: profile.displayName ?? (profile._json as any)?.name ?? "",
            email,
            isActive: true,
          } as any);
        }

        await providerRepo.createAndSave({
          user,
          provider: ProviderType.FACEBOOK,
          providerId: profile.id,
          accessToken,
          refreshToken,
        } as any);

        return done(null, user);
      } catch (err) {
        return done(err as any);
      }
    }
  )
);

passport.serializeUser((user: any, done: (error: any, user?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: (error: any, user?: any) => void) => {
  done(null, user);
});

export default passport;