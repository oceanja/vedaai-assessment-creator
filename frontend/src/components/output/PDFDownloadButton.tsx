"use client";

import { useEffect, useState } from "react";
import type { GeneratedPaper } from "@/types";

interface PDFDownloadButtonProps {
  paper: GeneratedPaper;
}

export default function PDFDownloadButton({ paper }: PDFDownloadButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [PDFLink, setPDFLink] = useState<React.ComponentType<any> | null>(null);
  const [PDFDoc, setPDFDoc] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamically import only on client after mount
    Promise.all([
      import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
      import("./PDFDocument").then((m) => m.default),
    ]).then(([Link, Doc]) => {
      setPDFLink(() => Link);
      setPDFDoc(() => Doc);
    }).catch(() => {
      // PDF not available, button stays hidden
    });
  }, []);

  const Icon = () => (
    <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current fill-none stroke-[2]">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );

  if (!mounted || !PDFLink || !PDFDoc) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-[8px] bg-white text-[#1a1a1a] opacity-50 border-none rounded-[8px] px-[18px] py-[9px] text-[13px] font-[600] cursor-not-allowed"
      >
        <Icon />
        Download as PDF
      </button>
    );
  }

  const DownloadLink = PDFLink;
  const Document = PDFDoc;

  return (
    <DownloadLink
      document={<Document paper={paper} />}
      fileName={`${paper.subject}-${paper.className}-question-paper.pdf`}
      className="inline-flex items-center gap-[8px] bg-white text-[#1a1a1a] border-none rounded-[8px] px-[18px] py-[9px] text-[13px] font-[600] cursor-pointer hover:bg-gray-100 transition-colors"
    >
      {({ loading }: { loading: boolean }) =>
        loading ? "Preparing PDF..." : (
          <>
            <Icon />
            Download as PDF
          </>
        )
      }
    </DownloadLink>
  );
}
