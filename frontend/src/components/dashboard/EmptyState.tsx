import Link from "next/link";
import { Plus } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center px-4 fade-in">
      {/* Illustration */}
      <div className="relative mb-8">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-brand-orange/10 blur-2xl scale-150" />

        <div className="relative w-36 h-36 md:w-44 md:h-44">
          <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Background circle */}
            <circle cx="90" cy="90" r="80" fill="#F9FAFB" stroke="#F3F4F6" strokeWidth="2"/>

            {/* Paper stack shadow */}
            <rect x="50" y="52" width="72" height="88" rx="8" fill="#E5E7EB" transform="rotate(4 50 52)"/>
            <rect x="48" y="50" width="72" height="88" rx="8" fill="#F3F4F6" transform="rotate(2 48 50)"/>

            {/* Main paper */}
            <rect x="44" y="44" width="76" height="94" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>

            {/* Lines on paper */}
            <rect x="56" y="62" width="44" height="5" rx="2.5" fill="#E5E7EB"/>
            <rect x="56" y="74" width="36" height="4" rx="2" fill="#F3F4F6"/>
            <rect x="56" y="84" width="40" height="4" rx="2" fill="#F3F4F6"/>
            <rect x="56" y="94" width="30" height="4" rx="2" fill="#F3F4F6"/>
            <rect x="56" y="104" width="38" height="4" rx="2" fill="#F3F4F6"/>

            {/* Red X badge */}
            <circle cx="106" cy="112" r="22" fill="white" stroke="#FEE2E2" strokeWidth="2"/>
            <circle cx="106" cy="112" r="17" fill="#FEF2F2"/>
            <path d="M99 105L113 119M113 105L99 119" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>

            {/* Orange sparkles */}
            <circle cx="44" cy="48" r="5" fill="#FEF3C7"/>
            <path d="M44 44V52M40 48H48" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="136" cy="62" r="4" fill="#DBEAFE"/>
            <path d="M136 58.5V65.5M132.5 62H139.5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="38" cy="115" r="3.5" fill="#D1FAE5"/>
            <circle cx="142" cy="98" r="3" fill="#E9D5FF"/>

            {/* AI stars */}
            <path d="M128 42L130 46L134 48L130 50L128 54L126 50L122 48L126 46L128 42Z" fill="#E07B39" opacity="0.8"/>
          </svg>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
        No assignments yet
      </h2>
      <p className="text-sm md:text-base text-gray-500 max-w-sm mb-8 leading-relaxed">
        Create your first AI-powered assignment to start collecting and grading student
        submissions. Let AI assist with question generation and grading.
      </p>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {["AI Generation", "PDF Export", "Difficulty Levels", "Answer Keys"].map((f) => (
          <span key={f} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full shadow-sm font-medium">
            ✦ {f}
          </span>
        ))}
      </div>

      <Link href="/assignments/create" className="btn-orange text-base px-6 py-3 shadow-xl shadow-orange-500/20">
        <Plus size={17} strokeWidth={2.5} />
        Create Your First Assignment
      </Link>

      <p className="text-xs text-gray-400 mt-4">Takes less than a minute</p>
    </div>
  );
}
