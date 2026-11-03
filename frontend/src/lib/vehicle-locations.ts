export interface VehicleOperationalLocation {
  vehicleId: number;
  label: string;
}

const VEHICLE_OPERATIONAL_LOCATIONS: VehicleOperationalLocation[] = [
  { vehicleId: 1, label: "Koridor Jakarta - Bekasi" },
  { vehicleId: 2, label: "Koridor Bekasi - Tangerang" },
  { vehicleId: 3, label: "Bandung DC" },
  { vehicleId: 4, label: "Semarang Hub" },
  { vehicleId: 5, label: "Surabaya Hub" },
  { vehicleId: 6, label: "Cirebon Hub" },
  { vehicleId: 7, label: "Koridor Karawang - Cikarang" },
  { vehicleId: 8, label: "Jakarta Hub" },
  { vehicleId: 9, label: "Jakarta Barat Hub" },
  { vehicleId: 10, label: "Surabaya Hub" },
  { vehicleId: 11, label: "Jakarta Pusat Hub" },
  { vehicleId: 12, label: "Semarang Hub" },
  { vehicleId: 13, label: "Koridor Jakarta - Bogor" },
  { vehicleId: 14, label: "Bandung Hub" },
  { vehicleId: 20, label: "Bandung Hub" },
];

const locationByVehicleId = new Map(
  VEHICLE_OPERATIONAL_LOCATIONS.map((location) => [location.vehicleId, location])
);

export function getVehicleOperationalLocation(vehicleId: number): VehicleOperationalLocation | undefined {
  return locationByVehicleId.get(vehicleId);
}
