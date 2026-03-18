"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
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

  if (!mounted || !PDFLink || !PDFDoc) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 bg-white text-gray-400 text-sm font-medium px-4 py-1.5 rounded-xl cursor-not-allowed"
      >
        <Download size={13} />
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
      className="flex items-center gap-1.5 bg-white text-gray-900 text-sm font-medium px-4 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
    >
      {({ loading }: { loading: boolean }) =>
        loading ? "Preparing PDF..." : (
          <>
            <Download size={13} />
            Download as PDF
          </>
        )
      }
    </DownloadLink>
  );
}
