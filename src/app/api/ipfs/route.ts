import { NextRequest, NextResponse } from "next/server";

// Hardcoded fallback – guarantees IPFS uploads work even if .env.local
// is not loaded by the Next.js server runtime for any reason.
const PINATA_JWT_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkNjM1MWQ2MC02YmFkLTRkYWItODhjZC05ZjMxZWZjYTUwMjYiLCJlbWFpbCI6ImZveHgzNjYzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5YjVmNTY0NWFkZjM5ODY4NmQ3NyIsInNjb3BlZEtleVNlY3JldCI6IjU2N2YwOWY4YTAzNWNhNzlmYTgxNzkyNTc5MWRkNWMzMTg2ODQzZmNjZTdlZDYyYTBhNjAxMGE4YzMwOTg5MWYiLCJleHAiOjE4MTExMzQ5NTZ9.Euf6giE2ftZkKg2PmYJuZOsok3uIFGV3aqZiCIMiVCg";

function getPinataJWT(): string {
  // Try env vars first, then fall back to hardcoded value
  const fromEnv =
    process.env.NEXT_PUBLIC_PINATA_JWT ||
    process.env.PINATA_JWT;

  if (fromEnv && fromEnv.trim().length > 0) {
    console.log("[IPFS API] Using Pinata JWT from environment variable");
    return fromEnv.trim();
  }

  console.log("[IPFS API] Environment variable not found, using hardcoded fallback JWT");
  return PINATA_JWT_FALLBACK;
}

export async function POST(req: NextRequest) {
  try {
    const jwt = getPinataJWT();
    const contentType = req.headers.get("content-type") || "";

    console.log("[IPFS API] Received request, content-type:", contentType);
    console.log("[IPFS API] JWT length:", jwt.length);

    if (contentType.includes("application/json")) {
      const body = await req.json();

      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[IPFS API] Pinata JSON error:", response.status, errText);
        return NextResponse.json(
          { error: `Pinata JSON pinning failed (${response.status}): ${errText || response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log("[IPFS API] JSON pinned successfully:", data.IpfsHash);
      return NextResponse.json({ ipfsHash: data.IpfsHash });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      console.log("[IPFS API] Uploading file:", file.name, "size:", file.size);

      const pinataFormData = new FormData();
      pinataFormData.append("file", file);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: pinataFormData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[IPFS API] Pinata file error:", response.status, errText);
        return NextResponse.json(
          { error: `Pinata File pinning failed (${response.status}): ${errText || response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log("[IPFS API] File pinned successfully:", data.IpfsHash);
      return NextResponse.json({ ipfsHash: data.IpfsHash });
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (error: any) {
    console.error("[IPFS API] Unhandled error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
