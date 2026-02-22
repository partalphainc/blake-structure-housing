import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ZAPIER_WEBHOOK_URL = Deno.env.get("ZAPIER_WEBHOOK_URL");
    if (!ZAPIER_WEBHOOK_URL) {
      throw new Error("ZAPIER_WEBHOOK_URL is not configured");
    }

    const { name, phone, email, unit } = await req.json();

    if (!name || !phone || !email) {
      return new Response(
        JSON.stringify({ error: "Name, phone, and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        unit: unit || "General Inquiry",
        timestamp: new Date().toISOString(),
        source: "cblake-website",
      }),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook failed [${response.status}]`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending inquiry:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
