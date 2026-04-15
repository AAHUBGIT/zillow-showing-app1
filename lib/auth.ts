import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "showing-agent-session";
const encoder = new TextEncoder();

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET || "replace-this-with-a-long-random-secret";
}

function getAuthEmail() {
  return process.env.AUTH_EMAIL || "demo@showingscrm.com";
}

function getAuthPassword() {
  return process.env.AUTH_PASSWORD || "changeme123";
}

export function getDemoUser(): SessionUser {
  const email = getAuthEmail();

  return {
    id: "demo-user",
    email,
    name: email.split("@")[0]
  };
}

export async function createSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(getAuthSecret()));
}

export async function verifySession(token: string) {
  const result = await jwtVerify(token, encoder.encode(getAuthSecret()));
  return result.payload as unknown as SessionUser;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  const token = await createSession(user);

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function isValidLogin(email: string, password: string) {
  return email === getAuthEmail() && password === getAuthPassword();
}
