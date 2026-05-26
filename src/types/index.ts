export type Severity = "Critical" | "Severe" | "High";

export type Category = "Security Research";

export interface ReportMetadata {
  title: string;
  severity: Severity;
  category: Category;
  affectedProject: string;
  description: string;
  price: string;
  abstract: string;
}

export interface Listing {
  id: number;
  seller: `0x${string}`;
  ipId: `0x${string}`;
  cdrUUID: string;
  price: bigint;
  metadataURI: string;
  active: boolean;
  licenseTermsId: bigint;
  createdAt: bigint;
  metadata?: ReportMetadata;
}

export interface Review {
  reviewer: `0x${string}`;
  rating: number;
  comment: string;
  timestamp: bigint;
}

export interface ResearcherProfile {
  address: `0x${string}`;
  reputationScore: bigint;
  totalEarnings: bigint;
  totalTips: bigint;
  listings: number[];
  badges: string[];
}
