import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GeoResult {
  city: string;
  regionName: string;
  country: string;
  status: string;
}

/**
 * GET /api/geo
 *
 * Returns the user's approximate location based on their IP address.
 * Uses ip-api.com (free, no API key needed, 45 req/min limit).
 */
export async function GET(request: NextRequest) {
  try {
    // Get client IP from request headers
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "";

    // Skip geolocation for local/private IPs — default to US
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return NextResponse.json({
        city: "",
        state: "",
        country: "United States",
        countryCode: "US",
        source: "default",
      });
    }

    // Call ip-api.com
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,countryCode`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!geoRes.ok) {
      throw new Error(`ip-api error: ${geoRes.status}`);
    }

    const geo: GeoResult & { countryCode: string } = await geoRes.json();

    if (geo.status !== "success") {
      return NextResponse.json({
        city: "",
        state: "",
        country: "United States",
        countryCode: "US",
        source: "ip-api-fail",
      });
    }

    return NextResponse.json({
      city: geo.city || "",
      state: geo.regionName || "",
      country: geo.country || "United States",
      countryCode: geo.countryCode || "US",
      source: "ip-api",
    });
  } catch (e: any) {
    // Graceful fallback
    return NextResponse.json({
      city: "",
      state: "",
      country: "United States",
      countryCode: "US",
      source: "fallback",
      error: e.message,
    });
  }
}
