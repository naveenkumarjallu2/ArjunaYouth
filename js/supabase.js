// Supabase Configuration and Client
const SUPABASE_URL = "https://gvvidndiuizrpyghuoyx.supabase.co";
const SUPABASE_KEY = "sb_publishable_oOeXAhdowd-Oeah6787hxA_7dHioODf";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);