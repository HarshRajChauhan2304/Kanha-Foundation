import { NextResponse } from "next/server";
import { resilientDelete, resilientPost, resilientPut } from "@/lib/db-fallback";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

const dataFile = path.join(process.cwd(), "data", "donations.json");

function readData() {
  try {
    const content = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function GET() {
  const donations = readData();
  return NextResponse.json(donations);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await resilientPost({
      table: "donations",
      fallbackFile: "donations.json",
      bodyData: {
        name: body.name,
        amount: body.amount,
        time: body.time || "Just now",
        donation_for: body.donation_for || "General Support",
        transaction_date: body.transaction_date || ""
      }
    });
    return NextResponse.json(result.item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;
    const result = await resilientPut({
      table: "donations",
      idOrKey: id,
      fallbackFile: "donations.json",
      bodyData: {
        name: rest.name,
        amount: rest.amount,
        time: rest.time,
        donation_for: rest.donation_for,
        transaction_date: rest.transaction_date || ""
      }
    });
    return NextResponse.json(result.item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await resilientDelete({
      table: "donations",
      idOrKey: id,
      fallbackFile: "donations.json"
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
