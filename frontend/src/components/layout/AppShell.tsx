"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: (props: any) => <svg viewBox="0 0 24 24" {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { label: "My Groups", href: "/groups", icon: (props: any) => <svg viewBox="0 0 24 24" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: "Assignments", href: "/assignments", icon: (props: any) => <svg viewBox="0 0 24 24" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { label: "AI Teacher's Toolkit", href: "/toolkit", icon: (props: any) => <svg viewBox="0 0 24 24" {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { label: "My Library", href: "/library", icon: (props: any) => <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
];

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
  assignmentCount?: number;
  headerAction?: React.ReactNode;
}

function SidebarContent({ onClose, assignmentCount }: { onClose?: () => void; assignmentCount?: number }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full w-full bg-white px-[14px] py-[18px] border-r border-[#e8e8e8]">
      {/* Logo */}
      <div className="flex items-center gap-[9px] px-[6px] pt-[4px] pb-[18px]">
        <Image src="/vedaai-logo.jpeg" alt="VedaAI" width={34} height={34} className="w-[34px] h-[34px] rounded-[7px] object-cover" />
        <span className="text-[18px] font-[700] text-[#1a1a1a]">VedaAI</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 text-[#555] md:hidden bg-transparent border-none">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Toolkit Button */}
      <Link href="/toolkit" onClick={onClose} className="flex items-center justify-center gap-[7px] bg-[#1a1a1a] text-white rounded-[24px] py-[11px] px-[14px] text-[13px] font-[600] mb-[20px] w-full outline outline-[2.5px] outline-[#e8a44a] outline-offset-0">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="white" fill="none" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        AI Teacher's Toolkit
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-[2px]">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const showBadge = label === "Assignments" && assignmentCount !== undefined && assignmentCount > 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-[10px] px-[10px] py-[9px] rounded-[7px] text-[13.5px] font-[500] transition-colors",
                active ? "bg-[#f3f3f3] text-[#1a1a1a] font-[600]" : "text-[#555] hover:bg-[#f5f5f5]"
              )}
            >
              <Icon className="w-[17px] h-[17px] shrink-0 fill-none stroke-[1.8] stroke-current" />
              {label}
              {showBadge && (
                <span className="ml-[auto] bg-[#f97316] text-white text-[10px] font-[700] rounded-[10px] px-[7px] py-[2px]">
                  {assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto space-y-[10px] pt-[2px]">
        <Link href="/settings" onClick={onClose} className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-[7px] text-[13.5px] font-[500] text-[#555] hover:bg-[#f5f5f5] transition-colors">
          <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] shrink-0 stroke-current fill-none stroke-[1.8]"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>
          Settings
        </Link>
        <div className="flex items-center gap-[10px] bg-[#f5f5f5] rounded-[10px] py-[10px] px-[12px] cursor-pointer hover:bg-[#eaeaea] transition-colors">
          <div className="w-[36px] h-[36px] rounded-full bg-[#e0c090] flex items-center justify-center text-[17px] shrink-0 overflow-hidden">
            🏫
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-[700] text-[#1a1a1a] truncate">Delhi Public School</div>
            <div className="text-[11px] text-[#777] mt-[1px] truncate">Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children, breadcrumb = "Assignment", assignmentCount, headerAction }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#ebebeb] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[218px] min-w-[218px] shrink-0 h-full">
        <SidebarContent assignmentCount={assignmentCount} />
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[300px] bg-white z-50 md:hidden">
            <SidebarContent onClose={() => setDrawerOpen(false)} assignmentCount={assignmentCount} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#ebebeb]">
        {/* Navbar */}
        <header className="h-[52px] bg-white border-b border-[#e8e8e8] flex items-center px-[18px] gap-[10px] shrink-0 z-30">
          <button onClick={() => setDrawerOpen(true)} className="md:hidden flex items-center p-[5px] text-[#555] bg-transparent border-none cursor-pointer">
            <Menu size={18} />
          </button>
          
          <button className="hidden md:flex items-center p-[5px] text-[#555] bg-transparent border-none cursor-pointer">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#555] fill-none stroke-[2]"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          
          {headerAction ? (
            headerAction
          ) : (
            <>
              <div className="hidden md:flex items-center p-[5px] text-[#888]">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-current fill-none stroke-[1.8]"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </div>
              <span className="text-[14px] font-[500] text-[#888]">{breadcrumb}</span>
            </>
          )}

          <div className="ml-auto flex items-center gap-[14px]">
            <button className="relative p-[3px] flex items-center bg-transparent border-none cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] stroke-[#555] fill-none stroke-[1.8]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="absolute top-[1px] right-[1px] w-[7px] h-[7px] bg-[#ef4444] rounded-full border-[1.5px] border-white"></span>
            </button>
            <button className="flex items-center gap-[7px] py-[3px] px-[6px] rounded-[7px] bg-transparent border-none cursor-pointer hover:bg-[#f5f5f5] transition-colors">
              <div className="w-[28px] h-[28px] rounded-full bg-[#7c3aed] flex items-center justify-center text-white overflow-hidden">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="text-[13.5px] font-[600] text-[#1a1a1a] hidden sm:block">John Doe</span>
              <span className="hidden sm:block"><svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-[#555] fill-none stroke-[2.5]"><polyline points="6 9 12 15 18 9"/></svg></span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
