"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
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

  useEffect(() => { resetForm(); }, [resetForm]);

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
      <div className="bg-[#e8e8e8] flex items-start justify-center p-0 flex-1 overflow-y-auto">
        <form 
          onSubmit={handleSubmit} 
          noValidate
          className="bg-[#f3f3f3] border-[2.5px] border-[#8b5cf6] rounded-[14px] m-[12px] flex-1 flex flex-col overflow-hidden min-h-0 relative max-w-[800px] w-full"
        >
          <div className="px-[24px] pt-[16px] pb-0">
            <div className="flex items-center gap-[8px] mb-[3px]">
              <div className="w-[9px] h-[9px] rounded-full bg-[#22c55e]"></div>
              <div className="text-[19px] font-[700] text-[#1a1a1a]">Create Assignment</div>
            </div>
            <div className="text-[12.5px] text-[#888] mb-[12px]">Set up a new assignment for your students</div>
          </div>
          
          <div className="px-[24px] mb-[0]">
            <div className="h-[4px] bg-[#ddd] rounded-[2px] overflow-hidden">
              <div className="h-full w-1/2 bg-[#1a1a1a] rounded-[2px] transition-all duration-500"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-[24px] pt-[16px] pb-[20px] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-[#ddd] [&::-webkit-scrollbar-thumb]:rounded-[3px]">
            <div className="bg-white rounded-[14px] p-[22px]">
              <div className="text-[16px] font-[700] text-[#1a1a1a] mb-[3px]">Assignment Details</div>
              <div className="text-[12.5px] text-[#888] mb-[16px]">Basic information about your assignment</div>

              <FileUpload file={formData.uploadedFile} onChange={(f) => setFormField("uploadedFile", f)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[16px]">
                <div>
                  <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[8px]">
                    Assignment Title {errors.title && <span className="text-red-500 font-normal">({errors.title})</span>}
                  </div>
                  <div className={`flex items-center border ${errors.title ? "border-red-400" : "border-[#e0e0e0]"} rounded-[9px] px-[14px] py-[10px] bg-white mb-[18px]`}>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormField("title", e.target.value)}
                      placeholder="e.g. Quiz on Electricity" 
                      className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent placeholder:text-[#bbb]" 
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[8px]">
                    Subject {errors.subject && <span className="text-red-500 font-normal">({errors.subject})</span>}
                  </div>
                  <div className={`flex items-center border ${errors.subject ? "border-red-400" : "border-[#e0e0e0]"} rounded-[9px] px-[14px] py-[10px] bg-white mb-[18px]`}>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormField("subject", e.target.value)}
                      placeholder="e.g. Science" 
                      className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent placeholder:text-[#bbb]" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[16px]">
                <div>
                  <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[8px]">
                    Class {errors.className && <span className="text-red-500 font-normal">({errors.className})</span>}
                  </div>
                  <div className={`flex items-center border ${errors.className ? "border-red-400" : "border-[#e0e0e0]"} rounded-[9px] px-[14px] py-[10px] bg-white mb-[18px]`}>
                    <input 
                      type="text" 
                      value={formData.className}
                      onChange={(e) => setFormField("className", e.target.value)}
                      placeholder="e.g. Grade 8" 
                      className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent placeholder:text-[#bbb]" 
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[8px]">
                    School Name
                  </div>
                  <div className="flex items-center border border-[#e0e0e0] rounded-[9px] px-[14px] py-[10px] bg-white mb-[18px]">
                    <input 
                      type="text" 
                      value={formData.schoolName}
                      onChange={(e) => setFormField("schoolName", e.target.value)}
                      placeholder="e.g. Delhi Public School" 
                      className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent placeholder:text-[#bbb]" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[16px]">
                <div>
                  <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[8px]">
                    Due Date {errors.dueDate && <span className="text-red-500 font-normal">({errors.dueDate})</span>}
                  </div>
                  <div className={`flex items-center border ${errors.dueDate ? "border-red-400" : "border-[#e0e0e0]"} rounded-[9px] px-[14px] py-[10px] bg-white mb-[18px]`}>
                    <input 
                      type="date" 
                      value={formData.dueDate}
                      onChange={(e) => setFormField("dueDate", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent placeholder:text-[#bbb]" 
                    />
                    <button type="button" className="bg-transparent border-none cursor-pointer p-0 flex items-center shrink-0 ml-[8px]">
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#555] fill-none stroke-[1.8]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[8px]">
                    Time Allowed
                  </div>
                  <div className="flex items-center border border-[#e0e0e0] rounded-[9px] px-[14px] py-[10px] bg-white mb-[18px]">
                    <input 
                      type="text" 
                      value={formData.timeAllowed}
                      onChange={(e) => setFormField("timeAllowed", e.target.value)}
                      placeholder="e.g. 3 hours" 
                      className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent placeholder:text-[#bbb]" 
                    />
                  </div>
                </div>
              </div>

              <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[8px]">Question Type {errors.questionTypes && <span className="text-red-500 font-normal">({errors.questionTypes})</span>}</div>
              <div className="grid gap-[8px] pb-[6px] mb-[4px]" style={{ gridTemplateColumns: "1fr 130px 90px" }}>
                <div className="text-[12.5px] font-[600] text-[#1a1a1a]"></div>
                <div className="text-[12.5px] font-[600] text-[#1a1a1a] text-center w-full">No. of Questions</div>
                <div className="text-[12.5px] font-[600] text-[#1a1a1a] text-center w-full">Marks</div>
              </div>

              {formData.questionTypes.map((row) => (
                <QuestionTypeRow
                  key={row.id} row={row}
                  onUpdate={updateQuestionType} onRemove={removeQuestionType}
                  canRemove={formData.questionTypes.length > 1}
                />
              ))}

              <button
                type="button" onClick={addQuestionType}
                className="flex items-center gap-[8px] bg-transparent border-none cursor-pointer py-[6px] mt-[4px] mb-[14px] px-0"
              >
                <div className="w-[26px] h-[26px] rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-white fill-none stroke-[3]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span className="text-[13.5px] font-[600] text-[#1a1a1a]">Add Question Type</span>
              </button>

              <div className="text-right text-[13px] text-[#555] mb-[18px] leading-[1.7]">
                Total Questions : <b className="text-[#1a1a1a] font-[600]">{totalQuestions()}</b><br />
                Total Marks : <b className="text-[#1a1a1a] font-[600]">{totalMarks()}</b>
              </div>

              <div className="mt-[18px]">
                <div className="text-[14px] font-[600] text-[#1a1a1a] mb-[10px]">Additional Information (For better output)</div>
                <div className="relative">
                  <textarea
                    value={formData.additionalInstructions}
                    onChange={(e) => setFormField("additionalInstructions", e.target.value)}
                    className="w-full border border-[#e0e0e0] rounded-[10px] py-[13px] px-[14px] pr-[40px] text-[13px] text-[#555] bg-white resize-none outline-none min-h-[80px] font-sans placeholder:text-[#bbb]"
                    rows={3} 
                    placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  />
                  <button type="button" className="absolute bottom-[12px] right-[12px] bg-transparent border-none cursor-pointer p-0 flex items-center">
                    <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#555] fill-none stroke-[1.8]"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-[24px] py-[14px] flex items-center justify-between bg-[#f3f3f3] border-t border-[#e8e8e8]">
            <button
              type="button" 
              onClick={() => router.push("/assignments")} 
              className="flex items-center gap-[6px] bg-white border-[1.5px] border-[#ddd] rounded-[24px] px-[22px] py-[10px] text-[13.5px] font-[600] text-[#333] cursor-pointer hover:bg-[#f5f5f5]"
            >
              <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current fill-none stroke-[2.5]"><polyline points="15 18 9 12 15 6"/></svg>
              Previous
            </button>
            <button
              type="submit" 
              disabled={submitting} 
              className="flex items-center gap-[6px] bg-[#1a1a1a] border-none rounded-[24px] px-[22px] py-[10px] text-[13.5px] font-[600] text-white cursor-pointer hover:bg-[#333] disabled:bg-[#555]"
            >
              {submitting ? "Generating..." : "Next"}
              {!submitting && <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current fill-none stroke-[2.5]"><polyline points="9 18 15 12 9 6"/></svg>}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
