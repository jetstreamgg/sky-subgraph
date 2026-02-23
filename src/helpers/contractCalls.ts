import { createPublicClient, http, type PublicClient, type Address } from "viem";
import { mainnet } from "viem/chains";

// ABI fragments for the contract calls we need
const dsChiefSlatesAbi = [
  {
    name: "slates",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const dsSpellAbi = [
  {
    name: "description",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "expiration",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const mkrSkyRateAbi = [
  {
    name: "rate",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const ownerUrnsAbi = [
  {
    name: "ownerUrns",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const curveCoinsAbi = [
  {
    name: "coins",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

// Client cache per chain
const clients: Record<number, PublicClient> = {};

function getClient(chainId: number): PublicClient {
  if (!clients[chainId]) {
    const rpcUrl =
      chainId === 1
        ? process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com"
        : chainId === 314310
          ? "https://virtual.rpc.tenderly.co/jetstreamgg/jetstream/public/jetstream-testnet"
          : chainId === 8453
            ? process.env.BASE_RPC_URL || "https://mainnet.base.org"
            : chainId === 10
              ? process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io"
              : chainId === 42161
                ? process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc"
                : chainId === 130
                  ? process.env.UNICHAIN_RPC_URL || "https://mainnet.unichain.org"
                  : "https://eth.llamarpc.com";

    clients[chainId] = createPublicClient({
      chain: mainnet,
      transport: http(rpcUrl),
    });
  }
  return clients[chainId];
}

/**
 * Read a slate entry from DSChief contract
 * Returns the spell address at the given index, or null if the index is out of bounds
 */
export async function readDSChiefSlate(
  chainId: number,
  chiefAddress: string,
  slateId: string,
  index: bigint
): Promise<string | null> {
  try {
    const client = getClient(chainId);
    const result = await client.readContract({
      address: chiefAddress as Address,
      abi: dsChiefSlatesAbi,
      functionName: "slates",
      args: [slateId as `0x${string}`, index],
    });
    return result as string;
  } catch {
    return null;
  }
}

/**
 * Read spell description from DSSpell contract
 */
export async function readSpellDescription(
  chainId: number,
  spellAddress: string
): Promise<string> {
  try {
    const client = getClient(chainId);
    const result = await client.readContract({
      address: spellAddress as Address,
      abi: dsSpellAbi,
      functionName: "description",
    });
    return result as string;
  } catch {
    return "";
  }
}

/**
 * Read spell expiration from DSSpell contract
 */
export async function readSpellExpiration(
  chainId: number,
  spellAddress: string
): Promise<bigint> {
  try {
    const client = getClient(chainId);
    const result = await client.readContract({
      address: spellAddress as Address,
      abi: dsSpellAbi,
      functionName: "expiration",
    });
    return result as bigint;
  } catch {
    return 0n;
  }
}

/**
 * Read MKR/SKY conversion rate from MkrSky contract
 */
export async function readMkrSkyRate(
  chainId: number,
  mkrSkyAddress: string
): Promise<bigint> {
  try {
    const client = getClient(chainId);
    const result = await client.readContract({
      address: mkrSkyAddress as Address,
      abi: mkrSkyRateAbi,
      functionName: "rate",
    });
    return result as bigint;
  } catch {
    // Default rate: 24000 (1 MKR = 24000 SKY)
    return 24000n;
  }
}

/**
 * Read urn address from LockstakeEngine or StakingEngine contract
 */
export async function readOwnerUrns(
  chainId: number,
  engineAddress: string,
  owner: string,
  index: bigint
): Promise<string> {
  try {
    const client = getClient(chainId);
    const result = await client.readContract({
      address: engineAddress as Address,
      abi: ownerUrnsAbi,
      functionName: "ownerUrns",
      args: [owner as Address, index],
    });
    return (result as string).toLowerCase();
  } catch {
    // Fallback: derive deterministic address
    return `${engineAddress}-${owner}-${index}`.toLowerCase();
  }
}

/**
 * Read token address from Curve pool
 */
export async function readCurvePoolCoin(
  chainId: number,
  poolAddress: string,
  index: bigint
): Promise<string> {
  try {
    const client = getClient(chainId);
    const result = await client.readContract({
      address: poolAddress as Address,
      abi: curveCoinsAbi,
      functionName: "coins",
      args: [index],
    });
    return (result as string).toLowerCase();
  } catch {
    return "unknown";
  }
}
