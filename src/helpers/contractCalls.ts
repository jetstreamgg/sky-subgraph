import {
  createPublicClient,
  http,
  type PublicClient,
  type Address,
} from 'viem';
import { mainnet } from 'viem/chains';
import { createEffect, S } from 'envio';

// ABI fragments for the contract calls we need
const dsChiefSlatesAbi = [
  {
    name: 'slates',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const dsSpellAbi = [
  {
    name: 'description',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'expiration',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const mkrSkyRateAbi = [
  {
    name: 'rate',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const ownerUrnsAbi = [
  {
    name: 'ownerUrns',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const curveCoinsAbi = [
  {
    name: 'coins',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

// Client cache per chain
const clients: Record<number, PublicClient> = {};

function getClient(chainId: number): PublicClient {
  if (!clients[chainId]) {
    const rpcUrl =
      chainId === 1
        ? process.env.MAINNET_RPC_URL ||
          'https://mainnet.gateway.tenderly.co/2fWPiJ0Gnu8RsOBx7YzxQ4'
        : chainId === 314310
          ? 'https://virtual.rpc.tenderly.co/jetstreamgg/jetstream/public/jetstream-testnet'
          : chainId === 8453
            ? process.env.BASE_RPC_URL ||
              'https://base.gateway.tenderly.co/24BjVbbeeSyjlZAzD0CAKj'
            : chainId === 10
              ? process.env.OPTIMISM_RPC_URL ||
                'https://optimism.gateway.tenderly.co/1A96AkuGadycEK3KNUgdJW'
              : chainId === 42161
                ? process.env.ARBITRUM_RPC_URL ||
                  'https://arbitrum.gateway.tenderly.co/5R5UVFaPyITIBobelen0Mt'
                : chainId === 130
                  ? process.env.UNICHAIN_RPC_URL ||
                    'https://unichain.gateway.tenderly.co/39xHYqwyuwCNH6Y89IFWeS'
                  : 'https://mainnet.gateway.tenderly.co/2fWPiJ0Gnu8RsOBx7YzxQ4';

    clients[chainId] = createPublicClient({
      chain: mainnet,
      batch: { multicall: true },
      transport: http(rpcUrl),
    });
  }
  return clients[chainId];
}

// === Effects ===

export const readOwnerUrnsEffect = createEffect(
  {
    name: 'readOwnerUrns',
    input: {
      chainId: S.int32,
      engineAddress: S.string,
      owner: S.string,
      index: S.bigint,
    },
    output: S.string,
    rateLimit: { calls: 10, per: 'second' as const },
    cache: true,
  },
  async ({ input }) => {
    try {
      const client = getClient(input.chainId);
      const result = await client.readContract({
        address: input.engineAddress as Address,
        abi: ownerUrnsAbi,
        functionName: 'ownerUrns',
        args: [input.owner as Address, input.index],
      });
      return (result as string).toLowerCase();
    } catch {
      return `${input.engineAddress}-${input.owner}-${input.index}`.toLowerCase();
    }
  },
);

export const readMkrSkyRateEffect = createEffect(
  {
    name: 'readMkrSkyRate',
    input: { chainId: S.int32, mkrSkyAddress: S.string },
    output: S.bigint,
    rateLimit: { calls: 5, per: 'second' as const },
    cache: true,
  },
  async ({ input }) => {
    try {
      const client = getClient(input.chainId);
      const result = await client.readContract({
        address: input.mkrSkyAddress as Address,
        abi: mkrSkyRateAbi,
        functionName: 'rate',
      });
      return result as bigint;
    } catch {
      return 24000n;
    }
  },
);

export const readCurvePoolCoinEffect = createEffect(
  {
    name: 'readCurvePoolCoin',
    input: { chainId: S.int32, poolAddress: S.string, index: S.bigint },
    output: S.string,
    rateLimit: { calls: 5, per: 'second' as const },
    cache: true,
  },
  async ({ input }) => {
    try {
      const client = getClient(input.chainId);
      const result = await client.readContract({
        address: input.poolAddress as Address,
        abi: curveCoinsAbi,
        functionName: 'coins',
        args: [input.index],
      });
      return (result as string).toLowerCase();
    } catch {
      return 'unknown';
    }
  },
);

export const readDSChiefSlateEffect = createEffect(
  {
    name: 'readDSChiefSlate',
    input: {
      chainId: S.int32,
      chiefAddress: S.string,
      slateId: S.string,
      index: S.bigint,
    },
    output: S.string,
    rateLimit: { calls: 10, per: 'second' as const },
    cache: true,
  },
  async ({ input }) => {
    try {
      const client = getClient(input.chainId);
      const result = await client.readContract({
        address: input.chiefAddress as Address,
        abi: dsChiefSlatesAbi,
        functionName: 'slates',
        args: [input.slateId as `0x${string}`, input.index],
      });
      return result as string;
    } catch {
      return '';
    }
  },
);

export const readSpellDescriptionEffect = createEffect(
  {
    name: 'readSpellDescription',
    input: { chainId: S.int32, spellAddress: S.string },
    output: S.string,
    rateLimit: { calls: 5, per: 'second' as const },
    cache: true,
  },
  async ({ input }) => {
    try {
      const client = getClient(input.chainId);
      const result = await client.readContract({
        address: input.spellAddress as Address,
        abi: dsSpellAbi,
        functionName: 'description',
      });
      return result as string;
    } catch {
      return '';
    }
  },
);

export const readSpellExpirationEffect = createEffect(
  {
    name: 'readSpellExpiration',
    input: { chainId: S.int32, spellAddress: S.string },
    output: S.bigint,
    rateLimit: { calls: 5, per: 'second' as const },
    cache: true,
  },
  async ({ input }) => {
    try {
      const client = getClient(input.chainId);
      const result = await client.readContract({
        address: input.spellAddress as Address,
        abi: dsSpellAbi,
        functionName: 'expiration',
      });
      return result as bigint;
    } catch {
      return 0n;
    }
  },
);
