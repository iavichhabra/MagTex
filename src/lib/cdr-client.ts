import { CDRClient, initWasm, GatewayProvider } from "@piplabs/cdr-sdk";
import { createPublicClient, http } from "viem";
import { storyAeneid } from "./chains";
import { STORY_CONTRACTS } from "./contracts";

let wasmInitialized = false;

async function ensureWasm() {
  if (!wasmInitialized) {
    await initWasm();
    wasmInitialized = true;
  }
}

export async function createCDRClient(walletClient: any) {
  await ensureWasm();

  const publicClient = createPublicClient({
    chain: storyAeneid,
    transport: http(),
  });

  return new CDRClient({
    network: "testnet",
    publicClient,
    walletClient,
    apiUrl: process.env.NEXT_PUBLIC_CDR_API_URL || "http://172.192.41.96:1317",
  });
}

export async function encryptReportVault(
  walletClient: any,
  sellerAddress: `0x${string}`,
  encryptedDataKey: Uint8Array
): Promise<string> {
  const client = await createCDRClient(walletClient);
  const globalPubKey = await client.observer.getGlobalPubKey();

  const { uuid } = await client.uploader.uploadCDR({
    dataKey: encryptedDataKey,
    globalPubKey,
    updatable: true,
    writeConditionAddr: STORY_CONTRACTS.ownerWriteCondition,
    readConditionAddr: STORY_CONTRACTS.licenseReadCondition,
    writeConditionData: sellerAddress,
    readConditionData: "0x",
    accessAuxData: "0x",
  });

  return uuid.toString();
}

export async function decryptReportVault(
  walletClient: any,
  uuid: string
): Promise<Uint8Array> {
  const client = await createCDRClient(walletClient);

  const { dataKey } = await client.consumer.accessCDR({
    uuid: Number(uuid),
    accessAuxData: "0x",
    timeoutMs: 120_000,
  });

  return dataKey;
}

export function createGatewayProvider() {
  return new GatewayProvider({
    apiUrl: process.env.NEXT_PUBLIC_CDR_API_URL || "http://172.192.41.96:1317",
    gatewayUrl: "https://gateway.pinata.cloud/ipfs",
  });
}
