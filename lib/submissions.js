/** Re-exports for backward compatibility — all records live in plants collection. */
export {
  PLANT_STATUS as SUBMISSION_STATUS,
  PLANT_STATUS_LABELS as SUBMISSION_STATUS_LABELS,
  normalizePlant as normalizeSubmission,
  normalizePlantStatus as normalizeSubmissionStatus,
  buildStudentPlantDocument as buildSubmissionDocument,
  EMPTY_PLANT_FORM as EMPTY_SUBMISSION_FORM,
  plantToFormState as submissionToFormState,
} from "@/lib/plants";
