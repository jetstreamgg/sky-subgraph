import { ZERO_ADDRESS } from './constants.js';

export async function getSealUrn(urnAddress: string, context: any) {
  let urn = await context.SealUrn.get(urnAddress);
  if (!urn) {
    urn = {
      id: urnAddress,
      owner: ZERO_ADDRESS,
      index: 0n,
      blockNumber: 0n,
      blockTimestamp: 0n,
      transactionHash: "0x",
      mkrLocked: 0n,
      usdsDebt: 0n,
      skyLocked: 0n,
      auctionsCount: 0n,
      voteDelegate_id: undefined,
      reward_id: undefined,
    };
  }
  return urn;
}

export async function getUrnAddress(
  contractAddress: string,
  owner: string,
  index: bigint,
): Promise<string> {
  // TODO: Implement RPC call to LockstakeEngine.ownerUrns(owner, index)
  // For now, derive a deterministic address
  return `${contractAddress}-${owner}-${index}`;
}
