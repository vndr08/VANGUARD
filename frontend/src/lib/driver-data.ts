import type { Vehicle } from "@/types";

export type DriverStatus = "active" | "off-duty" | "on-leave" | "inactive";

export interface DriverRecord {
  id: string;
  name: string;
  sim_number: string;
  phone: string;
  address: string;
  birth_date: string;
  vehicle_id: number;
  status: DriverStatus;
  join_date: string;
}

type DriverProfile = Omit<DriverRecord, "name" | "vehicle_id"> & { vehicleId: number };

const DRIVER_PROFILES: DriverProfile[] = [
  { id: "D01", vehicleId: 1, sim_number: "SIM B2 1234-5678-9012", phone: "0812-3456-7890", address: "Jl. Merdeka No. 10, Jakarta", birth_date: "1985-03-15", status: "active", join_date: "2020-01-15" },
  { id: "D02", vehicleId: 2, sim_number: "SIM B2 2345-6789-0123", phone: "0813-4567-8901", address: "Jl. Sudirman No. 22, Bandung", birth_date: "1988-07-22", status: "active", join_date: "2021-03-08" },
  { id: "D03", vehicleId: 3, sim_number: "SIM B2 3456-7890-1234", phone: "0814-5678-9012", address: "Jl. Asia Afrika No. 5, Bandung", birth_date: "1980-11-03", status: "active", join_date: "2018-06-20" },
  { id: "D04", vehicleId: 4, sim_number: "SIM B2 4567-8901-2345", phone: "0815-6789-0123", address: "Jl. Gatot Subroto, Semarang", birth_date: "1992-01-30", status: "active", join_date: "2022-09-01" },
  { id: "D05", vehicleId: 5, sim_number: "SIM B2 5678-9012-3456", phone: "0816-7890-1234", address: "Jl. Pahlawan No. 8, Surabaya", birth_date: "1978-05-18", status: "off-duty", join_date: "2017-04-12" },
  { id: "D06", vehicleId: 6, sim_number: "SIM B2 6789-0123-4567", phone: "0817-8901-2345", address: "Jl. Ahmad Yani No. 15, Bekasi", birth_date: "1990-08-09", status: "active", join_date: "2020-11-25" },
  { id: "D07", vehicleId: 7, sim_number: "SIM B2 7890-1234-5678", phone: "0818-9012-3456", address: "Jl. Diponegoro No. 33, Bandung", birth_date: "1975-12-01", status: "on-leave", join_date: "2015-02-14" },
  { id: "D08", vehicleId: 8, sim_number: "SIM B2 8901-2345-6789", phone: "0819-0123-4567", address: "Jl. Thamrin No. 12, Jakarta", birth_date: "1995-04-25", status: "active", join_date: "2023-07-30" },
  { id: "D09", vehicleId: 9, sim_number: "SIM B2 9012-3456-7890", phone: "0811-1234-5678", address: "Jl. Merdeka Timur, Malang", birth_date: "1987-09-14", status: "active", join_date: "2019-08-05" },
  { id: "D10", vehicleId: 10, sim_number: "SIM B1 0123-4567-8901", phone: "0822-2345-6789", address: "Jl. Asia No. 7, Bandung", birth_date: "1993-02-28", status: "active", join_date: "2022-05-17" },
  { id: "D11", vehicleId: 11, sim_number: "SIM B2 1122-3344-5566", phone: "0823-3456-7890", address: "Jl. Boulevard, Jakarta", birth_date: "1989-06-11", status: "off-duty", join_date: "2020-10-22" },
  { id: "D12", vehicleId: 12, sim_number: "SIM B2 2233-4455-6677", phone: "0824-4567-8901", address: "Jl. Braga No. 4, Bandung", birth_date: "1983-10-07", status: "inactive", join_date: "2016-03-19" },
  { id: "D13", vehicleId: 13, sim_number: "SIM B2 3344-5566-7788", phone: "0825-5678-9012", address: "Jl. Sudirman Barat, Jakarta", birth_date: "1996-01-20", status: "active", join_date: "2023-09-01" },
  { id: "D14", vehicleId: 14, sim_number: "SIM B2 4455-6677-8899", phone: "0826-6789-0123", address: "Jl. Dago No. 18, Bandung", birth_date: "1984-07-15", status: "inactive", join_date: "2017-12-08" },
  { id: "D15", vehicleId: 20, sim_number: "SIM B2 5566-7788-9900", phone: "0827-7890-1234", address: "Jl. Soekarno Hatta, Bandung", birth_date: "1981-03-03", status: "active", join_date: "2019-05-14" },
];

export function selectDrivers(vehicles: Vehicle[]): DriverRecord[] {
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  return DRIVER_PROFILES.flatMap((profile) => {
    const vehicle = vehicleById.get(profile.vehicleId);
    const name = vehicle?.driver_name?.trim();
    return vehicle && name ? [{ ...profile, name, vehicle_id: vehicle.id }] : [];
  });
}
