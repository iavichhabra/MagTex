export async function uploadJSONToIPFS(data: object): Promise<string> {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("IPFS upload failed");
  const result = await response.json();
  return result.IpfsHash;
}

export async function uploadFileToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error("File upload failed");
  const result = await response.json();
  return result.IpfsHash;
}

export function getIPFSUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}
