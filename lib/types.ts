export type LeadStatus = "new" | "contacted" | "scheduled" | "closed";
export type LeadPriority = "low" | "medium" | "high" | "urgent";
export type LeadSource =
  | "Zillow"
  | "referral"
  | "Facebook"
  | "repeat client"
  | "phone inquiry"
  | "other";
export type FollowUpState = "overdue" | "today" | "upcoming" | "none";
export type PropertyInterestStatus =
  | "interested"
  | "toured"
  | "rejected"
  | "applying"
  | "closed";

export type Lead = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  desiredMoveInDate: string;
  notes: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  nextFollowUpDate: string;
  showingDate: string;
  showingTime: string;
  agentNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type PropertyInterest = {
  id: string;
  leadId: string;
  address: string;
  listingTitle: string;
  source: LeadSource;
  listingUrl: string;
  rent: string;
  beds: string;
  baths: string;
  neighborhood: string;
  status: PropertyInterestStatus;
  rating: number;
  pros: string;
  cons: string;
  agentNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadWithProperties = Lead & {
  propertyInterests: PropertyInterest[];
};
