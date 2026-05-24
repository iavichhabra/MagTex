export const VULNVAULT_REGISTRY = "0x208d56bF31b9e404d8B203201b041D0cB80822a9" as const;

export const VULNVAULT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
    ],
    name: "AccessGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "ipId", type: "address" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "string", name: "cdrUUID", type: "string" },
    ],
    name: "ReportListed",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint8", name: "rating", type: "uint8" },
      { internalType: "string", name: "comment", type: "string" },
    ],
    name: "submitReview",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "ipId", type: "address" },
      { internalType: "string", name: "cdrUUID", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "uint256", name: "licenseTermsId", type: "uint256" },
    ],
    name: "listReport",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "purchaseReport",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "researcher", type: "address" }],
    name: "sendTip",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "deactivateListing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "seller", type: "address" }],
    name: "getSellerListings",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "hasAccess",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "listings",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "address", name: "ipId", type: "address" },
      { internalType: "string", name: "cdrUUID", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "bool", name: "active", type: "bool" },
      { internalType: "uint256", name: "licenseTermsId", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "listingCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
    ],
    name: "reputationScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
    ],
    name: "totalEarnings",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
    ],
    name: "totalTips",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "getListingReviews",
    outputs: [
      {
        components: [
          { internalType: "address", name: "reviewer", type: "address" },
          { internalType: "uint8", name: "rating", type: "uint8" },
          { internalType: "string", name: "comment", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct VulnVaultRegistry.Review[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "buyer", type: "address" },
    ],
    name: "getBuyerListings",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const STORY_CONTRACTS = {
  spgNftContract: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
  licensingModule: "0x0000000000000000000000000000000000000000",
  wipToken: "0x1514000000000000000000000000000000000000",
  ownerWriteCondition: "0x4C9bFC96d7092b590D497A191826C3dA2277c34B",
  licenseReadCondition: "0xC0640AD4CF2CaA9914C8e5C44234359a9102f7a3",
} as const;
