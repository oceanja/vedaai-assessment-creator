"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Cpu,
  BookOpen,
  Settings,
  Plus,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Groups", href: "/groups", icon: Users },
  { label: "Assignments", href: "/assignments", icon: FileText, badge: null },
  { label: "AI Teacher's Toolkit", href: "/toolkit", icon: Cpu },
  { label: "My Library", href: "/library", icon: BookOpen },
];

interface SidebarProps {
  assignmentCount?: number;
}

export default function Sidebar({ assignmentCount }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[240px] min-h-screen bg-sidebar-bg flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          {/* VedaAI orange logo icon */}
          <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z"
                fill="white"
                stroke="white"
                strokeWidth="0.5"
              />
              <path d="M9 5L12 8.5L9 12L6 8.5L9 5Z" fill="#E07B39" />
            </svg>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">
            VedaAI
          </span>
        </div>
      </div>

      {/* Create Assignment button */}
      <div className="px-4 pb-4">
        <Link
          href="/assignments/create"
          className={clsx(
            "w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
            "bg-brand-orange text-white hover:bg-orange-500"
          )}
        >
          <Plus size={16} strokeWidth={2.5} />
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
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-sidebar-active text-sidebar-textActive font-medium"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-textActive"
              )}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {assignmentCount > 99 ? "99+" : assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-textActive transition-colors"
        >
          <Settings size={16} strokeWidth={1.5} />
          Settings
        </Link>

        {/* School profile */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
            D
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">
              Delhi Public School
            </p>
            <p className="text-sidebar-text text-[11px] truncate">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
