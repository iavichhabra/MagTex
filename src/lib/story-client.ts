import { StoryClient, StoryConfig, PILFlavor, WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { http, parseEther } from "viem";
import { storyAeneid } from "./chains";
import { STORY_CONTRACTS } from "./contracts";

export function createStoryClient(walletClient: any) {
  const config: StoryConfig = {
    account: walletClient.account,
    transport: http(),
    chainId: "aeneid",
  };
  return StoryClient.newClient(config);
}

export async function registerIPAsset(
  walletClient: any,
  metadata: {
    title: string;
    description: string;
    severity: string;
    category: string;
    affectedProject: string;
    price: string;
  },
  ipfsHashes: { metadata: string; nft: string }
) {
  const client = createStoryClient(walletClient);

  const ipMetadata = client.ipAsset.generateIpMetadata({
    title: metadata.title,
    description: metadata.description,
    ipType: "research",
    attributes: [
      { key: "Severity", value: metadata.severity },
      { key: "Category", value: metadata.category },
      { key: "Project", value: metadata.affectedProject },
      { key: "Platform", value: "VulnVault" },
    ],
  });

  const nftMetadata = {
    name: `VulnVault: ${metadata.title}`,
    description: metadata.description,
    attributes: [
      { trait_type: "Severity", value: metadata.severity },
      { trait_type: "Category", value: metadata.category },
    ],
  };

  const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
    spgNftContract: STORY_CONTRACTS.spgNftContract,
    licenseTermsData: [
      {
        terms: PILFlavor.commercialRemix({
          commercialRevShare: 10,
          defaultMintingFee: parseEther(metadata.price),
          currency: WIP_TOKEN_ADDRESS,
        }),
      },
    ],
    ipMetadata: {
      ipMetadataURI: `https://ipfs.io/ipfs/${ipfsHashes.metadata}`,
      ipMetadataHash: `0x${await sha256(JSON.stringify(ipMetadata))}`,
      nftMetadataURI: `https://ipfs.io/ipfs/${ipfsHashes.nft}`,
      nftMetadataHash: `0x${await sha256(JSON.stringify(nftMetadata))}`,
    },
    txOptions: {},
  });

  return {
    txHash: response.txHash,
    ipId: response.ipId,
    licenseTermsId: response.licenseTermsIds?.[0],
  };
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
