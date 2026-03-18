"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { GeneratedPaper, Difficulty } from "@/types";

// Register fonts
Font.register({
  family: "Times-New-Roman",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
  ],
});

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "#059669",
  medium: "#D97706",
  hard: "#DC2626",
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#111827",
    lineHeight: 1.5,
  },
  center: { textAlign: "center" },
  schoolName: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 11, textAlign: "center", marginBottom: 2 },
  divider: { borderBottom: "1pt solid #9CA3AF", marginVertical: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  bold: { fontFamily: "Helvetica-Bold" },
  italic: { fontFamily: "Helvetica-Oblique", color: "#4B5563" },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 6, marginTop: 8 },
  questionTypeTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  questionRow: { flexDirection: "row", marginBottom: 6 },
  questionNum: { width: 20, fontFamily: "Helvetica-Bold" },
  questionContent: { flex: 1 },
  badgeRow: { flexDirection: "row", gap: 4, marginTop: 2, flexWrap: "wrap" },
  badge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, fontSize: 8 },
  marksText: { fontSize: 9, color: "#6B7280" },
  footer: { textAlign: "center", fontFamily: "Helvetica-Bold", marginTop: 12, borderTop: "1pt solid #D1D5DB", paddingTop: 8 },
  answerKeyTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 16, marginBottom: 6, borderTop: "1pt dashed #D1D5DB", paddingTop: 8 },
  studentInfo: { marginBottom: 16 },
  infoRow: { flexDirection: "row", marginBottom: 6 },
  infoLabel: { width: 80 },
  infoLine: { flex: 1, borderBottom: "0.5pt solid #374151" },
});

interface PDFDocumentProps {
  paper: GeneratedPaper;
}

export default function PDFDocument({ paper }: PDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.schoolName}>{paper.schoolName}</Text>
        <Text style={styles.subtitle}>Subject: {paper.subject}</Text>
        <Text style={styles.subtitle}>Class: {paper.className}</Text>
        <View style={styles.divider} />

        {/* Time + Marks */}
        <View style={styles.row}>
          <Text style={styles.bold}>Time Allowed: {paper.timeAllowed}</Text>
          <Text style={styles.bold}>Maximum Marks: {paper.maxMarks}</Text>
        </View>

        {/* Instruction */}
        <Text style={[styles.italic, { marginBottom: 10 }]}>
          {paper.generalInstruction}
        </Text>

        {/* Student info */}
        <View style={styles.studentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Roll Number:</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Class: {paper.className} Section:</Text>
            <View style={[styles.infoLine, { maxWidth: 60 }]} />
          </View>
        </View>

        {/* Sections */}
        {paper.sections.map((section, idx) => (
          <View key={idx}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.questionTypeTitle}>{section.questionTypeName}</Text>
            <Text style={[styles.italic, { marginBottom: 6 }]}>{section.instruction}</Text>

            {section.questions.map((q) => (
              <View key={q.id} style={styles.questionRow}>
                <Text style={styles.questionNum}>{q.id}.</Text>
                <View style={styles.questionContent}>
                  <Text>{q.text}</Text>
                  <View style={styles.badgeRow}>
                    <Text
                      style={[
                        styles.badge,
                        { color: DIFFICULTY_COLORS[q.difficulty], backgroundColor: `${DIFFICULTY_COLORS[q.difficulty]}15` },
                      ]}
                    >
                      {DIFFICULTY_LABELS[q.difficulty]}
                    </Text>
                    <Text style={styles.marksText}>
                      [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* End */}
        <Text style={styles.footer}>End of Question Paper</Text>

        {/* Answer Key */}
        {paper.answerKey.length > 0 && (
          <View>
            <Text style={styles.answerKeyTitle}>Answer Key:</Text>
            {paper.answerKey.map((ak, idx) => (
              <View key={idx} style={styles.questionRow}>
                <Text style={styles.questionNum}>{ak.questionId}.</Text>
                <Text style={styles.questionContent}>{ak.answer}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
