import { GeneratedPaperSchema, type GeneratedPaper, type AssignmentFormData } from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SECTION_LABELS = ["A", "B", "C", "D", "E", "F"];

// ─── Build structured prompt ──────────────────────────────────────────────────

function buildPrompt(formData: AssignmentFormData): string {
  const { title, subject, className, schoolName, timeAllowed, questionTypes, additionalInstructions } = formData;

  const sectionDetails = questionTypes
    .map(
      (qt, idx) =>
        `Section ${SECTION_LABELS[idx]}: ${qt.type} — ${qt.count} questions, ${qt.marks} mark(s) each`
    )
    .join("\n");

  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  return `You are an expert teacher creating a professional examination question paper.

Generate a question paper with the following specifications:
- School: ${schoolName}
- Subject: ${subject}
- Class: ${className}
- Assignment Title: ${title}
- Time Allowed: ${timeAllowed}
- Total Marks: ${totalMarks}

Sections:
${sectionDetails}

Additional Instructions from teacher:
${additionalInstructions || "None"}

IMPORTANT RULES:
1. Questions must be academically appropriate for ${className} students studying ${subject}
2. Distribute difficulty: roughly 40% easy, 40% medium, 20% hard per section
3. Each question must be clear, unambiguous, and educational
4. For Multiple Choice Questions, always include an "options" array with exactly 4 choices formatted as ["A) ...", "B) ...", "C) ...", "D) ..."]
5. For all other question types (short, long, diagram, numerical etc.), do NOT include "options"
6. Return ONLY valid JSON, no markdown, no explanation, no code fences

Return a JSON object matching EXACTLY this structure:
{
  "schoolName": string,
  "subject": string,
  "className": string,
  "timeAllowed": string,
  "maxMarks": number,
  "generalInstruction": string,
  "sections": [
    {
      "title": string,
      "questionTypeName": string,
      "instruction": string,
      "questions": [
        {
          "id": number,
          "text": string,
          "difficulty": "easy" | "medium" | "hard",
          "marks": number,
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."] // ONLY include for Multiple Choice questions, omit for all other types
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionId": number,
      "sectionTitle": string,
      "answer": string
    }
  ]
}

Question IDs must be globally sequential (1, 2, 3...) across all sections.`;
}

// ─── Call Groq API and parse/validate response ────────────────────────────────

export async function generateQuestionPaper(
  formData: AssignmentFormData
): Promise<GeneratedPaper> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment");

  const prompt = buildPrompt(formData);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const result = await response.json() as {
    choices: { message: { content: string } }[];
  };

  const rawText = result.choices[0]?.message?.content || "";

  // Strip accidental markdown fences
  const jsonText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`AI returned invalid JSON: ${jsonText.slice(0, 200)}`);
  }

  // Validate with Zod — never trust raw AI output
  const validated = GeneratedPaperSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`AI response failed schema validation: ${validated.error.message}`);
  }

  return validated.data;
}
