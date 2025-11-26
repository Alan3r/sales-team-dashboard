export type Role = "NS" | "Brand Ambassador" | "Leader" | "Crew Leader" | "Assistant";

export interface Member {
  id: string;
  type: "member";
  name: string;
  role: Role;
  leader_id: string;
}

export interface WeekData {
  id: string;
  type: "week_data";
  name: string;
  role: Role;
  leader_id: string;
  week_start: string;
  week_number: number;
  year: number;
  goal: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  rq_monday: string;
  rq_tuesday: string;
  rq_wednesday: string;
  rq_thursday: string;
  rq_friday: string;
  rq_notes: string;
}

export interface StructureChange {
  id: string;
  type: "structure_change";
  action: string;
  details: string;
  timestamp: string;
}

export const ROLE_COLORS: Record<Role, string> = {
  "NS": "role-ns",
  "Brand Ambassador": "role-brand",
  "Leader": "role-leader",
  "Crew Leader": "role-crew",
  "Assistant": "role-assistant",
};

export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
export const DAY_NAMES = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob"] as const;
export const RQ_DAYS = ["rq_monday", "rq_tuesday", "rq_wednesday", "rq_thursday", "rq_friday"] as const;
export const RQ_DAY_NAMES = ["Pon", "Wt", "Śr", "Czw", "Pt"] as const;
