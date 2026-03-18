"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus, Loader2 } from "lucide-react";
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
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-6 fade-in">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and create assignments for your classes.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 size={28} className="animate-spin text-brand-orange" />
            <p className="text-sm text-gray-400">Loading assignments...</p>
          </div>
        ) : error ? (
          <div className="card text-center py-16">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-brand-orange text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="fade-in">
            {/* Search + filter row */}
            <div className="flex items-center gap-2 md:gap-3 mb-5">
              <button className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
                <SlidersHorizontal size={13} />
                <span className="hidden sm:inline">Filter by</span>
              </button>

              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Total", value: assignments.length, color: "text-gray-700" },
                { label: "Ready", value: assignments.filter(a => a.status === "done").length, color: "text-emerald-600" },
                { label: "In Progress", value: assignments.filter(a => ["queued","processing"].includes(a.status)).length, color: "text-amber-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 shadow-card text-center">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-16">No assignments match your search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((assignment) => (
                  <AssignmentCard key={assignment._id} assignment={assignment} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {/* FAB on desktop */}
            <div className="hidden md:flex fixed bottom-8 right-8">
              <Link href="/assignments/create" className="btn-orange shadow-xl shadow-orange-500/20 px-5 py-3 rounded-full">
                <Plus size={16} strokeWidth={2.5} />
                Create Assignment
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
