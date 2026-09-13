#!/usr/bin/env python3
"""
Adversarial Security & SSRF Defense Test Suite for OmniAudit-GEO.
Enforces that every private, link-local, loopback, credentialed, or abusive destination
fails closed before any socket connection or data leakage occurs.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

SCRIPT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts"))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from safe_fetch import (
    FetchValidationError,
    normalize_url,
    safe_fetch,
)


class TestSecurityAdversarial(unittest.TestCase):
    def test_reject_localhost(self):
        for host in ["http://localhost", "https://localhost", "http://localhost.localdomain", "http://ip6-localhost"]:
            with self.assertRaises(FetchValidationError):
                normalize_url(host)
            res = safe_fetch(host)
            self.assertEqual(res["error_code"], "fetch_blocked")
            self.assertEqual(res["body"], b"")

    def test_reject_loopback_ipv4(self):
        for ip in ["http://127.0.0.1", "http://127.0.1.1", "https://127.0.0.254"]:
            with self.assertRaises(FetchValidationError):
                normalize_url(ip)
            res = safe_fetch(ip)
            self.assertEqual(res["error_code"], "fetch_blocked")
            self.assertEqual(res["body"], b"")

    def test_reject_cloud_imds_metadata(self):
        imds_url = "http://169.254.169.254/latest/meta-data/"
        with self.assertRaises(FetchValidationError):
            normalize_url(imds_url)
        res = safe_fetch(imds_url)
        self.assertEqual(res["error_code"], "fetch_blocked")
        self.assertEqual(res["body"], b"")

    def test_reject_private_rfc1918(self):
        private_ips = [
            "http://10.0.0.1",
            "http://10.255.255.255",
            "http://172.16.0.1",
            "http://172.31.255.254",
            "http://192.168.0.1",
            "http://192.168.1.254",
        ]
        for url in private_ips:
            with self.assertRaises(FetchValidationError):
                normalize_url(url)
            res = safe_fetch(url)
            self.assertEqual(res["error_code"], "fetch_blocked")
            self.assertEqual(res["body"], b"")

    def test_reject_loopback_and_link_local_ipv6(self):
        ipv6_targets = [
            "http://[::1]",
            "http://[fe80::1]",
            "http://[::ffff:127.0.0.1]",
            "http://[::ffff:169.254.169.254]",
        ]
        for url in ipv6_targets:
            with self.assertRaises(FetchValidationError):
                normalize_url(url)
            res = safe_fetch(url)
            self.assertEqual(res["error_code"], "fetch_blocked")
            self.assertEqual(res["body"], b"")

    def test_reject_integer_decimal_ip(self):
        # 2130706433 is 127.0.0.1
        with self.assertRaises(FetchValidationError):
            normalize_url("http://2130706433")
        res = safe_fetch("http://2130706433")
        self.assertEqual(res["error_code"], "fetch_blocked")
        self.assertEqual(res["body"], b"")

    def test_reject_local_suffixes(self):
        for suffix in [".local", ".internal", ".lan", ".home.arpa", ".localhost", ".test", ".invalid"]:
            url = f"http://service{suffix}/api"
            with self.assertRaises(FetchValidationError):
                normalize_url(url)
            res = safe_fetch(url)
            self.assertEqual(res["error_code"], "fetch_blocked")

    def test_reject_embedded_credentials(self):
        for url in ["http://admin:secret@example.com", "https://user@example.com"]:
            with self.assertRaises(FetchValidationError):
                normalize_url(url)
            res = safe_fetch(url)
            self.assertEqual(res["error_code"], "fetch_blocked")

    def test_reject_non_web_ports(self):
        for port in [21, 22, 25, 3306, 5432, 6379, 8080, 8443]:
            url = f"http://example.com:{port}"
            with self.assertRaises(FetchValidationError):
                normalize_url(url)
            res = safe_fetch(url)
            self.assertEqual(res["error_code"], "fetch_blocked")

    def test_reject_unsupported_schemes(self):
        for scheme in ["ftp", "file", "gopher", "ssh", "data", "javascript"]:
            url = f"{scheme}://example.com"
            with self.assertRaises(FetchValidationError):
                normalize_url(url)
            res = safe_fetch(url)
            self.assertEqual(res["error_code"], "fetch_blocked")

    @patch("socket.getaddrinfo")
    def test_reject_dns_resolving_to_private_ip(self, mock_getaddrinfo):
        mock_getaddrinfo.return_value = [(2, 1, 6, "", ("10.0.0.1", 80))]
        res = safe_fetch("http://malicious-public-domain.com")
        self.assertEqual(res["error_code"], "fetch_blocked")
        self.assertIn("non-public address", res["error"])

    @patch("socket.getaddrinfo")
    def test_reject_redirect_to_private_address(self, mock_getaddrinfo):
        # First request resolves to public IP, returns redirect to 127.0.0.1
        mock_getaddrinfo.side_effect = [
            [(2, 1, 6, "", ("93.184.216.34", 80))],  # First host resolution ok
            [(2, 1, 6, "", ("127.0.0.1", 80))],  # Redirect target fails
        ]
        mock_resp = MagicMock()
        mock_resp.getcode.return_value = 302
        mock_resp.headers = {"Location": "http://127.0.0.1/admin"}

        with patch("urllib.request.build_opener") as mock_opener:
            mock_inst = MagicMock()
            mock_inst.open.return_value = mock_resp
            mock_opener.return_value = mock_inst
            res = safe_fetch("http://example.com")
            self.assertEqual(res["error_code"], "fetch_blocked")

    def test_reject_oversized_response(self):
        mock_resp = MagicMock()
        mock_resp.getcode.return_value = 200
        mock_resp.info.return_value = {"Content-Type": "text/html"}
        # Provide more bytes than max_bytes
        limit = 1024
        mock_resp.read.side_effect = [b"A" * limit, b"B"]

        with patch("socket.getaddrinfo") as mock_dns, patch("urllib.request.build_opener") as mock_opener:
            mock_dns.return_value = [(2, 1, 6, "", ("93.184.216.34", 80))]
            mock_inst = MagicMock()
            mock_inst.open.return_value = mock_resp
            mock_opener.return_value = mock_inst
            res = safe_fetch("http://example.com", max_bytes=limit)
            self.assertEqual(res["error_code"], "response_too_large")
            self.assertEqual(res["body"], b"")

    def test_reject_non_html_when_required(self):
        mock_resp = MagicMock()
        mock_resp.getcode.return_value = 200
        mock_resp.info.return_value = {"Content-Type": "application/pdf"}
        mock_resp.read.side_effect = [b"%PDF-1.4...", b""]

        with patch("socket.getaddrinfo") as mock_dns, patch("urllib.request.build_opener") as mock_opener:
            mock_dns.return_value = [(2, 1, 6, "", ("93.184.216.34", 80))]
            mock_inst = MagicMock()
            mock_inst.open.return_value = mock_resp
            mock_opener.return_value = mock_inst
            res = safe_fetch("http://example.com", require_html=True)
            self.assertEqual(res["error_code"], "content_type")
            self.assertEqual(res["body"], b"")


if __name__ == "__main__":
    unittest.main()
