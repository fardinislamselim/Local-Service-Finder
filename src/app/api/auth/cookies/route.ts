import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { access_token, refresh_token, user } = body;
    const cookieStore = await cookies();

    const isProduction = process.env.NODE_ENV === "production";
    const accessMaxAge = 7 * 86400; // 7 days
    const refreshMaxAge = 30 * 86400; // 30 days

    if (access_token) {
      cookieStore.set("access_token", access_token, {
        path: "/",
        sameSite: "lax",
        secure: isProduction,
        maxAge: accessMaxAge,
      });

      cookieStore.set("lsf_access_token", access_token, {
        path: "/",
        sameSite: "lax",
        secure: isProduction,
        maxAge: accessMaxAge,
      });
    }

    if (refresh_token) {
      cookieStore.set("refresh_token", refresh_token, {
        path: "/",
        sameSite: "lax",
        secure: isProduction,
        maxAge: refreshMaxAge,
      });

      cookieStore.set("lsf_refresh_token", refresh_token, {
        path: "/",
        sameSite: "lax",
        secure: isProduction,
        maxAge: refreshMaxAge,
      });
    }

    if (user) {
      const userStr = typeof user === "string" ? user : JSON.stringify(user);
      cookieStore.set("user_data", userStr, {
        path: "/",
        sameSite: "lax",
        secure: isProduction,
        maxAge: refreshMaxAge,
      });
    }

    return NextResponse.json({ success: true, message: "Cookies saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("lsf_access_token");
    cookieStore.delete("lsf_refresh_token");
    cookieStore.delete("user_data");
    cookieStore.delete("lsf_user");
    return NextResponse.json({ success: true, message: "Cookies cleared successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 400 });
  }
}
