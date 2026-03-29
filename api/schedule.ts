export default async function handler(req: any, res: any) {
  const apiKey = process.env.ARBOX_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "No API key" });
  }

  const date =
    (req.query.date as string) || new Date().toISOString().split("T")[0];
  const apiUrl = `https://arboxserver.arboxapp.com/api/public/v3/schedule?from_date=${date}&to_date=${date}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { "api-key": apiKey },
    });
    const raw = await response.json();
    const items: any[] = raw?.data ?? (Array.isArray(raw) ? raw : []);

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
        registration_link: s.registration_link ?? "",
      }));

    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).json(filtered);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
