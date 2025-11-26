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
    const { petType, evolutionStage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const petPrompts: Record<string, Record<number, string>> = {
      flameling: {
        1: "Pixel art pet in Pokémon FireRed style. Small cute purple fire creature with glowing embers, baby form, round body, tiny flames. 64x64 pixels, circular gradient background purple-orange. Retro game aesthetic.",
        2: "Pixel art pet in Pokémon FireRed style. Medium purple fire creature, teenage form, more defined flames, stronger presence. 64x64 pixels, circular gradient background purple-red. Retro game aesthetic.",
        3: "Pixel art pet in Pokémon FireRed style. Large majestic purple fire phoenix, adult form, powerful flames, epic presence. 64x64 pixels, circular gradient background purple-gold. Retro game aesthetic.",
      },
      aqualight: {
        1: "Pixel art pet in Pokémon FireRed style. Cute blue water drop creature with big eyes, baby form, sparkles around. 64x64 pixels, circular gradient background blue-cyan. Retro game aesthetic.",
        2: "Pixel art pet in Pokémon FireRed style. Medium blue water spirit, teenage form, flowing water effects, graceful. 64x64 pixels, circular gradient background blue-teal. Retro game aesthetic.",
        3: "Pixel art pet in Pokémon FireRed style. Large elegant blue water dragon, adult form, majestic waves, powerful presence. 64x64 pixels, circular gradient background blue-purple. Retro game aesthetic.",
      },
      shadetail: {
        1: "Pixel art pet in Pokémon FireRed style. Small dark purple dragon baby, cute with tiny wings, shadowy aura. 64x64 pixels, circular gradient background dark purple-black. Retro game aesthetic.",
        2: "Pixel art pet in Pokémon FireRed style. Medium dark dragon teenager, bigger wings, mysterious shadow effects. 64x64 pixels, circular gradient background purple-violet. Retro game aesthetic.",
        3: "Pixel art pet in Pokémon FireRed style. Large powerful shadow dragon adult, massive wings, epic dark energy. 64x64 pixels, circular gradient background black-purple. Retro game aesthetic.",
      },
      puffie: {
        1: "Pixel art pet in Pokémon FireRed style. Cute small white cloud with happy face, baby form, soft and fluffy. 64x64 pixels, circular gradient background white-gray. Retro game aesthetic.",
        2: "Pixel art pet in Pokémon FireRed style. Medium storm cloud creature, teenage form, light lightning effects. 64x64 pixels, circular gradient background gray-blue. Retro game aesthetic.",
        3: "Pixel art pet in Pokémon FireRed style. Large majestic thunder cloud, adult form, powerful lightning bolts. 64x64 pixels, circular gradient background dark gray-yellow. Retro game aesthetic.",
      },
      sparkfox: {
        1: "Pixel art pet in Pokémon FireRed style. Small cute yellow electric fox kit, baby form, tiny sparks. 64x64 pixels, circular gradient background yellow-orange. Retro game aesthetic.",
        2: "Pixel art pet in Pokémon FireRed style. Medium electric fox, teenage form, more defined lightning, agile. 64x64 pixels, circular gradient background yellow-blue. Retro game aesthetic.",
        3: "Pixel art pet in Pokémon FireRed style. Large powerful electric fox, adult form, massive lightning effects, legendary. 64x64 pixels, circular gradient background gold-white. Retro game aesthetic.",
      },
    };

    const prompt = petPrompts[petType]?.[evolutionStage] || petPrompts.flameling[1];

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
