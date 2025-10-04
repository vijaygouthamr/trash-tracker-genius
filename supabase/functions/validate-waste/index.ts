import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call Gemini to analyze the video
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that validates waste disposal. Analyze if waste is being disposed correctly. Return JSON with: {valid: boolean, wasteType: string, points: number (0-100), feedback: string}'
          },
          {
            role: 'user',
            content: `Analyze this waste disposal video: ${videoUrl}. Did they dispose waste correctly?`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "validate_disposal",
            description: "Validate waste disposal and assign points",
            parameters: {
              type: "object",
              properties: {
                valid: { type: "boolean" },
                wasteType: { type: "string" },
                points: { type: "number" },
                feedback: { type: "string" }
              },
              required: ["valid", "wasteType", "points", "feedback"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "validate_disposal" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI validation failed');
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const validation = JSON.parse(toolCall.function.arguments);
    
    // Save submission to database
    const { error: insertError } = await supabaseClient
      .from('submissions')
      .insert({
        user_id: userId,
        video_url: videoUrl,
        waste_type: validation.wasteType,
        points_earned: validation.valid ? validation.points : 0,
        status: validation.valid ? 'approved' : 'rejected',
        ai_feedback: validation.feedback
      });

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    // Update user points if valid
    if (validation.valid) {
      const { error: updateError } = await supabaseClient.rpc('increment_user_points', {
        user_id: userId,
        points_to_add: validation.points
      });

      if (updateError) {
        console.error('Points update error:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: validation.valid,
        points: validation.valid ? validation.points : 0,
        feedback: validation.feedback,
        wasteType: validation.wasteType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        feedback: error instanceof Error ? error.message : 'Validation failed',
        points: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
