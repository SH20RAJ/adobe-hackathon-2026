"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function McpSetupCard({ className = "" }: { className?: string }) {
  const [activeTab, setActiveTab] = React.useState<"remote" | "cursor" | "stdio">("remote");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const mcpUrl = "https://omniaudit-geo.shraj.workers.dev/api/mcp";

  const remoteConfig = `{
  "mcpServers": {
    "omniaudit-geo": {
      "url": "https://omniaudit-geo.shraj.workers.dev/api/mcp"
    }
  }
}`;

  const stdioConfig = `{
  "mcpServers": {
    "omniaudit-geo": {
      "command": "python3",
      "args": [
        "/absolute/path/to/adobe-hackathon-2026/skills/audit-orchestrator/scripts/mcp_server.py"
      ],
      "description": "OmniAudit-GEO: Autonomous Brand AI Discoverability & Engagement Auditor"
    }
  }
}`;

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Card className={`border-border bg-card/80 backdrop-blur-md overflow-hidden ${className}`}>
      <div className="p-6 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-[11px] font-semibold">
              Live Cloudflare Remote MCP
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">JSON-RPC 2.0 / SSE</span>
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Connect OmniAudit-GEO into your AI Coding IDE
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Instant integration with Cursor, Claude Desktop, Claude Code, and Windsurf via Remote URL or Local Stdio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyText("url", mcpUrl)}
            className="text-xs font-mono h-8 px-3"
          >
            {copiedKey === "url" ? "✓ Copied URL!" : "Copy MCP URL"}
          </Button>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Switcher tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-full bg-muted/60 border border-border/50 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("remote")}
            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "remote"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Remote URL (Claude / SSE)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cursor")}
            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "cursor"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cursor IDE Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stdio")}
            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "stdio"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Local Python Stdio
          </button>
        </div>

        {/* Tab 1: Remote URL Config */}
        {activeTab === "remote" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                claude_desktop_config.json / settings.json:
              </span>
              <button
                type="button"
                onClick={() => copyText("remote-config", remoteConfig)}
                className="text-xs font-mono text-primary hover:underline cursor-pointer"
              >
                {copiedKey === "remote-config" ? "✓ Copied Config" : "Copy JSON"}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-background/90 border border-border text-xs font-mono text-foreground overflow-x-auto">
              {remoteConfig}
            </pre>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Zero local Python installation required. Runs directly against Cloudflare Workers Edge.</span>
            </div>
          </div>
        )}

        {/* Tab 2: Cursor IDE */}
        {activeTab === "cursor" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              In <strong>Cursor Settings → Features → MCP → Add New MCP Server</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-background/80 border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Name</span>
                <span className="text-xs font-mono font-semibold text-foreground">omniaudit-geo</span>
              </div>
              <div className="p-3 rounded-xl bg-background/80 border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Type</span>
                <span className="text-xs font-mono font-semibold text-foreground">sse (or url)</span>
              </div>
              <div className="p-3 rounded-xl bg-background/80 border border-border relative">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Server URL</span>
                <span className="text-xs font-mono font-semibold text-primary truncate block">
                  https://omniaudit-geo.../api/mcp
                </span>
                <button
                  type="button"
                  onClick={() => copyText("cursor-url", mcpUrl)}
                  className="mt-1 text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copiedKey === "cursor-url" ? "✓ Copied!" : "Copy Full URL"}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cursor will automatically connect and expose <code className="text-foreground font-mono">audit_website</code> directly into Agent Chat!
            </p>
          </div>
        )}

        {/* Tab 3: Local Stdio */}
        {activeTab === "stdio" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                Local offline execution via Python stdio:
              </span>
              <button
                type="button"
                onClick={() => copyText("stdio-config", stdioConfig)}
                className="text-xs font-mono text-primary hover:underline cursor-pointer"
              >
                {copiedKey === "stdio-config" ? "✓ Copied Config" : "Copy JSON"}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-background/90 border border-border text-xs font-mono text-foreground overflow-x-auto">
              {stdioConfig}
            </pre>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary font-bold">•</span>
              <span>100% offline-compatible. Uses standard library without external dependencies.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
