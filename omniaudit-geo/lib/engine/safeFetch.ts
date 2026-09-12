/**
 * Production SSRF-hardened Fetch Engine for OmniAudit-GEO.
 * Zero external dependencies. Fully mirrors Python safe_fetch.py security guarantees.
 */

import { FetchResult } from "./types";

export const DEFAULT_TIMEOUT_MS = 6000;
export const DEFAULT_MAX_RESPONSE_BYTES = 1024 * 1024; // 1 MB
export const DEFAULT_MAX_ROBOTS_BYTES = 256 * 1024;   // 256 KB
export const DEFAULT_MAX_REDIRECTS = 5;

const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "metadata.google.internal",
  "instance-data",
  "metadata",
]);

const LOCAL_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".corp",
  ".home",
  ".lan",
  ".test",
  ".example",
  ".invalid",
  ".arpa",
];

const ALLOWED_PORTS = new Set([80, 443]);

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  requireHtml?: boolean;
}

export function isPrivateOrReservedIPv4(ipStr: string): boolean {
  const parts = ipStr.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b, c, d] = parts;

  // 0.0.0.0/8
  if (a === 0) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 10.0.0.0/8 (RFC 1918)
  if (a === 10) return true;
  // 172.16.0.0/12 (RFC 1918)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (RFC 1918)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link-local / Cloud metadata)
  if (a === 169 && b === 254) return true;
  // 100.64.0.0/10 (Carrier grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 192.0.0.0/24 (IETF protocol assignments)
  if (a === 192 && b === 0 && c === 0) return true;
  // 192.0.2.0/24 (Documentation TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 198.51.100.0/24 (Documentation TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;
  // 203.0.113.0/24 (Documentation TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;
  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;
  // 255.255.255.255 (Broadcast)
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

export function isPrivateOrReservedIPv6(ipStr: string): boolean {
  const normalized = ipStr.toLowerCase().replace(/^\[|\]$/g, "");

  // Unspecified :: or Loopback ::1
  if (normalized === "::" || normalized === "::1") return true;

  // IPv4-mapped IPv6: ::ffff:127.0.0.1 or ::ffff:7f00:1
  const ipv4MappedMatch = normalized.match(/::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (ipv4MappedMatch) {
    return isPrivateOrReservedIPv4(ipv4MappedMatch[1]);
  }

  // Unique local fc00::/7
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-local fe80::/10
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
    return true;
  }

  // Multicast ff00::/8
  if (normalized.startsWith("ff")) return true;

  return false;
}

export function validateTargetUrl(rawUrl: string): { valid: boolean; normalized?: string; error?: string; errorCode?: string } {
  let target = rawUrl.trim();
  if (!target) {
    return { valid: false, error: "Empty target URL", errorCode: "invalid_url" };
  }

  if (!target.startsWith("http://") && !target.startsWith("https://")) {
    target = "https://" + target;
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return { valid: false, error: "Malformed URL syntax", errorCode: "invalid_url" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: `Disallowed URL scheme: ${parsed.protocol}`, errorCode: "unsupported_scheme" };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, error: "URLs with embedded credentials are not permitted", errorCode: "credentials_not_allowed" };
  }

  const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === "https:" ? 443 : 80);
  if (!ALLOWED_PORTS.has(port)) {
    return { valid: false, error: `Disallowed port: ${port}. Only ports 80 and 443 are supported.`, errorCode: "port_not_allowed" };
  }

  const rawHost = parsed.hostname.toLowerCase();
  const host = rawHost.replace(/^\[|\]$/g, "");

  // Hostname string checks
  if (LOCAL_HOSTNAMES.has(host) || LOCAL_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return { valid: false, error: `Access to private/local host is blocked: ${host}`, errorCode: "ssrf_blocked" };
  }

  // Check integer/decimal/hex IP bypass (e.g. 2130706433)
  if (/^\d+$/.test(host)) {
    const num = parseInt(host, 10);
    if (num >= 0 && num <= 4294967295) {
      const b1 = (num >> 24) & 255;
      const b2 = (num >> 16) & 255;
      const b3 = (num >> 8) & 255;
      const b4 = num & 255;
      const reconstructed = `${b1}.${b2}.${b3}.${b4}`;
      if (isPrivateOrReservedIPv4(reconstructed)) {
        return { valid: false, error: `Access to decimal-encoded private IP is blocked: ${host} (${reconstructed})`, errorCode: "ssrf_blocked" };
      }
    }
  }

  // IPv4 direct check
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    if (isPrivateOrReservedIPv4(host)) {
      return { valid: false, error: `Access to private IPv4 address is blocked: ${host}`, errorCode: "ssrf_blocked" };
    }
  }

  // IPv6 direct check
  if (host.includes(":")) {
    if (isPrivateOrReservedIPv6(host)) {
      return { valid: false, error: `Access to private IPv6 address is blocked: ${host}`, errorCode: "ssrf_blocked" };
    }
  }

  return { valid: true, normalized: parsed.href };
}

export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {}
): Promise<FetchResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const requireHtml = options.requireHtml ?? false;

  let currentUrl = url;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    const validation = validateTargetUrl(currentUrl);
    if (!validation.valid || !validation.normalized) {
      return {
        html: "",
        headers: {},
        status: 0,
        error: validation.error || "SSRF validation rejected target",
        error_code: validation.errorCode || "ssrf_blocked",
        bytes_read: 0,
      };
    }
    currentUrl = validation.normalized;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BrandAIAuditBot/1.0; +https://agentskills.io)",
          "Accept": requireHtml ? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" : "*/*",
        },
        redirect: "manual",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle Redirects manually to enforce SSRF validation at every step
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          return {
            html: "",
            headers: {},
            status: res.status,
            error: `Exceeded maximum redirect limit (${maxRedirects})`,
            error_code: "too_many_redirects",
            bytes_read: 0,
          };
        }

        const location = res.headers.get("location");
        if (!location) {
          return {
            html: "",
            headers: {},
            status: res.status,
            error: "Redirect response missing Location header",
            error_code: "invalid_redirect",
            bytes_read: 0,
          };
        }

        currentUrl = new URL(location, currentUrl).href;
        continue;
      }

      // Check Content-Type if requireHtml is requested
      const contentType = res.headers.get("content-type") || "";
      if (requireHtml && res.status === 200) {
        const isHtml = contentType.toLowerCase().includes("text/html") ||
                       contentType.toLowerCase().includes("application/xhtml+xml");
        if (!isHtml) {
          return {
            html: "",
            headers: Object.fromEntries(res.headers.entries()),
            status: res.status,
            error: `Target returned non-HTML Content-Type: ${contentType}`,
            error_code: "unsupported_content_type",
            bytes_read: 0,
          };
        }
      }

      // Bounded stream reading to strictly enforce maxBytes
      if (!res.body) {
        return {
          html: "",
          headers: Object.fromEntries(res.headers.entries()),
          status: res.status,
          error: null,
          bytes_read: 0,
        };
      }

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > maxBytes) {
            reader.cancel();
            return {
              html: "",
              headers: Object.fromEntries(res.headers.entries()),
              status: res.status,
              error: `Response exceeded maximum size limit of ${maxBytes} bytes`,
              error_code: "response_too_large",
              bytes_read: totalBytes,
            };
          }
          chunks.push(value);
        }
      }

      const totalBuffer = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        totalBuffer.set(chunk, offset);
        offset += chunk.byteLength;
      }

      const decoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });
      const htmlText = decoder.decode(totalBuffer);

      return {
        html: htmlText,
        headers: Object.fromEntries(res.headers.entries()),
        status: res.status,
        error: null,
        bytes_read: totalBytes,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === "AbortError";
      return {
        html: "",
        headers: {},
        status: 0,
        error: isTimeout ? `Request timed out after ${timeoutMs}ms` : (err?.message || "Fetch failed"),
        error_code: isTimeout ? "timeout" : "network_error",
        bytes_read: 0,
      };
    }
  }

  return {
    html: "",
    headers: {},
    status: 0,
    error: `Exceeded maximum redirect limit (${maxRedirects})`,
    error_code: "too_many_redirects",
    bytes_read: 0,
  };
}
