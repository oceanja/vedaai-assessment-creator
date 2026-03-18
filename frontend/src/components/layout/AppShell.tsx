"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, FileText, Cpu, BookOpen,
  Settings, Plus, Bell, ChevronDown,
  Menu, X, LayoutGrid, Library,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Groups", href: "/groups", icon: Users },
  { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "AI Teacher's Toolkit", href: "/toolkit", icon: Cpu },
  { label: "My Library", href: "/library", icon: BookOpen },
];

const BOTTOM_NAV = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Groups", href: "/groups", icon: LayoutGrid },
  { label: "Library", href: "/library", icon: Library },
  { label: "AI Toolkit", href: "/toolkit", icon: Cpu },
];

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
  assignmentCount?: number;
}

function SidebarContent({ assignmentCount, onClose }: { assignmentCount?: number; onClose?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-orange flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L13 4.5V11.5L8 14.5L3 11.5V4.5L8 1.5Z" fill="white" opacity="0.9"/>
              <path d="M8 4.5L11 7.5L8 10.5L5 7.5L8 4.5Z" fill="#E07B39"/>
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-tight">VedaAI</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Create button */}
      <div className="px-4 pb-5">
        <Link
          href="/assignments/create"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
          bg-brand-orange text-white hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={15} strokeWidth={2.5} />
          Create Assignment
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const showBadge = label === "Assignments" && assignmentCount && assignmentCount > 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={active ? "nav-link-active" : "nav-link"}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {assignmentCount! > 99 ? "99+" : assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 mt-4 space-y-0.5 border-t border-white/5 pt-4">
        <Link href="/settings" onClick={onClose} className="nav-link">
          <Settings size={16} strokeWidth={1.5} />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
            D
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">Delhi Public School</p>
            <p className="text-sidebar-text text-[11px] truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children, breadcrumb = "Assignment", assignmentCount }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-page-bg">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] min-h-screen bg-sidebar-bg flex-col shrink-0 sticky top-0">
        <SidebarContent assignmentCount={assignmentCount} />
      </aside>

      {/* ── Mobile Drawer overlay ────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden overlay-fade"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar-bg z-50 md:hidden slide-in-left flex flex-col shadow-2xl">
            <SidebarContent assignmentCount={assignmentCount} onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile: hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={18} />
            </button>

            {/* Mobile: VedaAI logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-orange flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L13 4.5V11.5L8 14.5L3 11.5V4.5L8 1.5Z" fill="white" opacity="0.9"/>
                  <path d="M8 4.5L11 7.5L8 10.5L5 7.5L8 4.5Z" fill="#E07B39"/>
                </svg>
              </div>
              <span className="font-bold text-sm text-gray-900">VedaAI</span>
            </div>

            {/* Desktop: breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span className="text-gray-400 text-base">←</span>
              <span className="font-medium text-gray-700">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 pl-1 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
                J
              </div>
              <span className="hidden sm:block">John Doe</span>
              <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* ── Mobile Bottom Nav ──────────────────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar-bg border-t border-white/5 flex z-30 safe-bottom">
          {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                  active ? "text-brand-orange" : "text-sidebar-text"
                )}
              >
                <Icon size={19} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
          {/* Center FAB */}
          <Link
            href="/assignments/create"
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium text-sidebar-text"
          >
            <div className="w-9 h-9 -mt-5 rounded-full bg-brand-orange flex items-center justify-center shadow-lg shadow-orange-500/30 border-4 border-sidebar-bg">
              <Plus size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="mt-0.5">New</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
