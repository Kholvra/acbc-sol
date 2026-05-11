import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { env } from "~/env";

const getSecret = () => new TextEncoder().encode(env.AUTH_SECRET);

export interface SessionPayload {
  address: string;
  role: Role | null;
}

const roles = new Set<Role>(["DONATUR", "CAMPAIGNER", "ADMIN"]);

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ sub: payload.address, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifyToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string") {
      return null;
    }

    const role =
      typeof payload.role === "string" && roles.has(payload.role as Role)
        ? (payload.role as Role)
        : null;

    return { address: payload.sub, role };
  } catch {
    return null;
  }
}
