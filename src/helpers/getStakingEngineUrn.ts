import { ZERO_ADDRESS } from './constants.js';

export async function getStakingEngineUrn(urnAddress: string, context: any) {
  let urn = await context.StakingUrn.get(urnAddress);
  if (!urn) {
    urn = {
      id: urnAddress,
      owner: ZERO_ADDRESS,
      index: 0n,
      blockNumber: 0n,
      blockTimestamp: 0n,
      transactionHash: "0x",
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
  // TODO: Implement RPC call to StakingEngine.ownerUrns(owner, index)
  // For now, derive a deterministic address
  return `${contractAddress}-${owner}-${index}`;
}
