/**
 * Seed of major Colombian cities for G2 coverage (wave activation metadata).
 * Municipalities can be expanded by ingestion jobs.
 */

export type CitySeed = {
  departmentCode: string;
  departmentName: string;
  name: string;
  slug: string;
  isMajor: boolean;
  lat: number;
  lng: number;
  activationWave: string;
};

export const COLOMBIA_MAJOR_CITIES: CitySeed[] = [
  { departmentCode: "11", departmentName: "Bogotá D.C.", name: "Bogotá", slug: "bogota", isMajor: true, lat: 4.711, lng: -74.0721, activationWave: "wave-1" },
  { departmentCode: "05", departmentName: "Antioquia", name: "Medellín", slug: "medellin", isMajor: true, lat: 6.2476, lng: -75.5658, activationWave: "wave-1" },
  { departmentCode: "76", departmentName: "Valle del Cauca", name: "Cali", slug: "cali", isMajor: true, lat: 3.4516, lng: -76.532, activationWave: "wave-1" },
  { departmentCode: "08", departmentName: "Atlántico", name: "Barranquilla", slug: "barranquilla", isMajor: true, lat: 10.9685, lng: -74.7813, activationWave: "wave-1" },
  { departmentCode: "13", departmentName: "Bolívar", name: "Cartagena", slug: "cartagena", isMajor: true, lat: 10.391, lng: -75.4794, activationWave: "wave-1" },
  { departmentCode: "68", departmentName: "Santander", name: "Bucaramanga", slug: "bucaramanga", isMajor: true, lat: 7.1193, lng: -73.1227, activationWave: "wave-2" },
  { departmentCode: "66", departmentName: "Risaralda", name: "Pereira", slug: "pereira", isMajor: true, lat: 4.8133, lng: -75.6961, activationWave: "wave-2" },
  { departmentCode: "17", departmentName: "Caldas", name: "Manizales", slug: "manizales", isMajor: true, lat: 5.0703, lng: -75.5138, activationWave: "wave-2" },
  { departmentCode: "47", departmentName: "Magdalena", name: "Santa Marta", slug: "santa-marta", isMajor: true, lat: 11.2408, lng: -74.199, activationWave: "wave-2" },
  { departmentCode: "54", departmentName: "Norte de Santander", name: "Cúcuta", slug: "cucuta", isMajor: true, lat: 7.8891, lng: -72.4967, activationWave: "wave-2" },
  { departmentCode: "73", departmentName: "Tolima", name: "Ibagué", slug: "ibague", isMajor: true, lat: 4.4389, lng: -75.2322, activationWave: "wave-3" },
  { departmentCode: "50", departmentName: "Meta", name: "Villavicencio", slug: "villavicencio", isMajor: true, lat: 4.142, lng: -73.6266, activationWave: "wave-3" },
  { departmentCode: "52", departmentName: "Nariño", name: "Pasto", slug: "pasto", isMajor: true, lat: 1.2136, lng: -77.2811, activationWave: "wave-3" },
  { departmentCode: "23", departmentName: "Córdoba", name: "Montería", slug: "monteria", isMajor: true, lat: 8.7479, lng: -75.8814, activationWave: "wave-3" },
  { departmentCode: "41", departmentName: "Huila", name: "Neiva", slug: "neiva", isMajor: true, lat: 2.9273, lng: -75.2819, activationWave: "wave-3" },
  { departmentCode: "63", departmentName: "Quindío", name: "Armenia", slug: "armenia", isMajor: true, lat: 4.5339, lng: -75.6811, activationWave: "wave-2" },
  { departmentCode: "19", departmentName: "Cauca", name: "Popayán", slug: "popayan", isMajor: true, lat: 2.4448, lng: -76.6147, activationWave: "wave-3" },
  { departmentCode: "20", departmentName: "Cesar", name: "Valledupar", slug: "valledupar", isMajor: true, lat: 10.4631, lng: -73.2532, activationWave: "wave-3" },
];
