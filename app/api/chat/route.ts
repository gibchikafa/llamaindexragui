import { NextRequest, NextResponse } from "next/server";

type ApiSource = { title: string; doc_id: string; score: number };

const BACKEND_URL =
  "http://10.114.123.120/v1/g2/ragbenchlcagentlangchain/query";
const API_KEY =
  "a1ngnWa8v1mJqJxg.W5Trug6KRhygc8oNx0EHCdjqExcxxST68ib4Sb6fKhgfuiGa47EOKjR8N8gqGeDa";

export async function POST(req: NextRequest) {
  const { prompt, session_id } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const body: Record<string, string> = { prompt };
  if (session_id) body.session_id = session_id;

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: `Backend error: ${response.status} ${text}` },
      { status: 502 }
    );
  }

  const data = await response.json();
  const answer: string = data?.answer ?? "";
  const sources: ApiSource[] = data?.sources ?? [];
  const returned_session_id: string | undefined = data?.session_id;

  return NextResponse.json({ answer, sources, session_id: returned_session_id });
}
