-- =============================================
-- C. Blake Enterprise - Property Management
-- Migration: Late Fees + Notifications
-- Run this in your Supabase SQL Editor
-- =============================================

SET search_path TO public;

-- Add late fee column to payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS late_fee numeric DEFAULT 0;

-- Add lease configuration fields
ALTER TABLE public.leases ADD COLUMN IF NOT EXISTS due_day integer DEFAULT 1;         -- day of month rent is due (1-28)
ALTER TABLE public.leases ADD COLUMN IF NOT EXISTS late_fee_amount numeric DEFAULT 0; -- flat late fee charge
ALTER TABLE public.leases ADD COLUMN IF NOT EXISTS late_fee_days integer DEFAULT 5;   -- grace period in days
ALTER TABLE public.leases ADD COLUMN IF NOT EXISTS notes text;                        -- internal notes

-- Notifications table (rent reminders, announcements, alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general',   -- 'rent_reminder' | 'announcement' | 'maintenance' | 'general'
  read_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark their own notifications read"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
