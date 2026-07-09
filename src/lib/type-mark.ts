import type { Address } from "viem";

export const MAX_PHRASE_LENGTH = 64;
export const MAX_STYLE_LENGTH = 24;
export const MAX_INK_LENGTH = 24;
export const MAX_NOTE_LENGTH = 120;

export const typeMarkAbi = [
  {
    type: "event",
    name: "MarkStamped",
    inputs: [
      { name: "markId", type: "uint256", indexed: true },
      { name: "maker", type: "address", indexed: true },
      { name: "phrase", type: "string", indexed: false },
      { name: "styleName", type: "string", indexed: false },
      { name: "ink", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "stampMark",
    stateMutability: "nonpayable",
    inputs: [
      { name: "phrase", type: "string" },
      { name: "styleName", type: "string" },
      { name: "ink", type: "string" },
      { name: "note", type: "string" },
    ],
    outputs: [{ name: "markId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getMark",
    stateMutability: "view",
    inputs: [{ name: "markId", type: "uint256" }],
    outputs: [
      { name: "maker", type: "address" },
      { name: "phrase", type: "string" },
      { name: "styleName", type: "string" },
      { name: "ink", type: "string" },
      { name: "note", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextMarkId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredTypeMarkContractAddress =
  process.env.NEXT_PUBLIC_TYPE_MARK_CONTRACT_ADDRESS?.trim();

export const typeMarkContractAddress = isAddressLike(configuredTypeMarkContractAddress)
  ? (configuredTypeMarkContractAddress as Address)
  : undefined;
