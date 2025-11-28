"use client";

import type React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Code,
  Eye,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Terminal,
  Monitor,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

type ConsoleLogType = "log" | "warn" | "error" | "info";

interface ConsoleLog {
  type: ConsoleLogType;
  message: string;
  timestamp: Date;
}

interface WebPreviewProps {
  component: React.ComponentType<{
    path: string;
    navigate: (path: string) => void;
  }>;
  initialPath?: string;
  className?: string;
}

export function WebPreview({
  component: Component,
  initialPath = "/",
  className,
}: WebPreviewProps) {
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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

  const addLog = useCallback((type: ConsoleLogType, message: string) => {
    setConsoleLogs((prev) => [
      ...prev,
      { type, message, timestamp: new Date() },
    ]);
  }, []);

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
    originalConsoleRef.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    const formatArgs = (args: unknown[]) => {
      return args
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
        .join(" ");
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
              className="h-7 w-7 rounded-none text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border-l border-neutral-700"
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
                "h-5 w-5 hover:bg-neutral-700",
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
                "h-5 w-5 hover:bg-neutral-700",
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
              "h-7 w-7 hover:bg-neutral-800",
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
            className="h-7 w-7 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resizable Content and Console */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={showConsole ? 70 : 100} minSize={20}>
          <div
            ref={contentRef}
            onClick={handleContentClick}
            className="h-full bg-white overflow-auto"
          >
            <Component
              key={refreshKey}
              path={currentPath}
              navigate={navigate}
            />
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
                  className="h-5 text-xs text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 px-2"
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
                      <span className="break-all">{log.message}</span>
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
