import { runFullAudit } from "@/lib/engine/orchestrator";
import { validateAuditReport } from "@/lib/engine/schema";
import { validateTargetUrl } from "@/lib/engine/safeFetch";

// Simple in-memory rate limiter per IP (30 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIp);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  clientData.count++;
  return true;
}

const SECURITY_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: SECURITY_HEADERS,
  });
}

export async function GET(request: Request) {
  try {
    // 1. Extract Client Identifier for Rate Limiting
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const cfIp = request.headers.get("cf-connecting-ip") || "";
    const clientIp = cfIp || forwardedFor.split(",")[0].trim() || "anonymous-client";

    if (!checkRateLimit(clientIp)) {
      return Response.json(
        {
          error: "Too Many Requests",
          error_code: "rate_limit_exceeded",
          message: "Rate limit of 30 audit requests per minute exceeded. Please try again shortly.",
        },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // 2. Extract & Validate Target URL Parameter
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl || !rawUrl.trim()) {
      return Response.json(
        {
          error: "Bad Request",
          error_code: "missing_url_parameter",
          message: "Query parameter 'url' is required (e.g. /api/audit?url=https://adobe.com).",
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const preValidation = validateTargetUrl(rawUrl);
    if (!preValidation.valid || !preValidation.normalized) {
      return Response.json(
        {
          error: "Invalid Target URL",
          error_code: preValidation.errorCode || "invalid_url",
          message: preValidation.error || "The provided target URL failed safety and protocol validation.",
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // 3. Execute Canonical Audit Engine
    const report = await runFullAudit(preValidation.normalized);

    // 4. Schema Integrity Assertion
    const schemaCheck = validateAuditReport(report);
    if (!schemaCheck.valid) {
      console.error("[OmniAudit API] Schema validation error:", schemaCheck.errors);
      return Response.json(
        {
          error: "Internal Processing Error",
          error_code: "schema_validation_failed",
          message: "The audit engine generated an output report that failed internal schema validation.",
        },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // 5. Return Authoritative Result
    return Response.json(report, {
      status: 200,
      headers: SECURITY_HEADERS,
    });
  } catch (err: any) {
    // Fail Closed: Safe error response without leaking stack traces or internal secrets
    return Response.json(
      {
        error: "Internal Server Error",
        error_code: "audit_execution_failed",
        message: "An unexpected error occurred during audit execution. Please verify the target is reachable.",
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
