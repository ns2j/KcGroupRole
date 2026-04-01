import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import cors from 'cors';
import path from 'path';

import { SESSION_SECRET } from './config';
import authRouter from './auth';
import apiRouter from './api';

const port = process.env.PORT || 8020;
const app = express();


app.set('trust proxy', 1);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(cookieParser());

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Keycloak OpenID Connect Configuration
passport.use('keycloak', new OpenIDConnectStrategy({
  issuer: process.env.KEYCLOAK_ISSUER!,
  authorizationURL: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
  tokenURL: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
  userInfoURL: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
  clientID: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,

  callbackURL: `${process.env.BFF_BASE_URL}${process.env.BFF_BASE_PATH || '/bff'}/auth/callback`,
  scope: 'openid profile email',
}, ((issuer: any, profile: any, context: any, idToken: any, accessToken: any, refreshToken: any, done: any) => {
  profile.accessToken = accessToken;
  profile.idToken = idToken;
  profile.refreshToken = refreshToken;
  return done(null, profile);
}) as any));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done: any) => {
  done(null, obj);
});

const exclientRouter = express.Router();
exclientRouter.use('/', express.static(path.join(__dirname, 'static')));
exclientRouter.use('/auth', authRouter);
exclientRouter.use('/api', apiRouter);

const bffBasePath = process.env.BFF_BASE_PATH || '/';
app.use(bffBasePath, exclientRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}${bffBasePath}`);
});
