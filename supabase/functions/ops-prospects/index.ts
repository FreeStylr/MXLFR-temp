import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Ops-Token",
};

const OPS_TOKEN = Deno.env.get("OPS_ACCESS_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// POST /lookup
// Body: { emails: string[], mobiles: string[], domain_names: string[] }
// Returns: { reservations: ReservationMatch[], profiles: ProfileMatch[] }
async function handleLookup(db: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const emails = (body.emails as string[]) ?? [];
  const mobiles = (body.mobiles as string[]) ?? [];
  const domainNames = (body.domain_names as string[]) ?? [];

  const cleanEmails = emails.filter(Boolean).map(e => e.toLowerCase().trim());
  const cleanMobiles = mobiles.filter(Boolean).map(m => m.replace(/\s/g, ''));
  const cleanDomains = domainNames.filter(Boolean).map(d => d.toLowerCase().trim());

  // Fetch matching reservations (by email OR mobile OR structure_name)
  const resvQuery = db
    .from("wine_reservations")
    .select("id, email, mobile, structure_name, status, payment_reference, payment_method");

  const orParts: string[] = [];
  if (cleanEmails.length) orParts.push(`email.in.(${cleanEmails.join(",")})`);
  if (cleanMobiles.length) orParts.push(`mobile.in.(${cleanMobiles.join(",")})`);
  if (cleanDomains.length) orParts.push(`structure_name.in.(${cleanDomains.join(",")})`);

  const { data: resvRows } = orParts.length
    ? await resvQuery.or(orParts.join(","))
    : await resvQuery.limit(0);

  // Fetch matching profiles (by email OR phone OR domaine_name)
  const profQuery = db
    .from("wine_profiles")
    .select("id, email, phone, domaine_name, slug, is_published");

  const profOrParts: string[] = [];
  if (cleanEmails.length) profOrParts.push(`email.in.(${cleanEmails.join(",")})`);
  if (cleanMobiles.length) profOrParts.push(`phone.in.(${cleanMobiles.join(",")})`);
  if (cleanDomains.length) profOrParts.push(`domaine_name.in.(${cleanDomains.join(",")})`);

  const { data: profRows } = profOrParts.length
    ? await profQuery.or(profOrParts.join(","))
    : await profQuery.limit(0);

  return json({ reservations: resvRows ?? [], profiles: profRows ?? [] });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const token = req.headers.get("X-Ops-Token") ?? "";
  if (!OPS_TOKEN || token !== OPS_TOKEN) {
    return unauthorized();
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY);
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/ops-prospects/, "");

  try {
    // GET /reservations — list wine_reservations with optional search/filter
    if (req.method === "GET" && path === "/reservations") {
      const search = url.searchParams.get("search") ?? "";
      const status = url.searchParams.get("status") ?? "";
      const paymentMethod = url.searchParams.get("payment_method") ?? "";
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "300"), 500);
      const offset = parseInt(url.searchParams.get("offset") ?? "0");

      let q = db
        .from("wine_reservations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) q = q.eq("status", status);
      if (paymentMethod) q = q.eq("payment_method", paymentMethod);
      if (search) {
        q = q.or(
          `structure_name.ilike.%${search}%,email.ilike.%${search}%,mobile.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,payment_reference.ilike.%${search}%,town.ilike.%${search}%`
        );
      }

      const { data, error, count } = await q;
      if (error) return json({ error: error.message }, 500);
      return json({ data, count });
    }

    // PATCH /reservations/:id — update override fields (manual_override, override_note, status)
    if (req.method === "PATCH" && path.match(/^\/reservations\/[a-z0-9-]+$/)) {
      const id = path.replace("/reservations/", "");
      const body = await req.json();
      // Only allow safe ops-writable fields — never allow changing payment data
      const allowed: Record<string, unknown> = {};
      const ALLOWED_KEYS = ["manual_override", "override_note", "status", "run_month", "cutoff_date", "notes"];
      for (const key of ALLOWED_KEYS) {
        if (key in body) allowed[key] = body[key];
      }
      if (Object.keys(allowed).length === 0) return json({ error: "No patchable fields" }, 400);
      allowed.updated_at = new Date().toISOString();
      const { data, error } = await db
        .from("wine_reservations")
        .update(allowed)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Not found" }, 404);
      return json({ data });
    }

    // PATCH /campaigns/:id — update start_at and end_at only
    if (req.method === "PATCH" && path.match(/^\/campaigns\/[a-z0-9-]+$/)) {
      const id = path.replace("/campaigns/", "");
      const body = await req.json();
      const patch: Record<string, unknown> = {};
      if ("start_at" in body) patch.start_at = body.start_at ?? null;
      if ("end_at" in body) patch.end_at = body.end_at ?? null;
      if (Object.keys(patch).length === 0) return json({ error: "No patchable fields" }, 400);
      patch.updated_at = new Date().toISOString();
      const { data, error } = await db
        .from("vinocap_campaigns")
        .update(patch)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Not found" }, 404);
      return json({ data });
    }

    // POST /lookup — batch match against reservations + profiles
    if (req.method === "POST" && path === "/lookup") {
      const body = await req.json();
      return await handleLookup(db, body);
    }

    // GET / — list with optional search/filter
    if (req.method === "GET" && (path === "" || path === "/")) {
      const search = url.searchParams.get("search") ?? "";
      const status = url.searchParams.get("status") ?? "";
      const published = url.searchParams.get("published") ?? "";
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200"), 500);
      const offset = parseInt(url.searchParams.get("offset") ?? "0");

      let q = db
        .from("wine_prospects")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) q = q.eq("status", status);
      if (published === "true") q = q.eq("published", true);
      if (published === "false") q = q.eq("published", false);

      if (search) {
        q = q.or(
          `domain_name.ilike.%${search}%,contact_first_name.ilike.%${search}%,contact_last_name.ilike.%${search}%,email.ilike.%${search}%,primary_mobile.ilike.%${search}%,town.ilike.%${search}%`
        );
      }

      const { data, error, count } = await q;
      if (error) return json({ error: error.message }, 500);
      return json({ data, count });
    }

    // GET /:id
    if (req.method === "GET" && path.match(/^\/[a-z0-9-]+$/)) {
      const id = path.slice(1);
      const { data, error } = await db.from("wine_prospects").select("*").eq("id", id).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Not found" }, 404);
      return json({ data });
    }

    // POST / — create one or bulk insert array
    if (req.method === "POST" && (path === "" || path === "/")) {
      const body = await req.json();
      const rows = Array.isArray(body) ? body : [body];
      const { data, error } = await db.from("wine_prospects").insert(rows).select();
      if (error) return json({ error: error.message }, 500);
      return json({ data }, 201);
    }

    // PUT /:id — update
    if (req.method === "PUT" && path.match(/^\/[a-z0-9-]+$/)) {
      const id = path.slice(1);
      const body = await req.json();
      delete body.id;
      delete body.created_at;
      const { data, error } = await db.from("wine_prospects").update(body).eq("id", id).select().maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Not found" }, 404);
      return json({ data });
    }

    // DELETE /:id
    if (req.method === "DELETE" && path.match(/^\/[a-z0-9-]+$/)) {
      const id = path.slice(1);
      const { error } = await db.from("wine_prospects").delete().eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
