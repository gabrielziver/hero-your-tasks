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
    const { mountType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const mountPrompts: Record<string, string> = {
      frost_wolf: "Pixel art mount in Pokémon FireRed style. Large majestic white frost wolf with ice crystals on fur, glowing blue eyes, powerful stance. Side view, 128x128 pixels, circular gradient background blue-white. Retro game aesthetic.",
      neon_dragon: "Pixel art mount in Pokémon FireRed style. Sleek purple neon dragon with glowing patterns, electric wings, futuristic design. Side view, 128x128 pixels, circular gradient background purple-pink. Retro game aesthetic.",
      blue_phoenix: "Pixel art mount in Pokémon FireRed style. Majestic blue phoenix with flowing feathers, cyan flames, ethereal presence. Side view, 128x128 pixels, circular gradient background blue-cyan. Retro game aesthetic.",
      shadow_buffalo: "Pixel art mount in Pokémon FireRed style. Dark powerful shadow buffalo with purple aura, mysterious energy, strong build. Side view, 128x128 pixels, circular gradient background black-purple. Retro game aesthetic.",
      purple_bike: "Pixel art mount in Pokémon FireRed style. Futuristic purple motorcycle with neon lights, sleek design, hover effects. Side view, 128x128 pixels, circular gradient background purple-blue. Retro game aesthetic.",
    };

    const prompt = mountPrompts[mountType] || mountPrompts.frost_wolf;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
