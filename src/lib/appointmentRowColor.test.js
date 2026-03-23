import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getAppointmentRowColor } from "./appointmentRowColor.js";

describe("getAppointmentRowColor", () => {
  test("past → red", () => {
    const c = getAppointmentRowColor({ date: "2000-01-01", time: "09:00" });
    assert.equal(c.bg, "#f45757");
    assert.equal(c.label, "Past");
  });

  test("future → yellow", () => {
    const c = getAppointmentRowColor({ date: "2099-12-31", time: "23:59" });
    assert.equal(c.bg, "#f5ce5b");
    assert.equal(c.label, "Future");
  });

  test("today → green", () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const c = getAppointmentRowColor({ date: `${y}-${m}-${d}`, time: "12:00" });
    assert.equal(c.bg, "#57f390");
    assert.equal(c.label, "Today");
  });

  test("ISO date from API (DATE serialized as UTC midnight) still parses Y-M-D", () => {
    const c = getAppointmentRowColor({
      date: "2000-05-10T00:00:00.000Z",
      time: "14:30:00",
    });
    assert.equal(c.label, "Past");
    assert.equal(c.bg, "#ef4444");
  });
});
