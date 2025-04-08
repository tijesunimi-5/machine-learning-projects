export const runtime = "nodejs";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "..",
    "datasets",
    "Conversation.csv"
  );
  const csvData = fs.readFileSync(filePath, "utf8");
  return new NextResponse(csvData, {
    headers: {
      "Content-Type": "text/csv",
    },
  });
}
