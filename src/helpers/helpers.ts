import { BigDecimal } from "generated";

export function hexToNumberString(hex: string): bigint {
  return BigInt(hex);
}

export function toDecimal(value: bigint, decimals: number = 18): BigDecimal {
  const divisor = new BigDecimal(10).pow(decimals);
  return new BigDecimal(value.toString()).div(divisor);
}

export async function getVoter(address: string, context: any) {
  let voter = await context.Voter.get(address);
  if (!voter) {
    voter = {
      id: address,
      isVoteDelegate: undefined,
      isVoteProxy: undefined,
      delegateContract_id: undefined,
      proxyContract_id: undefined,
      mkrLockedInChiefRaw: 0n,
      mkrLockedInChief: new BigDecimal("0"),
      skyLockedInChiefRaw: 0n,
      skyLockedInChief: new BigDecimal("0"),
      currentSpells: [] as string[],
      currentSpellsV2: [] as string[],
      numberExecutiveVotes: 0,
      numberExecutiveVotesV2: 0,
      numberPollVotes: 0,
      lastVotedTimestamp: 0n,
    };
  }
  return voter;
}

export function createExecutiveVotingPowerChange(
  event: any,
  amount: bigint,
  previousBalance: bigint,
  newBalance: bigint,
  voter: string,
) {
  const id = `${event.block.timestamp}-${event.logIndex}`;
  return {
    id,
    amount,
    previousBalance,
    newBalance,
    voter_id: voter,
    tokenAddress: event.srcAddress,
    txnHash: event.transaction.hash,
    blockTimestamp: BigInt(event.block.timestamp),
    logIndex: BigInt(event.logIndex),
    blockNumber: BigInt(event.block.number),
  };
}

export function createExecutiveVotingPowerChangeV2(
  event: any,
  amount: bigint,
  previousBalance: bigint,
  newBalance: bigint,
  voter: string,
) {
  const id = `${event.block.timestamp}-${event.logIndex}`;
  return {
    id,
    amount,
    previousBalance,
    newBalance,
    voter_id: voter,
    tokenAddress: event.srcAddress,
    txnHash: event.transaction.hash,
    blockTimestamp: BigInt(event.block.timestamp),
    logIndex: BigInt(event.logIndex),
    blockNumber: BigInt(event.block.number),
  };
}

export async function createSlate(
  slateID: string,
  event: any,
  context: any,
): Promise<any> {
  const slate = {
    id: slateID,
    yays: [] as string[],
    txnHash: event.transaction.hash,
    creationBlock: BigInt(event.block.number),
    creationTime: BigInt(event.block.timestamp),
  };

  // TODO: Implement RPC calls to read slate contents from DSChief contract
  // In the original code, this loops through dsChief.try_slates(slateID, i) until revert
  // and creates Spell entities for each spell found.
  // For each spell address found:
  //   - If Spell entity doesn't exist and address != ZERO_ADDRESS:
  //     - Create new Spell with state ACTIVE, read description/expiration from DSSpell contract
  //   - Append spellID to slate.yays

  context.Slate.set(slate);
  return slate;
}

export async function createSlateV2(
  slateID: string,
  event: any,
  context: any,
): Promise<any> {
  const slate = {
    id: slateID,
    yays: [] as string[],
    txnHash: event.transaction.hash,
    creationBlock: BigInt(event.block.number),
    creationTime: BigInt(event.block.timestamp),
  };

  // TODO: Implement RPC calls to read slate contents from DSChiefV2 contract
  // In the original code, this loops through dsChiefV2.try_slates(slateID, i) until revert
  // and creates SpellV2 entities for each spell found.
  // For each spell address found:
  //   - If SpellV2 entity doesn't exist and address != ZERO_ADDRESS:
  //     - Create new SpellV2 with state ACTIVE, read description/expiration from DSSpellV2 contract
  //   - Append spellID to slate.yays

  context.SlateV2.set(slate);
  return slate;
}

export async function addWeightToSpells(
  spellIDs: string[],
  weight: bigint,
  context: any,
): Promise<void> {
  for (let i = 0; i < spellIDs.length; i++) {
    const spell = await context.Spell.get(spellIDs[i]);
    if (spell) {
      context.Spell.set({
        ...spell,
        totalWeightedVotes: spell.totalWeightedVotes + weight,
      });
    }
  }
}

export async function addWeightToSpellsV2(
  spellIDs: string[],
  weight: bigint,
  context: any,
): Promise<void> {
  for (let i = 0; i < spellIDs.length; i++) {
    const spell = await context.SpellV2.get(spellIDs[i]);
    if (spell) {
      context.SpellV2.set({
        ...spell,
        totalWeightedVotes: spell.totalWeightedVotes + weight,
      });
    }
  }
}

export async function removeWeightFromSpells(
  spellIDs: string[],
  weight: bigint,
  context: any,
): Promise<void> {
  for (let i = 0; i < spellIDs.length; i++) {
    const spell = await context.Spell.get(spellIDs[i]);
    if (spell) {
      context.Spell.set({
        ...spell,
        totalWeightedVotes: spell.totalWeightedVotes - weight,
      });
    }
  }
}

export async function removeWeightFromSpellsV2(
  spellIDs: string[],
  weight: bigint,
  context: any,
): Promise<void> {
  for (let i = 0; i < spellIDs.length; i++) {
    const spell = await context.SpellV2.get(spellIDs[i]);
    if (spell) {
      context.SpellV2.set({
        ...spell,
        totalWeightedVotes: spell.totalWeightedVotes - weight,
      });
    }
  }
}
