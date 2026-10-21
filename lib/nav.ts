import type { RootCause } from "./rootCause";

export type ViewKey =
  | "overview"
  | "insights"
  | "products"
  | "reviews"
  | "upload"
  | "discovery"
  | "integrations";

export interface NavContext {
  product?: string;
  platform?: string;
  sentiment?: string;
  issue?: string;
  rootCause?: RootCause;
  query?: string;
}
