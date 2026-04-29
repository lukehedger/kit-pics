import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";

const COOKIE = "kitpics_sid";

export function getOrSetSession(c: Context): string {
  let sid = getCookie(c, COOKIE);
  if (!sid) {
    sid = crypto.randomUUID();
    setCookie(c, COOKIE, sid, {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return sid;
}
