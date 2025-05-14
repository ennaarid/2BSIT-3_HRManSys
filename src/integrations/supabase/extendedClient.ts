
import { createClient } from '@supabase/supabase-js';
import type { ExtendedDatabase, RPCReturnTypes } from '@/types/supabaseCustomTypes';

const SUPABASE_URL = "https://dhwhdafrizmskrxrbycx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRod2hkYWZyaXptc2tyeHJieWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMTY5NjQsImV4cCI6MjA1OTU5Mjk2NH0.MUCDYYvAUk8L-A4srCnUnVQL_ZkOrlMiFpBAPrHl28Q";

// Extended client with our custom types
export const supabaseExtended = createClient<ExtendedDatabase, "public", RPCReturnTypes>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);
