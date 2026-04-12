export type LeadStatus = "new" | "contacted" | "scheduled" | "closed";

export type Lead = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  desiredMoveInDate: string;
  notes: string;
  status: LeadStatus;
  showingDate: string;
  showingTime: string;
  agentNotes: string;
  createdAt: string;
  updatedAt: string;
};
