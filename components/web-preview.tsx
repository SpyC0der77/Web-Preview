"use client";

import React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Code,
  Copy,
  Eye,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Terminal,
  Monitor,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type ConsoleLogType = "log" | "warn" | "error" | "info";

interface ConsoleLogPart {
  text: string;
  style?: string;
}

interface ConsoleLog {
  type: ConsoleLogType;
  parts: ConsoleLogPart[];
  timestamp: Date;
}

interface WebPreviewProps {
  component: React.ComponentType<{
    path: string;
    navigate: (path: string) => void;
  }>;
  code?: string;
  initialPath?: string;
  className?: string;
}

class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Preview component error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 bg-red-50">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Preview Error
          </h2>
          <p className="text-red-600 text-center mb-4">
            The preview component encountered an error and couldn't render
            properly.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          {this.state.error && (
            <details className="mt-4 w-full max-w-md">
              <summary className="cursor-pointer text-red-700 hover:text-red-900">
                Error Details
              </summary>
              <pre className="mt-2 p-2 bg-red-100 text-red-900 text-xs rounded overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export function WebPreview({
  component: Component,
  code,
  initialPath = "/",
  className,
}: WebPreviewProps) {
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const contentRef = useRef<HTMLDivElement>(null);
  const originalConsoleRef = useRef<{
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
  } | null>(null);

  const currentPath = history[historyIndex];
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const navigate = useCallback(
    (path: string) => {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), path]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const goBack = useCallback(() => {
    if (canGoBack) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [canGoBack]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      setHistoryIndex((prev) => prev + 1);
    }
  }, [canGoForward]);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      contentRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(document.fullscreenElement === contentRef.current);
  }, []);

  const parseStyle = (styleStr: string): React.CSSProperties => {
    const style: React.CSSProperties = {};
    const rules = styleStr
      .split(";")
      .map((r) => r.trim())
      .filter((r) => r);
    for (const rule of rules) {
      const [prop, value] = rule.split(":").map((s) => s.trim());
      if (prop && value) {
        const camelProp = prop.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        (style as any)[camelProp] = value;
      }
    }
    return style;
  };

  const addLog = useCallback(
    (type: ConsoleLogType, parts: ConsoleLogPart[]) => {
      setConsoleLogs((prev) => [
        ...prev,
        { type, parts, timestamp: new Date() },
      ]);
    },
    []
  );

  const handleContentClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && (href.startsWith("/") || href.startsWith("#"))) {
          e.preventDefault();
          navigate(href);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [handleFullscreenChange]);

  useEffect(() => {
    originalConsoleRef.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    const formatArgs = (args: unknown[]): ConsoleLogPart[] => {
      if (args.length === 0) return [{ text: "" }];

      const first = args[0];
      if (typeof first === "string" && first.includes("%c")) {
        const parts: ConsoleLogPart[] = [];
        const segments = first.split("%c");
        let styleIndex = 1;
        for (let i = 0; i < segments.length; i++) {
          const text = segments[i];
          if (text) {
            const style =
              i > 0 && styleIndex < args.length
                ? (args[styleIndex++] as string)
                : undefined;
            parts.push({ text, style });
          }
        }
        // remaining args
        for (let i = styleIndex; i < args.length; i++) {
          parts.push({
            text:
              typeof args[i] === "object"
                ? JSON.stringify(args[i], null, 2)
                : String(args[i]),
          });
        }
        return parts;
      } else {
        const text = args
          .map((arg) => {
            if (typeof arg === "object") {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          })
          .join(" ")
          .replace(/\x1b\[[0-9;]*m/g, ""); // strip ANSI escape codes
        return [{ text }];
      }
    };

    console.log = (...args: unknown[]) => {
      originalConsoleRef.current?.log(...args);
      addLog("log", formatArgs(args));
    };

    console.warn = (...args: unknown[]) => {
      originalConsoleRef.current?.warn(...args);
      addLog("warn", formatArgs(args));
    };

    console.error = (...args: unknown[]) => {
      originalConsoleRef.current?.error(...args);
      addLog("error", formatArgs(args));
    };

    console.info = (...args: unknown[]) => {
      originalConsoleRef.current?.info(...args);
      addLog("info", formatArgs(args));
    };

    return () => {
      if (originalConsoleRef.current) {
        console.log = originalConsoleRef.current.log;
        console.warn = originalConsoleRef.current.warn;
        console.error = originalConsoleRef.current.error;
        console.info = originalConsoleRef.current.info;
      }
    };
  }, [addLog]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-neutral-800 overflow-hidden bg-neutral-950",
        className
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-neutral-900 border-b border-neutral-800">
        {/* Left Controls */}
        <div className="flex items-center gap-0.5">
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button> */}
          <div className="flex items-center border border-neutral-700 rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-none hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer",
                viewMode === "preview"
                  ? "text-neutral-200 bg-neutral-800"
                  : "text-neutral-400"
              )}
              onClick={() => setViewMode("preview")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-none hover:text-neutral-200 hover:bg-neutral-800 border-l border-neutral-700 cursor-pointer",
                viewMode === "code"
                  ? "text-neutral-200 bg-neutral-800"
                  : "text-neutral-400"
              )}
              onClick={() => setViewMode("code")}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center - URL Bar */}
        <div className="flex items-center gap-1 bg-neutral-800 rounded-md px-2 py-1 min-w-[200px]">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-5 w-5 hover:bg-neutral-700 cursor-pointer",
                canGoBack ? "text-neutral-300" : "text-neutral-600"
              )}
              onClick={goBack}
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-5 w-5 hover:bg-neutral-700 cursor-pointer",
                canGoForward ? "text-neutral-300" : "text-neutral-600"
              )}
              onClick={goForward}
              disabled={!canGoForward}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700"
          >
            <Monitor className="h-3 w-3" />
          </Button> */}
          <span className="text-sm text-neutral-400 px-1">{currentPath}</span>
          {/* <div className="flex items-center gap-0.5 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700"
              onClick={refresh}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div> */}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 hover:bg-neutral-800 cursor-pointer",
              showConsole
                ? "text-neutral-200 bg-neutral-800 hover:text-neutral-300 hover:bg-neutral-600"
                : "text-neutral-400 hover:text-neutral-200"
            )}
            onClick={() => setShowConsole(!showConsole)}
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content and Console */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={showConsole ? 70 : 100} minSize={20}>
          <div
            ref={contentRef}
            onClick={handleContentClick}
            className="h-full bg-white overflow-auto"
          >
            {viewMode === "preview" ? (
              <ErrorBoundary key={refreshKey}>
                <Component path={currentPath} navigate={navigate} />
              </ErrorBoundary>
            ) : (
              <div className="h-full bg-neutral-950 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800">
                  <span className="text-xs font-medium text-neutral-400">
                    Code
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-xs text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 px-2 cursor-pointer"
                    onClick={() =>
                      navigator.clipboard.writeText(code || "No code provided")
                    }
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language="jsx"
                    style={oneDark}
                    showLineNumbers
                    className="h-full text-xs !bg-neutral-900 !m-0"
                  >
                    {code || "No code provided"}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
        {showConsole && <ResizableHandle />}
        {showConsole && (
          <ResizablePanel defaultSize={30} minSize={10}>
            <div className="h-full bg-neutral-950 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800">
                <span className="text-xs font-medium text-neutral-400">
                  Console
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 px-2 cursor-pointer"
                  onClick={() => setConsoleLogs([])}
                >
                  Clear
                </Button>
              </div>
              <div className="flex-1 overflow-auto font-mono text-xs p-2 space-y-1">
                {consoleLogs.length === 0 ? (
                  <div className="text-neutral-600 italic">
                    No console output
                  </div>
                ) : (
                  consoleLogs.map((log, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2 py-0.5 px-1 rounded",
                        log.type === "error" && "bg-red-950/50 text-red-400",
                        log.type === "warn" &&
                          "bg-yellow-950/50 text-yellow-400",
                        log.type === "info" && "text-blue-400",
                        log.type === "log" && "text-neutral-300"
                      )}
                    >
                      <span className="text-neutral-600 shrink-0">
                        {log.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                      <span className="break-all">
                        {log.parts.map((part, i) => (
                          <span
                            key={i}
                            style={
                              part.style ? parseStyle(part.style) : undefined
                            }
                          >
                            {part.text}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
