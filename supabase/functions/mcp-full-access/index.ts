import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mcp-key',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Bearer Token (API Key)
    const authHeader = req.headers.get('authorization');
    const expectedKey = Deno.env.get('MCP_API_KEY');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing Bearer token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (token !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, table, data, filters, query, columns } = await req.json();

    let result;

    switch (action) {
      case 'select': {
        // قراءة بيانات من جدول
        let queryBuilder = supabase.from(table).select(columns || '*');
        
        // تطبيق الفلاتر
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        
        result = await queryBuilder;
        break;
      }

      case 'insert': {
        // إضافة بيانات جديدة
        result = await supabase.from(table).insert(data).select();
        break;
      }

      case 'update': {
        // تعديل بيانات
        let queryBuilder = supabase.from(table).update(data);
        
        // تطبيق الفلاتر
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        
        result = await queryBuilder.select();
        break;
      }

      case 'delete': {
        // حذف بيانات
        let queryBuilder = supabase.from(table).delete();
        
        // تطبيق الفلاتر
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        
        result = await queryBuilder;
        break;
      }

      case 'raw_query': {
        // تنفيذ استعلام SQL مخصص (خطير جداً!)
        result = await supabase.rpc('exec_sql', { query_text: query });
        break;
      }

      case 'list_tables': {
        // عرض جميع الجداول
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        result = { data, error };
        break;
      }

      case 'describe_table': {
        // وصف جدول (الأعمدة والأنواع)
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', table);
        
        result = { data, error };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: select, insert, update, delete, raw_query, list_tables, describe_table' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ error: result.error.message, details: result.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
