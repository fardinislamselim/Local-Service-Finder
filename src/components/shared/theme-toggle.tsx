"use client";

import * as React from "react";
import { Moon, Sun, Laptop, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full border border-border/50 bg-background/50 pointer-events-none opacity-60"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 text-muted-foreground/40" />
      </Button>
    );
  }

  const currentTheme = theme || "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border border-border/60 bg-background/60 hover:bg-accent hover:border-border/80 transition-all duration-200 shadow-sm focus-visible:ring-1 focus-visible:ring-primary group"
          title={`Active theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`}
          aria-label="Toggle theme settings"
        >
          {/* Sun icon with smooth rotation and scale */}
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0 text-amber-500 group-hover:rotate-45" />

          {/* Moon icon with smooth rotation and scale */}
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100 text-sky-400 group-hover:-rotate-12" />

          <span className="sr-only">Toggle theme (current: {currentTheme})</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-36 p-1.5 shadow-lg border border-border/80 backdrop-blur bg-popover/95 rounded-xl space-y-0.5"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center transition-colors ${
            currentTheme === "light"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500 mr-2" />
          <span>Light</span>
          {currentTheme === "light" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center transition-colors ${
            currentTheme === "dark"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Moon className="h-3.5 w-3.5 text-sky-400 mr-2" />
          <span>Dark</span>
          {currentTheme === "dark" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center transition-colors ${
            currentTheme === "system"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Laptop className="h-3.5 w-3.5 text-muted-foreground mr-2" />
          <span>System</span>
          {currentTheme === "system" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
