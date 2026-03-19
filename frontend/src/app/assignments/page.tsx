"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/dashboard/EmptyState";
import AssignmentCard from "@/components/dashboard/AssignmentCard";
import { useAssignmentStore } from "@/store/assignmentStore";
import { getAssignments, deleteAssignment } from "@/lib/api";

export default function AssignmentsPage() {
  const { assignments, setAssignments, removeAssignment } = useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssignments()
      .then(setAssignments)
      .catch(() => setError("Failed to load assignments"))
      .finally(() => setLoading(false));
  }, [setAssignments]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await deleteAssignment(id);
      removeAssignment(id);
    } catch {
      alert("Failed to delete assignment");
    }
  };

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell breadcrumb="Assignment" assignmentCount={assignments.length}>
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#e8a44a]" />
          <p className="text-sm text-[#777]">Loading assignments...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col text-center justify-center items-center py-16">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#1a1a1a] text-sm underline font-semibold"
          >
            Try again
          </button>
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 flex flex-col relative w-full overflow-y-auto bg-[#ebebeb]">
          {/* Header */}
          <div className="pt-[20px] px-[24px] pb-[4px]">
            <div className="flex items-center gap-[10px] mb-[3px]">
              <div className="w-[10px] h-[10px] rounded-full bg-[#22c55e]"></div>
              <h1 className="text-[22px] font-[700] text-[#1a1a1a]">Assignments</h1>
            </div>
            <div className="text-[13.5px] text-[#888] pl-[20px] mb-[14px]">
              Manage and create assignments for your classes.
            </div>
          </div>

          {/* Filter Row */}
          <div className="px-[24px] pb-[16px]">
            <div className="w-full flex items-center justify-between bg-white border border-[#eaeaea] rounded-[30px] py-[10px] pl-[20px] pr-[20px]">
              <button className="flex items-center gap-[8px] bg-transparent border-none cursor-pointer text-[#777] text-[13.5px] font-[600] tracking-wide hover:text-[#1a1a1a] transition-colors p-0">
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter By
              </button>
              <div className="flex items-center gap-[10px] w-full max-w-[280px] bg-[#f5f5f5] border border-[#e8e8e8] rounded-[24px] py-[8px] px-[14px]">
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-[#a3a3a3] fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-none outline-none text-[13.5px] font-[500] text-[#1a1a1a] bg-transparent w-full placeholder-[#a3a3a3] p-0"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="text-center text-[#777] text-[14px] py-16">No assignments match your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] px-[24px] pb-[100px]">
              {filtered.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Floating Action Button — fixed to bottom of viewport, centered in content area */}
          <div className="fixed bottom-0 md:left-[150px] left-0 right-0 h-[90px] bg-gradient-to-t from-[#ebebeb] via-[#ebebeb]/80 to-transparent pointer-events-none z-40 flex items-end justify-center pb-[24px]">
            <Link href="/assignments/create" className="pointer-events-auto bg-[#1a1a1a] text-white rounded-[28px] py-[13px] px-[28px] text-[14px] font-[600] flex items-center justify-center gap-[8px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all hover:scale-105 active:scale-95 hover:bg-[#333]">
              <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-white fill-none stroke-[2.5]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Assignment
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}
