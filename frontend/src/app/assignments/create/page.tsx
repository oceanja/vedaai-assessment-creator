"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Mic, CalendarPlus, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import StepProgress from "@/components/create/StepProgress";
import FileUpload from "@/components/create/FileUpload";
import QuestionTypeRow from "@/components/create/QuestionTypeRow";
import { useAssignmentStore } from "@/store/assignmentStore";
import { createAssignment } from "@/lib/api";
import { wsManager } from "@/lib/websocket";

interface FormErrors {
  title?: string;
  subject?: string;
  className?: string;
  dueDate?: string;
  questionTypes?: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    formData, setFormField, addQuestionType, removeQuestionType,
    updateQuestionType, totalQuestions, totalMarks,
    setGenerationStatus, setGenerationError, setCurrentAssignmentId,
    addAssignment, resetForm,
  } = useAssignmentStore();

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { resetForm(); }, []);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!formData.title.trim()) e.title = "Assignment title is required";
    if (!formData.subject.trim()) e.subject = "Subject is required";
    if (!formData.className.trim()) e.className = "Class is required";
    if (!formData.dueDate) e.dueDate = "Due date is required";
    if (!formData.questionTypes.length) e.questionTypes = "At least one question type is required";
    for (const qt of formData.questionTypes) {
      if (qt.count <= 0 || qt.marks <= 0) {
        e.questionTypes = "Question count and marks must be greater than 0"; break;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setGenerationStatus("queued");
    try {
      const { assignmentId } = await createAssignment(formData);
      setCurrentAssignmentId(assignmentId);
      addAssignment({
        _id: assignmentId, title: formData.title, subject: formData.subject,
        className: formData.className, schoolName: formData.schoolName,
        dueDate: formData.dueDate,
        assignedDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
        status: "queued", formData,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      wsManager.subscribe(assignmentId, (status, data, error) => {
        if (status === "done" && data) { wsManager.unsubscribe(assignmentId); router.push(`/assignments/${assignmentId}`); }
        else if (status === "error") { setGenerationStatus("error"); setGenerationError(error || "Generation failed"); setSubmitting(false); }
        else { setGenerationStatus(status); }
      });
      router.push(`/assignments/${assignmentId}`);
    } catch (err) {
      setGenerationStatus("error");
      setGenerationError(err instanceof Error ? err.message : "Failed to create assignment");
      setSubmitting(false);
    }
  }

  return (
    <AppShell breadcrumb="Assignment">
      <div className="max-w-2xl mx-auto fade-in">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Create Assignment</h1>
          </div>
          <p className="text-sm text-gray-500 ml-4">Set up a new assignment for your students</p>
        </div>

        <StepProgress currentStep={1} totalSteps={1} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="card space-y-5">
            {/* Section header */}
            <div className="flex items-start gap-3 pb-2 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-brand-orange" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Assignment Details</h2>
                <p className="text-xs text-gray-400">Basic information about your assignment</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assignment Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text" value={formData.title}
                onChange={(e) => setFormField("title", e.target.value)}
                placeholder="e.g. Quiz on Electricity"
                className={`input-field ${errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Subject + Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" value={formData.subject}
                  onChange={(e) => setFormField("subject", e.target.value)}
                  placeholder="e.g. Science"
                  className={`input-field ${errors.subject ? "border-red-300" : ""}`}
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Class <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" value={formData.className}
                  onChange={(e) => setFormField("className", e.target.value)}
                  placeholder="e.g. Grade 8"
                  className={`input-field ${errors.className ? "border-red-300" : ""}`}
                />
                {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className}</p>}
              </div>
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">School Name</label>
              <input
                type="text" value={formData.schoolName}
                onChange={(e) => setFormField("schoolName", e.target.value)}
                placeholder="e.g. Delhi Public School"
                className="input-field"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Upload Material <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <FileUpload file={formData.uploadedFile} onChange={(f) => setFormField("uploadedFile", f)} />
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                Upload reference images or documents to guide AI generation
              </p>
            </div>

            {/* Due Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Due Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date" value={formData.dueDate}
                    onChange={(e) => setFormField("dueDate", e.target.value)}
                    className={`input-field pr-10 ${errors.dueDate ? "border-red-300" : ""}`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <CalendarPlus size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Allowed</label>
                <input
                  type="text" value={formData.timeAllowed}
                  onChange={(e) => setFormField("timeAllowed", e.target.value)}
                  placeholder="e.g. 3 hours"
                  className="input-field"
                />
              </div>
            </div>

            {/* Question Types */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800">Question Types</span>
                <div className="hidden sm:flex gap-8 text-xs text-gray-400 font-medium pr-8">
                  <span>Questions</span>
                  <span>Marks each</span>
                </div>
              </div>

              {errors.questionTypes && (
                <div className="text-xs text-red-500 mb-2 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                  {errors.questionTypes}
                </div>
              )}

              <div className="divide-y divide-gray-50 bg-gray-50/50 rounded-xl px-3">
                {formData.questionTypes.map((row) => (
                  <QuestionTypeRow
                    key={row.id} row={row}
                    onUpdate={updateQuestionType} onRemove={removeQuestionType}
                    canRemove={formData.questionTypes.length > 1}
                  />
                ))}
              </div>

              <button
                type="button" onClick={addQuestionType}
                className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-orange transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                  <Plus size={13} className="group-hover:text-brand-orange transition-colors" />
                </div>
                Add Question Type
              </button>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{totalQuestions()}</p>
                  <p className="text-xs text-gray-400">Total Questions</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <p className="text-lg font-bold text-brand-orange">{totalMarks()}</p>
                  <p className="text-xs text-gray-400">Total Marks</p>
                </div>
              </div>
            </div>

            {/* Additional instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Information{" "}
                <span className="text-gray-400 font-normal">(For better AI output)</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.additionalInstructions}
                  onChange={(e) => setFormField("additionalInstructions", e.target.value)}
                  placeholder="e.g. Generate a question paper for 3 hour exam duration, focus on NCERT chapters..."
                  rows={4}
                  className="input-field resize-none pr-10"
                />
                <Mic size={15} className="absolute right-3 bottom-3 text-gray-400 cursor-pointer hover:text-brand-orange transition-colors" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <button type="button" onClick={() => router.push("/assignments")} className="btn-secondary">
              ← Previous
            </button>
            <button type="submit" disabled={submitting} className="btn-orange min-w-[140px] justify-center">
              {submitting ? (
                <><span className="spinner" /> Generating...</>
              ) : (
                <><Sparkles size={15} /> Generate Paper</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
