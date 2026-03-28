import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city");
    const apiKey = Deno.env.get("GNEWS_API_KEY");

    if (!city) {
      return new Response(
        JSON.stringify({ error: "City parameter is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const newsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(city)}&lang=en&country=us&max=3&apikey=${apiKey}`;

    const newsResponse = await fetch(newsUrl);

    if (!newsResponse.ok) {
      const errorText = await newsResponse.text();
      return new Response(
        JSON.stringify({ error: "Failed to fetch news", details: errorText }),
        {
          status: newsResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const newsData = await newsResponse.json();

    return new Response(JSON.stringify(newsData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
