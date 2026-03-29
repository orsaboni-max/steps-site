import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const apiKey = Netlify.env.get("ARBOX_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({error:"No API key"}), {status:500, headers:{"Content-Type":"application/json"}});

  const url = new URL(req.url);
  const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
  const apiUrl = `https://arboxserver.arboxapp.com/api/public/v3/schedule?from_date=${date}&to_date=${date}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { "api-key": apiKey }
    });
    const raw = await response.json();
    const items: any[] = raw?.data ?? (Array.isArray(raw) ? raw : []);

    // Filter פולג branch only, sort by start_time
    const filtered = items
      .filter((s: any) => s.location_name?.includes("פולג"))
      .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))
      .map((s: any) => ({
        schedule_id: s.schedule_id,
        session_name: s.session_name,
        start_time: s.start_time,
        end_time: s.end_time,
        coach: s.staff_member?.name ?? "",
        location_name: s.location_name,
        registration_link: s.registration_link ?? ""
      }));

    return new Response(JSON.stringify(filtered), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }
    });
  } catch(e) {
    return new Response(JSON.stringify({error: String(e)}), {status:500, headers:{"Content-Type":"application/json"}});
  }
}

export const config: Config = { path: "/api/schedule" };
