// Auto-generated types will go here.
// Run `npx supabase gen types typescript` to generate from your database.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "client" | "consultant" | "admin";
          full_name: string | null;
          company_name: string | null;
          sector: string | null;
          company_size: string | null;
          phone: string | null;
          onboarded: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: "client" | "consultant" | "admin";
          full_name?: string | null;
          company_name?: string | null;
          sector?: string | null;
          company_size?: string | null;
          phone?: string | null;
          onboarded?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "client" | "consultant" | "admin";
          full_name?: string | null;
          company_name?: string | null;
          sector?: string | null;
          company_size?: string | null;
          phone?: string | null;
          onboarded?: boolean;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string | null;
          consultant_id: string | null;
          type: "csrd_response" | "ce_diagnosis" | "implementation" | "training" | null;
          status: "draft" | "pending_payment" | "active" | "in_review" | "delivered" | "closed";
          title: string;
          description: string | null;
          urgency: "standard" | "urgent" | "critical";
          price_eur: number | null;
          stripe_payment_intent: string | null;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          consultant_id?: string | null;
          type?: "csrd_response" | "ce_diagnosis" | "implementation" | "training" | null;
          status?: "draft" | "pending_payment" | "active" | "in_review" | "delivered" | "closed";
          title: string;
          description?: string | null;
          urgency?: "standard" | "urgent" | "critical";
          price_eur?: number | null;
          stripe_payment_intent?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          consultant_id?: string | null;
          type?: "csrd_response" | "ce_diagnosis" | "implementation" | "training" | null;
          status?: "draft" | "pending_payment" | "active" | "in_review" | "delivered" | "closed";
          title?: string;
          description?: string | null;
          urgency?: "standard" | "urgent" | "critical";
          price_eur?: number | null;
          stripe_payment_intent?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      intakes: {
        Row: {
          id: string;
          project_id: string | null;
          client_id: string | null;
          sector: string | null;
          employees: string | null;
          annual_revenue: string | null;
          location: string | null;
          has_csrd_questionnaire: boolean | null;
          csrd_sender: string | null;
          csrd_deadline: string | null;
          has_pending_inspection: boolean | null;
          main_waste_types: string[] | null;
          energy_cost_concern: boolean | null;
          ce_maturity: "none" | "basic" | "intermediate" | "advanced";
          main_pain: string | null;
          raw_answers: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          client_id?: string | null;
          sector?: string | null;
          employees?: string | null;
          annual_revenue?: string | null;
          location?: string | null;
          has_csrd_questionnaire?: boolean | null;
          csrd_sender?: string | null;
          csrd_deadline?: string | null;
          has_pending_inspection?: boolean | null;
          main_waste_types?: string[] | null;
          energy_cost_concern?: boolean | null;
          ce_maturity?: "none" | "basic" | "intermediate" | "advanced";
          main_pain?: string | null;
          raw_answers?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          client_id?: string | null;
          sector?: string | null;
          employees?: string | null;
          annual_revenue?: string | null;
          location?: string | null;
          has_csrd_questionnaire?: boolean | null;
          csrd_sender?: string | null;
          csrd_deadline?: string | null;
          has_pending_inspection?: boolean | null;
          main_waste_types?: string[] | null;
          energy_cost_concern?: boolean | null;
          ce_maturity?: "none" | "basic" | "intermediate" | "advanced";
          main_pain?: string | null;
          raw_answers?: Json | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string | null;
          uploaded_by: string | null;
          type: "client_upload" | "generated_draft" | "final_deliverable" | "invoice" | null;
          filename: string;
          storage_path: string;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          uploaded_by?: string | null;
          type?: "client_upload" | "generated_draft" | "final_deliverable" | "invoice" | null;
          filename: string;
          storage_path: string;
          size_bytes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          uploaded_by?: string | null;
          type?: "client_upload" | "generated_draft" | "final_deliverable" | "invoice" | null;
          filename?: string;
          storage_path?: string;
          size_bytes?: number | null;
          created_at?: string;
        };
      };
      ai_generations: {
        Row: {
          id: string;
          project_id: string | null;
          consultant_id: string | null;
          prompt_used: string | null;
          raw_output: string | null;
          edited_output: string | null;
          status: "generated" | "reviewed" | "approved" | "rejected";
          tokens_used: number | null;
          model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          consultant_id?: string | null;
          prompt_used?: string | null;
          raw_output?: string | null;
          edited_output?: string | null;
          status?: "generated" | "reviewed" | "approved" | "rejected";
          tokens_used?: number | null;
          model?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          consultant_id?: string | null;
          prompt_used?: string | null;
          raw_output?: string | null;
          edited_output?: string | null;
          status?: "generated" | "reviewed" | "approved" | "rejected";
          tokens_used?: number | null;
          model?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          project_id: string | null;
          sender_id: string | null;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          sender_id?: string | null;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          sender_id?: string | null;
          content?: string;
          read_at?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          project_id: string | null;
          client_id: string | null;
          amount_eur: number | null;
          stripe_invoice_id: string | null;
          status: "draft" | "sent" | "paid" | "overdue";
          issued_at: string | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          client_id?: string | null;
          amount_eur?: number | null;
          stripe_invoice_id?: string | null;
          status?: "draft" | "sent" | "paid" | "overdue";
          issued_at?: string | null;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          client_id?: string | null;
          amount_eur?: number | null;
          stripe_invoice_id?: string | null;
          status?: "draft" | "sent" | "paid" | "overdue";
          issued_at?: string | null;
          paid_at?: string | null;
        };
      };
    };
    Enums: {
      user_role: "client" | "consultant" | "admin";
      project_type: "csrd_response" | "ce_diagnosis" | "implementation" | "training";
      project_status: "draft" | "pending_payment" | "active" | "in_review" | "delivered" | "closed";
      urgency_level: "standard" | "urgent" | "critical";
      doc_type: "client_upload" | "generated_draft" | "final_deliverable" | "invoice";
      gen_status: "generated" | "reviewed" | "approved" | "rejected";
      invoice_status: "draft" | "sent" | "paid" | "overdue";
      ce_maturity: "none" | "basic" | "intermediate" | "advanced";
    };
  };
};
