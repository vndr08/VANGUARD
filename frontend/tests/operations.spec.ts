import { expect, test } from "playwright/test";
import {
  OPERATIONS_DATASET,
  assertOperationsIntegrity,
} from "../src/lib/operations-data";
import { selectOperationsPulse } from "../src/lib/operations-selectors";
import {
  selectDriverAssignment,
  selectFleetState,
  selectNeedsAttention,
  selectTelemetryHealth,
} from "../src/lib/dashboard-data";
import { createFleetVehicles } from "../src/lib/fleet-data";

test("canonical operations metrics remain deterministic", () => {
  assertOperationsIntegrity(OPERATIONS_DATASET);
  const pulse = selectOperationsPulse(
    OPERATIONS_DATASET,
    OPERATIONS_DATASET.referenceTimeMs
  );

  expect(OPERATIONS_DATASET.tasks).toHaveLength(15);
  expect(pulse.activeTaskCount).toBe(11);
  expect(pulse.lateTaskCount).toBe(2);
  expect(pulse.runningTripCount).toBe(6);
  expect(pulse.completedTodayCount).toBe(4);
  expect(pulse.onTimeRate).toBe(50);
  expect(pulse.lateTasks.map((task) => task.id)).toEqual([
    "task-002",
    "task-003",
  ]);
});

test("fleet overview selectors remain deterministic", () => {
  const nowMs = Date.parse("2026-06-20T12:00:00.000Z");
  const vehicles = createFleetVehicles(nowMs);
  const fleet = selectFleetState(vehicles);
  const telemetry = selectTelemetryHealth(vehicles, nowMs);
  const drivers = selectDriverAssignment(vehicles);
  const attention = selectNeedsAttention(vehicles, nowMs);

  expect(fleet).toEqual({
    total: 15,
    driving: 7,
    idle: 2,
    stopped: 5,
    offline: 1,
    unknown: 0,
  });
  expect(telemetry).toEqual({
    total: 15,
    fresh: 14,
    delayed: 0,
    notTransmitting: 1,
    unknown: 0,
  });
  expect(drivers).toEqual({ total: 15, assigned: 15, unassigned: 0 });
  expect(attention.map(({ vehicleId, issue, href }) => ({ vehicleId, issue, href }))).toEqual([
    { vehicleId: 20, issue: "not-transmitting", href: "/tracking?focus=20" },
  ]);
});
