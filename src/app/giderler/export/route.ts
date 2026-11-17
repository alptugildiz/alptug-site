import { getUser } from "@/lib/giderler/session.ts";
import { getStore } from "@/lib/giderler/store.ts";
import { today } from "@/lib/giderler/summary.ts";

export async function GET() {
  if (!(await getUser())) return new Response("Unauthorized", { status: 401 });

  return new Response(JSON.stringify(await getStore().list(), null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="giderler-${today()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
