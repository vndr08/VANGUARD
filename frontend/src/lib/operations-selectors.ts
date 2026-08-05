import type {
  OperationalEvent,
  OperationalTask,
  OperationalTrip,
  OperationsDataset,
} from "@/lib/operations-data";

export const ACTIVE_TASK_STATUSES: OperationalTask["status"][] = [
  "waiting",
  "assigned",
  "progress",
  "unloading",
];

export interface RecentOperationalEvent {
  id: OperationalEvent["id"];
  taskId: OperationalTask["id"];
  tripId: OperationalTrip["id"];
  vehicleId: number;
  occurredAt: string;
  title: string;
  metadata: string;
  href: string;
}

export interface OperationsPulse {
  activeTaskCount: number;
  lateTaskCount: number;
  completedTodayCount: number;
  runningTripCount: number;
  onTimeRate: number | null;
  activeTasks: OperationalTask[];
  lateTasks: OperationalTask[];
  completedToday: OperationalTask[];
  runningTrips: OperationalTrip[];
  recentEvents: RecentOperationalEvent[];
}

function jakartaDayBounds(nowMs: number): [number, number] {
  const jakartaOffsetMs = 7 * 60 * 60 * 1000;
  const shifted = new Date(nowMs + jakartaOffsetMs);
  const start = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate()
  ) - jakartaOffsetMs;
  return [start, start + 24 * 60 * 60 * 1000];
}

function eventCopy(
  event: OperationalEvent,
  task: OperationalTask,
  trip: OperationalTrip
): { title: string; metadata: string } {
  if (event.type === "assigned") {
    return { title: "Tugas ditugaskan", metadata: task.name };
  }
  if (event.type === "departed") {
    return { title: "Perjalanan dimulai", metadata: `${trip.origin.name} → ${trip.destination.name}` };
  }
  if (event.type === "delayed") {
    return { title: "Perjalanan terlambat", metadata: `${event.payload.delayMinutes} menit · ${task.name}` };
  }
  if (event.type === "arrived") {
    return { title: "Tiba di tujuan", metadata: trip.destination.name };
  }
  if (event.type === "unloading-started") {
    return { title: "Bongkar dimulai", metadata: trip.destination.name };
  }
  if (event.type === "completed") {
    return { title: "Tugas selesai", metadata: task.name };
  }
  if (event.type === "geofence-entered") {
    return { title: "Masuk area operasi", metadata: event.location?.name ?? task.name };
  }
  return { title: "Keluar area operasi", metadata: event.location?.name ?? task.name };
}

export function selectOperationsPulse(
  dataset: OperationsDataset,
  nowMs: number,
  recentEventLimit = 4
): OperationsPulse {
  if (!Number.isFinite(nowMs)) throw new Error("nowMs must be finite");

  const activeTasks = dataset.tasks.filter((task) =>
    ACTIVE_TASK_STATUSES.includes(task.status)
  );
  const lateTasks = activeTasks.filter(
    (task) => nowMs > Date.parse(task.plannedEndAt)
  );
  const runningTrips = dataset.trips.filter(
    (trip) => trip.status === "progress" || trip.status === "unloading"
  );
  const [dayStart, dayEnd] = jakartaDayBounds(nowMs);
  const completedToday = dataset.tasks.filter((task) => {
    if (task.status !== "completed" || !task.actualEndAt) return false;
    const actualEndMs = Date.parse(task.actualEndAt);
    return actualEndMs >= dayStart && actualEndMs < dayEnd;
  });

  const tripById = new Map(dataset.trips.map((trip) => [trip.id, trip]));
  const onTimeCohort = completedToday
    .map((task) => tripById.get(task.primaryTripId))
    .filter(
      (trip): trip is OperationalTrip =>
        Boolean(trip?.plannedArrivalAt && trip.actualArrivalAt)
    );
  const onTimeCount = onTimeCohort.filter(
    (trip) =>
      Date.parse(trip.actualArrivalAt as string) <=
      Date.parse(trip.plannedArrivalAt)
  ).length;

  const taskById = new Map(dataset.tasks.map((task) => [task.id, task]));
  const recentEvents = dataset.events
    .filter((event) => Date.parse(event.occurredAt) <= nowMs)
    .sort((a, b) => {
      const timeDifference = Date.parse(b.occurredAt) - Date.parse(a.occurredAt);
      return timeDifference || a.id.localeCompare(b.id, "id");
    })
    .slice(0, Math.max(0, recentEventLimit))
    .map((event): RecentOperationalEvent => {
      const task = taskById.get(event.taskId);
      const trip = tripById.get(event.tripId);
      if (!task || !trip) throw new Error(`${event.id} relationships are missing`);
      const copy = eventCopy(event, task, trip);
      return {
        id: event.id,
        taskId: event.taskId,
        tripId: event.tripId,
        vehicleId: event.vehicleId,
        occurredAt: event.occurredAt,
        title: copy.title,
        metadata: copy.metadata,
        href: `/history?trip=${event.tripId}&event=${event.id}`,
      };
    });

  return {
    activeTaskCount: activeTasks.length,
    lateTaskCount: lateTasks.length,
    completedTodayCount: completedToday.length,
    runningTripCount: runningTrips.length,
    onTimeRate:
      onTimeCohort.length > 0
        ? Math.round((onTimeCount / onTimeCohort.length) * 100)
        : null,
    activeTasks,
    lateTasks,
    completedToday,
    runningTrips,
    recentEvents,
  };
}

export function taskHref(taskId: OperationalTask["id"]): string {
  return `/tasks?task=${taskId}`;
}

export function tripHref(tripId: OperationalTrip["id"]): string {
  return `/history?trip=${tripId}`;
}
