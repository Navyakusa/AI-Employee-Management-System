// src/services/interviewerEvaluationStatus.js
//
// The interview API doesn't say whether feedback was already submitted,
// so the Dashboard and My Interviews pages couldn't count pending
// evaluations correctly.
//
// This uses the SAME source as the Evaluations page
// (getMyEvaluationsList), so all three pages always show the same
// Pending / Submitted numbers.

import { getMyEvaluationsList } from "./interviewerService";

const isCompleted = (interview) =>
  String(interview?.status ?? "").toLowerCase() === "completed";

const isPendingStatus = (status) =>
  String(status ?? "").trim().toLowerCase() === "pending";

export async function attachEvaluationStatus(interviews) {
  const list = Array.isArray(interviews) ? interviews : [];

  let evaluations = [];

  try {
    const data = await getMyEvaluationsList();
    evaluations = Array.isArray(data) ? data : [];
  } catch {
    evaluations = [];
  }

  // Interview ids whose evaluation is still pending.
  const pendingIds = new Set(
    evaluations
      .filter((evaluation) => isPendingStatus(evaluation.status))
      .map((evaluation) => String(evaluation.interviewId ?? evaluation.id))
  );

  return list.map((interview) => {
    if (!isCompleted(interview)) {
      return { ...interview, evaluationStatus: "Not Available" };
    }

    const id = String(interview.id ?? interview.interviewId);

    return {
      ...interview,
      evaluationStatus: pendingIds.has(id) ? "Pending" : "Submitted",
    };
  });
}
