import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json(
        { error: "Pinata JWT is not configured on the server. Please check your .env.local file." },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

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
        return NextResponse.json(
          { error: `Pinata JSON pinning failed: ${errText || response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ ipfsHash: data.IpfsHash });
    } 
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

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
        return NextResponse.json(
          { error: `Pinata File pinning failed: ${errText || response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ ipfsHash: data.IpfsHash });
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (error: any) {
    console.error("API IPFS Upload Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
