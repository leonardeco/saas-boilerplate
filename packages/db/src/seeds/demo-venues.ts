import { computeQualityScore } from "@saas/domain";

export type DemoVenueSeed = {
  citySlug: string;
  name: string;
  slug: string;
  type: "RESTAURANT" | "BAR" | "CLUB" | "MIXED";
  description: string;
  address: string;
  lat: number;
  lng: number;
  ratingAvg: number;
  ratingCount: number;
  curationBadge: boolean;
  priceLevel: number;
  minAge?: number;
  coverAmount?: number;
  hasGuestList?: boolean;
  capacity?: number;
  bookingEnabled: boolean;
};

/**
 * Curated demo venues for SEO + product demos (not live inventory).
 * Ratings are illustrative for quality-score / premium filters.
 */
export const DEMO_VENUES: DemoVenueSeed[] = [
  {
    citySlug: "bogota",
    name: "Andrés Carne de Res (demo)",
    slug: "andres-carne-de-res-bogota-demo",
    type: "MIXED",
    description: "Experiencia gastronómica y fiesta — ficha demo NightTable.",
    address: "Calle 82, Bogotá",
    lat: 4.6682,
    lng: -74.054,
    ratingAvg: 4.6,
    ratingCount: 4200,
    curationBadge: true,
    priceLevel: 3,
    bookingEnabled: true,
  },
  {
    citySlug: "bogota",
    name: "El Corral Gourmet Zona T (demo)",
    slug: "el-corral-gourmet-zona-t-demo",
    type: "RESTAURANT",
    description: "Casual dining demo para Comer en Bogotá.",
    address: "Zona T, Bogotá",
    lat: 4.666,
    lng: -74.053,
    ratingAvg: 4.3,
    ratingCount: 890,
    curationBadge: false,
    priceLevel: 2,
    bookingEnabled: false,
  },
  {
    citySlug: "bogota",
    name: "Theatron (demo)",
    slug: "theatron-bogota-demo",
    type: "CLUB",
    description: "Discoteca icónica — lente Salir.",
    address: "Chapinero, Bogotá",
    lat: 4.645,
    lng: -74.063,
    ratingAvg: 4.4,
    ratingCount: 2100,
    curationBadge: true,
    priceLevel: 3,
    minAge: 18,
    coverAmount: 50000,
    hasGuestList: true,
    capacity: 1500,
    bookingEnabled: false,
  },
  {
    citySlug: "medellin",
    name: "Carmen Medellín (demo)",
    slug: "carmen-medellin-demo",
    type: "RESTAURANT",
    description: "Alta cocina demo en El Poblado.",
    address: "El Poblado, Medellín",
    lat: 6.2088,
    lng: -75.567,
    ratingAvg: 4.7,
    ratingCount: 980,
    curationBadge: true,
    priceLevel: 4,
    bookingEnabled: true,
  },
  {
    citySlug: "medellin",
    name: "Salon Amador (demo)",
    slug: "salon-amador-medellin-demo",
    type: "BAR",
    description: "Bar de cócteles demo — Salir Medellín.",
    address: "Provenza, Medellín",
    lat: 6.2095,
    lng: -75.566,
    ratingAvg: 4.5,
    ratingCount: 640,
    curationBadge: true,
    priceLevel: 3,
    minAge: 18,
    bookingEnabled: true,
  },
  {
    citySlug: "cali",
    name: "El Solar de Villarosa (demo)",
    slug: "el-solar-villarosa-cali-demo",
    type: "RESTAURANT",
    description: "Cocina vallecaucana demo.",
    address: "Cali",
    lat: 3.4516,
    lng: -76.532,
    ratingAvg: 4.4,
    ratingCount: 320,
    curationBadge: false,
    priceLevel: 3,
    bookingEnabled: false,
  },
  {
    citySlug: "cartagena",
    name: "Carmen Cartagena (demo)",
    slug: "carmen-cartagena-demo",
    type: "RESTAURANT",
    description: "Centro histórico — turismo gastronómico demo.",
    address: "Centro Histórico, Cartagena",
    lat: 10.4236,
    lng: -75.551,
    ratingAvg: 4.6,
    ratingCount: 1100,
    curationBadge: true,
    priceLevel: 4,
    bookingEnabled: true,
  },
  {
    citySlug: "barranquilla",
    name: "La Cueva (demo)",
    slug: "la-cueva-barranquilla-demo",
    type: "BAR",
    description: "Historia y nightlife caribeño demo.",
    address: "Barranquilla",
    lat: 10.9685,
    lng: -74.7813,
    ratingAvg: 4.2,
    ratingCount: 210,
    curationBadge: true,
    priceLevel: 2,
    minAge: 18,
    bookingEnabled: false,
  },
];

export function demoQuality(v: DemoVenueSeed) {
  return computeQualityScore({
    ratingAvg: v.ratingAvg,
    ratingCount: v.ratingCount,
    curationBadge: v.curationBadge,
    operational: true,
  });
}
