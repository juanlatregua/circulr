import type { Database } from "@/lib/supabase/types";

// Table row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Intake = Database["public"]["Tables"]["intakes"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type AIGeneration = Database["public"]["Tables"]["ai_generations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type ProjectType = Database["public"]["Enums"]["project_type"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type UrgencyLevel = Database["public"]["Enums"]["urgency_level"];
export type DocType = Database["public"]["Enums"]["doc_type"];
export type GenStatus = Database["public"]["Enums"]["gen_status"];
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
export type CEMaturity = Database["public"]["Enums"]["ce_maturity"];

// Insert types
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type IntakeInsert = Database["public"]["Tables"]["intakes"]["Insert"];

// Extended types with joins
export interface ProjectWithRelations extends Project {
  client?: Profile;
  consultant?: Profile;
  intake?: Intake;
  documents?: Document[];
  messages?: Message[];
}
