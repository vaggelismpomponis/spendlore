-- Migration to add splits column to transactions table for Split Transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS splits JSONB DEFAULT NULL;

COMMENT ON COLUMN public.transactions.splits IS 'Array of split items: [{ category_id, category, amount, note }]';

