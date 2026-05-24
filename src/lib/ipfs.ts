export async function uploadJSONToIPFS(data: object): Promise<string> {
  if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    throw new Error("Missing NEXT_PUBLIC_PINATA_JWT environment variable. Please check your .env.local file.");
  }
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`IPFS JSON upload failed with status ${response.status}: ${errText || response.statusText}`);
  }
  const result = await response.json();
  return result.IpfsHash;
}

export async function uploadFileToIPFS(file: File): Promise<string> {
  if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    throw new Error("Missing NEXT_PUBLIC_PINATA_JWT environment variable. Please check your .env.local file.");
  }
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`IPFS File upload failed with status ${response.status}: ${errText || response.statusText}`);
  }
  const result = await response.json();
  return result.IpfsHash;
}

export function getIPFSUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}
