export type ViewKey =
  | "overview"
  | "insights"
  | "products"
  | "reviews"
  | "upload"
  | "discovery";

export interface NavContext {
  product?: string;
  platform?: string;
  sentiment?: string;
  issue?: string;
  query?: string;
}
