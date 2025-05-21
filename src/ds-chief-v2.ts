import { Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Lock, Free, Vote, Lift } from '../generated/DSChiefV2/DSChiefV2';
import {
  ExecutiveVoteV2,
  SlateV2,
  SpellV2,
} from '../generated/schema';
import { BIGINT_ONE, SpellState } from './helpers/constants';
import {
  addWeightToSpellsV2,
  createExecutiveVotingPowerChangeV2,
  createSlateV2,
  getVoter,
  removeWeightFromSpellsV2,
  toDecimal,
} from './helpers/helpers';

export function handleChiefV2Lock(event: Lock): void {
  const sender = event.params.usr;
  const amount = event.params.wad;

  const voter = getVoter(sender.toHexString());

  // Track the change of SKY locked in chief for the user
  const ExecutiveVotingPowerChangeV2 = createExecutiveVotingPowerChangeV2(
    event,
    amount,
    voter.skyLockedInChiefRaw,
    voter.skyLockedInChiefRaw.plus(amount),
    voter.id,
  );

  ExecutiveVotingPowerChangeV2.save();

  // Update the amount of SKY locked in chief for the voter
  voter.skyLockedInChiefRaw = voter.skyLockedInChiefRaw.plus(amount);
  voter.skyLockedInChief = toDecimal(voter.skyLockedInChiefRaw);
  voter.save();

  // Update the weight in all the executives supported
  addWeightToSpellsV2(voter.currentSpellsV2, amount);
}

export function handleChiefV2Free(event: Free): void {
  const sender = event.params.usr;
  const amount = event.params.wad;

  const voter = getVoter(sender.toHexString());

  // Track the change of SKY locked in chief for the user
  const ExecutiveVotingPowerChangeV2 = createExecutiveVotingPowerChangeV2(
    event,
    amount,
    voter.skyLockedInChiefRaw,
    voter.skyLockedInChiefRaw.minus(amount),
    voter.id,
  );

  ExecutiveVotingPowerChangeV2.save();

  // Update the amount of SKY locked in chief for the voter
  voter.skyLockedInChiefRaw = voter.skyLockedInChiefRaw.minus(amount);
  voter.skyLockedInChief = toDecimal(voter.skyLockedInChiefRaw);
  voter.save();

  // Update the weight in all the executives supported
  removeWeightFromSpellsV2(voter.currentSpellsV2, amount);
}

export function handleChiefV2Vote(event: Vote): void {
  const sender = event.params.usr.toHexString();
  const slateId = event.params.slate;
  _handleSlateVote(sender, slateId, event);
}

function _handleSlateVote(
  sender: string,
  slateId: Bytes,
  event: ethereum.Event,
): void {
  const voter = getVoter(sender);
  let slate = SlateV2.load(slateId.toHexString());
  if (!slate) {
    slate = createSlateV2(slateId, event);
  }
  // Remove votes from previous spells
  removeWeightFromSpellsV2(voter.currentSpellsV2, voter.skyLockedInChiefRaw);
  for (let i = 0; i < slate.yays.length; i++) {
    const spellId = slate.yays[i];
    const spell = SpellV2.load(spellId);
    if (spell) {
      const voteId = spellId.concat('-').concat(sender);
      const vote = new ExecutiveVoteV2(voteId);
      vote.weight = voter.skyLockedInChiefRaw;
      vote.reason = '';
      vote.voter = sender;
      vote.spell = spellId;
      vote.block = event.block.number;
      vote.blockTime = event.block.timestamp;
      vote.txnHash = event.transaction.hash.toHexString();
      vote.logIndex = event.logIndex;
      vote.save();
      spell.totalVotes = spell.totalVotes.plus(BIGINT_ONE);
      spell.totalWeightedVotes = spell.totalWeightedVotes.plus(
        voter.skyLockedInChiefRaw,
      );
      spell.save();
    }
  }
  voter.currentSpellsV2 = slate.yays;
  voter.numberExecutiveVotesV2 = voter.numberExecutiveVotesV2 + 1;
  voter.lastVotedTimestamp = event.block.timestamp;
  voter.save();
}

export function handleChiefV2Lift(event: Lift): void {
  const spellId = event.params.whom;

  const spell = SpellV2.load(spellId.toHexString());
  if (!spell) return;
  spell.state = SpellState.LIFTED;
  spell.liftedTxnHash = event.transaction.hash.toHexString();
  spell.liftedBlock = event.block.number;
  spell.liftedTime = event.block.timestamp;
  spell.liftedWith = spell.totalWeightedVotes;
  spell.save();
}
