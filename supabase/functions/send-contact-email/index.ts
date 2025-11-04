import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData: ContactFormData = await req.json();

    const { firstName, lastName, company, email, message } = formData;

    if (!firstName || !lastName || !company || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Nouveau message de contact depuis Maxilocal.fr</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Prénom:</strong> ${firstName}</p>
          <p><strong>Nom:</strong> ${lastName}</p>
          <p><strong>Entreprise:</strong> ${company}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h3 style="margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #737373; font-size: 12px; margin-top: 20px;">Envoyé depuis le formulaire de contact Maxilocal</p>
      </div>
    `;

    const emailData = {
      from: "onboarding@resend.dev",
      to: ["maxilocal.pro@gmail.com"],
      subject: `Nouveau contact: ${firstName} ${lastName} - ${company}`,
      html: emailHtml,
      reply_to: email,
    };

    const RESEND_API_KEY = "re_dGCzJrSp_85bmpxsK2yCib5Y7PXH9n43P";

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      }
    );

    const responseData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", responseData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: responseData }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
