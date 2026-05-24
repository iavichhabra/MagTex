export type Severity = "Critical" | "High" | "Medium" | "Low" | "Informational";

export type Category =
  | "Critical Vulnerability"
  | "High Severity Vulnerability"
  | "Medium Severity Vulnerability"
  | "Smart Contract Exploit"
  | "Infrastructure Vulnerability"
  | "Access Control Issue"
  | "Economic Attack Vector"
  | "Oracle Manipulation"
  | "MEV Related Finding"
  | "Security Research";

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
