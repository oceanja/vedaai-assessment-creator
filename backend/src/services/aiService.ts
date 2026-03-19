import { GeneratedPaperSchema, type GeneratedPaper, type AssignmentFormData } from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SECTION_LABELS = ["A", "B", "C", "D", "E", "F"];

// ─── Build structured prompt ──────────────────────────────────────────────────

function buildPrompt(formData: AssignmentFormData): string {
  const { title, subject, className, schoolName, timeAllowed, questionTypes, additionalInstructions } = formData;

  const sectionDetails = questionTypes
    .map(
      (qt, idx) =>
        `Title: "Section ${SECTION_LABELS[idx]}" — Type: "${qt.type}" — ${qt.count} questions, ${qt.marks} mark(s) each`
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
4. FORMAT RULES PER QUESTION TYPE (follow these strictly):

   a) Multiple Choice Questions:
      - "text" must contain ONLY the question (no options in text)
      - "options" array is REQUIRED with exactly 4 choices: ["A) ...", "B) ...", "C) ...", "D) ..."]

   b) True/False:
      - "text" must contain the statement to evaluate
      - "options" array is REQUIRED with exactly 2 choices: ["A) True", "B) False"]

   c) Fill in the Blanks:
      - "text" must include blank(s) shown as "______" (six underscores) where the answer goes
      - Example: "The chemical formula of water is ______."
      - Do NOT include "options"

   d) Diagram/Graph-Based Questions:
      - "text" should describe what to draw or label, e.g. "Draw a labelled diagram of..."
      - Do NOT include "options"

   e) Numerical Problems:
      - "text" should include the full numerical problem with all given data
      - Do NOT include "options"

   f) Short Questions / Long Questions / Essay Questions:
      - "text" should contain the full question
      - Do NOT include "options"

5. The Section "title" must strictly be "Section A", "Section B", etc. Do NOT include the question type in the title.
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
      "title": string, // e.g. "Section A"
      "questionTypeName": string, // e.g. "Multiple Choice Questions"
      "instruction": string,
      "questions": [
        {
          "id": number,
          "text": string, // Only the question text
          "difficulty": "easy" | "medium" | "hard",
          "marks": number,
          "options": ["A) ...", "B) ..."] // REQUIRED for MCQ (4 options) and True/False (2 options), OMIT for all others
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
