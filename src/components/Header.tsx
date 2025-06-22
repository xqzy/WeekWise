"use client";

import Link from "next/link";
import { Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar"; // Assuming SidebarTrigger is used for mobile

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="WeekWise Home">
          <Zap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-headline font-bold text-foreground">
            WeekWise
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {isDashboard && (
            <>
              {/* Placeholder for potential settings or user profile actions */}
              {/* <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings className="h-5 w-5" />
              </Button> */}
              <div className="md:hidden"> {/* Show SidebarTrigger only on mobile for dashboard */}
                <SidebarTrigger />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
