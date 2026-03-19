"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { Assignment } from "@/types";

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-[14px] p-[24px_20px_22px_20px] flex flex-col relative cursor-pointer min-h-[160px]">
      <div className="flex items-start justify-between">
        <div className="text-[17px] font-[700] text-[#1a1a1a] leading-[1.3] pr-[10px]">
          {assignment.title}
        </div>
        <div ref={menuRef} className="relative shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="bg-transparent border-none cursor-pointer p-[2px_4px] flex flex-col gap-[3.5px] items-center shrink-0 mt-[2px] transition-transform hover:scale-110"
          >
            <div className="w-[4px] h-[4px] rounded-full bg-[#b0b0b0]"></div>
            <div className="w-[4px] h-[4px] rounded-full bg-[#b0b0b0]"></div>
            <div className="w-[4px] h-[4px] rounded-full bg-[#b0b0b0]"></div>
          </button>
          
          {menuOpen && (
            <div className="absolute top-[30px] right-0 bg-white rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] min-w-[165px] z-[100] overflow-hidden py-1 border border-[#f0f0f0]">
              <Link
                href={`/assignments/${assignment._id}`}
                className="block w-full text-left px-[18px] py-[11px] text-[14px] text-[#1a1a1a] hover:bg-[#f5f5f5] cursor-pointer transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                View Assignment
              </Link>
              <div className="h-[1px] bg-[#f0f0f0]"></div>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(assignment._id); }}
                className="block w-full text-left px-[18px] py-[11px] text-[14px] text-[#ef4444] hover:bg-[#f5f5f5] cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-[28px]">
        <div className="text-[13px] text-[#222]">
          <b className="font-[700]">Assigned on</b> : {assignment.assignedDate || "N/A"}
        </div>
        {assignment.dueDate && (
          <div className="text-[13px] text-[#222]">
            <b className="font-[700]">Due</b> : {assignment.dueDate}
          </div>
        )}
      </div>
    </div>
  );
}
