"use client";

import Header from "@/components/Header";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The children prop will be page.tsx or nested layout
  // This layout is designed so that the sidebar content is passed via the `children` of this layout,
  // specifically through a slot or context.
  // However, `Sidebar` component from shadcn/ui typically expects its content to be direct children.
  // For this example, `children` will represent the main content area.
  // The sidebar's content (forms etc.) will be part of `DashboardPage` and rendered within the `<Sidebar>` component.

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
           {/* The children prop here is page.tsx, which will render the Sidebar and main content area */}
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
