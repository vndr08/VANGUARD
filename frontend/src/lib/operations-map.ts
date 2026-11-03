import type { MapVehicle } from "@/components/map/types";
import { toMapVehicle } from "@/lib/fleet-data";
import { OPERATIONS_DATASET } from "@/lib/operations-data";
import type { Vehicle } from "@/types";

const taskByVehicleId = new Map(
  OPERATIONS_DATASET.tasks.map((task) => [task.vehicleId, task])
);
const tripById = new Map(
  OPERATIONS_DATASET.trips.map((trip) => [trip.id, trip])
);

export function getOperationalTaskLabel(vehicleId: number): string | undefined {
  return taskByVehicleId.get(vehicleId)?.name;
}

/**
 * Projects the canonical operations dataset into the map contract.
 * Vehicle telemetry remains the source for position and state; task/trip data
 * supplies the route and label that accompany that vehicle on every map.
 */
export function toOperationalMapVehicle(vehicle: Vehicle): MapVehicle {
  const mapVehicle = toMapVehicle(vehicle);
  const task = taskByVehicleId.get(vehicle.id);
  const trip = task ? tripById.get(task.primaryTripId) : undefined;

  if (!task || !trip) return mapVehicle;

  return {
    ...mapVehicle,
    taskLabel: task.name,
    routePlanned: [
      { lng: trip.origin.longitude, lat: trip.origin.latitude },
      { lng: trip.destination.longitude, lat: trip.destination.latitude },
    ],
    routeActual: trip.track.map((point) => ({
      lng: point.longitude,
      lat: point.latitude,
    })),
    // The canonical operations contract has no route-deviation entity yet.
    // Do not carry an unrelated legacy deviation marker into this trip.
    deviationPoints: [],
  };
}
