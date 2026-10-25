import { NextResponse, type NextRequest } from "next/server";
import {
  INGRESS_COOKIE,
  INGRESS_HEADER,
  normalizeIngressPrefix,
} from "@repo/lib/ingress/path";

// The Supervisor-only client check lives in ingress-server.cjs: it needs the
// socket address, and X-Forwarded-For carries the browser's IP under Ingress.
export function middleware(request: NextRequest) {
  const ingressPath = normalizeIngressPrefix(
    request.headers.get(INGRESS_HEADER)
  );
  const response = NextResponse.next();

  if (ingressPath) {
    response.cookies.set(INGRESS_COOKIE, ingressPath, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  } else {
    response.cookies.delete(INGRESS_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
