import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  display_name?: string;
  public_flags?: number;
  banner?: string | null;
  banner_color?: string | null;
  accent_color?: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Discord user ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from Lanyard API (public Discord presence API)
    const lanyardResponse = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    
    if (!lanyardResponse.ok) {
      // Try to get basic user info from Discord API if Lanyard fails
      const discordToken = Deno.env.get("DISCORD_BOT_TOKEN");
      
      if (discordToken) {
        const discordResponse = await fetch(`https://discord.com/api/v10/users/${userId}`, {
          headers: {
            Authorization: `Bot ${discordToken}`,
          },
        });

        if (discordResponse.ok) {
          const discordUser: DiscordUser = await discordResponse.json();
          
          return new Response(
            JSON.stringify({
              success: true,
              data: {
                discord_user: discordUser,
                discord_status: "offline",
                source: "discord_api",
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          error: "User not found on Lanyard. They must join discord.gg/lanyard to enable presence tracking.",
          fallback: true 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lanyardData = await lanyardResponse.json();

    if (!lanyardData.success) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch presence data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...lanyardData.data,
          source: "lanyard",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching Discord presence:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
