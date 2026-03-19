import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { Assignment } from "../models/Assignment";
import { generateQuestionPaper } from "../services/aiService";
import type { AssignmentFormData, QuestionTypeRow } from "../types";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

const router = Router();

// ─── Multer setup (local disk storage) ───────────────────────────────────────

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "uploads"),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed"));
    }
  },
});

// ─── POST /assignments — create + enqueue ─────────────────────────────────────

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        title,
        subject,
        className,
        schoolName,
        dueDate,
        timeAllowed,
        questionTypes: rawQuestionTypes,
        additionalInstructions,
      } = req.body as {
        title: string;
        subject: string;
        className: string;
        schoolName: string;
        dueDate: string;
        timeAllowed: string;
        questionTypes: string;
        additionalInstructions: string;
      };

      // Validate required fields
      if (!title?.trim() || !subject?.trim() || !className?.trim() || !dueDate) {
        res.status(400).json({
          success: false,
          error: "title, subject, className, and dueDate are required",
        });
        return;
      }

      let questionTypes: QuestionTypeRow[] = [];
      try {
        questionTypes = JSON.parse(rawQuestionTypes || "[]");
      } catch {
        res.status(400).json({ success: false, error: "Invalid questionTypes" });
        return;
      }

      if (!questionTypes.length) {
        res.status(400).json({ success: false, error: "At least one question type is required" });
        return;
      }

      // Validate no negative/zero values
      for (const qt of questionTypes) {
        if (qt.count <= 0 || qt.marks <= 0) {
          res.status(400).json({
            success: false,
            error: "Question count and marks must be positive",
          });
          return;
        }
      }

      const uploadedFileUrl = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const formData: AssignmentFormData = {
        title: title.trim(),
        subject: subject.trim(),
        className: className.trim(),
        schoolName: (schoolName || "Delhi Public School").trim(),
        dueDate,
        timeAllowed: timeAllowed || "3 hours",
        questionTypes,
        additionalInstructions: additionalInstructions || "",
        uploadedFileUrl,
      };

      // Create assignment in MongoDB
      const assignment = await Assignment.create({
        title: formData.title,
        subject: formData.subject,
        className: formData.className,
        schoolName: formData.schoolName,
        dueDate: formData.dueDate,
        assignedDate: formatDate(new Date()),
        status: "processing",
        formData,
      });

      const assignmentId = assignment._id.toString();

      // Respond immediately so frontend can navigate to detail page
      res.status(201).json({
        success: true,
        data: { assignmentId, status: "processing" },
      });

      // Process AI generation in background (no Redis needed)
      (async () => {
        try {
          const generatedPaper = await generateQuestionPaper(formData);
          await Assignment.findByIdAndUpdate(assignmentId, { status: "done", generatedPaper });
          console.log(`[Generate] Done — ${assignmentId}`);
        } catch (err) {
          console.error(`[Generate] Failed — ${assignmentId}:`, err);
          await Assignment.findByIdAndUpdate(assignmentId, {
            status: "error",
            errorMessage: (err as Error).message,
          });
        }
      })();
    } catch (err) {
      console.error("[POST /assignments]", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// ─── GET /assignments — list all ──────────────────────────────────────────────

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select("-formData.uploadedFile")
      .lean();

    res.json({ success: true, data: assignments });
  } catch (err) {
    console.error("[GET /assignments]", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ─── GET /assignments/:id — single ────────────────────────────────────────────

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }
    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error("[GET /assignments/:id]", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ─── DELETE /assignments/:id ──────────────────────────────────────────────────

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }
    res.json({ success: true, data: null });
  } catch (err) {
    console.error("[DELETE /assignments/:id]", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ─── POST /assignments/:id/regenerate ─────────────────────────────────────────

router.post("/:id/regenerate", async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    const assignmentId = req.params.id;

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "processing",
      generatedPaper: undefined,
      errorMessage: undefined,
    });

    res.json({ success: true, data: null });

    // Process AI generation in background (no Redis needed)
    (async () => {
      try {
        const generatedPaper = await generateQuestionPaper(assignment.formData);
        await Assignment.findByIdAndUpdate(assignmentId, { status: "done", generatedPaper });
        console.log(`[Regenerate] Done — ${assignmentId}`);
      } catch (err) {
        console.error(`[Regenerate] Failed — ${assignmentId}:`, err);
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "error",
          errorMessage: (err as Error).message,
        });
      }
    })();
  } catch (err) {
    console.error("[POST /assignments/:id/regenerate]", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
