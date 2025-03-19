import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const backendUrl = "http://localhost:8000/predict/";
    const backendResponse = await fetch(backendUrl, {
        method: "POST",
        body: formData,
    });

    if (!backendResponse.ok) {
        return NextResponse.json({ error: "Backend error" }, { status: 500 });
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
}
