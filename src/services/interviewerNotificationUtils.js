// src/services/interviewerNotificationUtils.js
//
// Self-contained notification helpers for the interviewer pages.
// Used by InterviewerNotifications.jsx and InterviewerNavbar.jsx.
//
// The backend sends the read flag as "readStatus" (same as the
// candidate/admin pages use). The old mapper only checked "read" /
// "isRead", so every notification looked unread forever.

import axiosInstance from "./axiosInstance";

// Event name used to tell the navbar bell to refresh its red dot
// whenever notifications are read on the notifications page.
export const NOTIFICATIONS_UPDATED_EVENT = "interviewer-notifications-updated";

const unwrap = (response) => response?.data?.data ?? null;

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "read" || v === "1" || v === "yes";
  }
  return false;
}

function isNotificationRead(raw) {
  const value =
    raw.readStatus ??
    raw.read ??
    raw.isRead ??
    raw.seen ??
    (typeof raw.status === "string" ? raw.status : undefined);

  return toBoolean(value);
}

// "INTERVIEW_CANCELLED" -> "Interview Cancelled"
function titleFromType(type) {
  return String(type ?? "")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// "2026-10-12T10:31:40.870638" -> "12 Oct 2026, 10:31 AM"
export function formatNotificationTime(value) {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return String(value);

  const date = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${date}, ${time}`;
}

export function mapInterviewerNotification(raw) {
  const createdAt = raw.createdAt ?? raw.time ?? raw.timestamp ?? "";

  return {
    id: raw.id ?? raw.notificationId,
    type: raw.type,
    title: raw.title || titleFromType(raw.type) || "Notification",
    message: raw.message ?? "",
    createdAt,
    time: formatNotificationTime(createdAt),
    read: isNotificationRead(raw),
  };
}

// The backend can store several notifications with the same type and
// message (e.g. every cancellation says "Your assigned interview has
// been cancelled."). To the user they look like duplicates, so they are
// merged into ONE entry: the newest one is shown, it counts as unread
// if ANY copy is unread, and "mark as read" marks every copy.
//
// representative id -> all backend ids in that group
const groupedIds = new Map();

// Removes dates/times from a message so that
// "...for Candidate1 on 2026-09-30T11:00" and
// "...for Candidate1 on 2026-09-28T11:00" count as the same notification.
function stripDates(message) {
  return String(message ?? "")
    // ISO date-times: 2026-09-28T09:42:38.939 / 2026-09-17T02:31
    .replace(/\d{4}-\d{2}-\d{2}(?:[T\s]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?(?:Z|[+-]\d{2}:?\d{2})?/gi, "")
    // Other dates: 28/09/2026, 28-09-2026
    .replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, "")
    // Times: 11:00, 2:31 PM
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?\b/gi, "")
    .replace(/[\s.,]+/g, " ")
    .trim()
    .toLowerCase();
}

function groupKey(notification) {
  return [
    String(notification.type ?? "").toUpperCase(),
    stripDates(notification.message),
  ].join("|");
}

function dedupeNotifications(list) {
  const groups = new Map();

  // list is already sorted newest first, so the first one seen in a
  // group is the newest and becomes the one that is displayed.
  list.forEach((notification) => {
    const key = groupKey(notification);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        ...notification,
        ids: [notification.id],
        count: 1,
      });
      return;
    }

    existing.ids.push(notification.id);
    existing.count += 1;
    existing.read = existing.read && notification.read;
  });

  groupedIds.clear();

  return Array.from(groups.values()).map((group) => {
    groupedIds.set(String(group.id), group.ids);
    return group;
  });
}

export async function fetchInterviewerNotifications() {
  const raw = unwrap(await axiosInstance.get("/notifications/my"));
  const list = Array.isArray(raw) ? raw : [];

  const sorted = list
    .map(mapInterviewerNotification)
    // Newest first
    .sort(
      (a, b) =>
        (new Date(b.createdAt).getTime() || 0) -
        (new Date(a.createdAt).getTime() || 0)
    );

  return dedupeNotifications(sorted);
}

export async function fetchInterviewerUnreadCount() {
  const list = await fetchInterviewerNotifications();
  return list.filter((notification) => !notification.read).length;
}

// Marks the notification AND every merged duplicate of it as read.
export const markInterviewerNotificationRead = (notificationId) => {
  const ids = groupedIds.get(String(notificationId)) ?? [notificationId];

  return Promise.all(
    ids.map((id) => axiosInstance.put(`/notifications/${id}/read`))
  );
};

export const markAllInterviewerNotificationsRead = () =>
  axiosInstance.put("/notifications/read-all");

export function announceNotificationsUpdated() {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}
