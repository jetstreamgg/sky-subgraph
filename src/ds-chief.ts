import { BigInt, Bytes, Address, ethereum } from '@graphprotocol/graph-ts';
import { LogNote } from '../generated/DSChief/DSChief';
import {
  ExecutiveVote,
  Slate,
  Spell,
} from '../generated/schema';
import { BIGINT_ONE, SpellState } from './helpers/constants';
import {
  addWeightToSpells,
  createExecutiveVotingPowerChange,
  createSlate,
  getVoter,
  hexToNumberString,
  removeWeightFromSpells,
  toDecimal,
} from './helpers/helpers';

export function handleLock(event: LogNote): void {
  const sender = event.params.guy; // guy is the sender
  const amountStr = hexToNumberString(event.params.foo.toHexString());
  const amount = BigInt.fromString(amountStr); //.foo is the amount being locked

  const voter = getVoter(sender.toHexString());

  // Track the change of MKR locked in chief for the user
  const ExecutiveVotingPowerChange = createExecutiveVotingPowerChange(
    event,
    amount,
    voter.mkrLockedInChiefRaw,
    voter.mkrLockedInChiefRaw.plus(amount),
    voter.id,
  );

  ExecutiveVotingPowerChange.save();

  // Update the amount of MKR locked in chief for the voter
  voter.mkrLockedInChiefRaw = voter.mkrLockedInChiefRaw.plus(amount);
  voter.mkrLockedInChief = toDecimal(voter.mkrLockedInChiefRaw);
  voter.save();

  // Update the weight in all the executives supported
  addWeightToSpells(voter.currentSpells, amount);
}

export function handleFree(event: LogNote): void {
  const sender = event.params.guy; // guy is the sender
  const amountStr = hexToNumberString(event.params.foo.toHexString());
  const amount = BigInt.fromString(amountStr); //.foo is the amount being locked

  const voter = getVoter(sender.toHexString());

  // Track the change of MKR locked in chief for the user
  const ExecutiveVotingPowerChange = createExecutiveVotingPowerChange(
    event,
    amount,
    voter.mkrLockedInChiefRaw,
    voter.mkrLockedInChiefRaw.minus(amount),
    voter.id,
  );

  ExecutiveVotingPowerChange.save();

  // Update the amount of MKR locked in chief for the voter
  voter.mkrLockedInChiefRaw = voter.mkrLockedInChiefRaw.minus(amount);
  voter.mkrLockedInChief = toDecimal(voter.mkrLockedInChiefRaw);
  voter.save();

  // Update the weight in all the executives supported
  removeWeightFromSpells(voter.currentSpells, amount);
}

export function handleVote(event: LogNote): void {
  const sender = event.params.guy.toHexString(); // guy is the sender
  const slateId = event.params.foo; // foo is slate id
  _handleSlateVote(sender, slateId, event);
}

function _handleSlateVote(
  sender: string,
  slateId: Bytes,
  event: ethereum.Event,
): void {
  const voter = getVoter(sender);
  let slate = Slate.load(slateId.toHexString());
  if (!slate) {
    slate = createSlate(slateId, event);
  }
  // Remove votes from previous spells
  removeWeightFromSpells(voter.currentSpells, voter.mkrLockedInChiefRaw);
  for (let i = 0; i < slate.yays.length; i++) {
    const spellId = slate.yays[i];
    const spell = Spell.load(spellId);
    if (spell) {
      const voteId = spellId.concat('-').concat(sender);
      const vote = new ExecutiveVote(voteId);
      vote.weight = voter.mkrLockedInChiefRaw;
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
        voter.mkrLockedInChiefRaw,
      );
      spell.save();
    }
  }
  voter.currentSpells = slate.yays;
  voter.numberExecutiveVotes = voter.numberExecutiveVotes + 1;
  voter.lastVotedTimestamp = event.block.timestamp;
  voter.save();
}

export function handleLift(event: LogNote): void {
  // foo is the spellId in bytes, we trim and convert to address
  const spellId = Address.fromString(event.params.foo.toHexString().slice(26));

  const spell = Spell.load(spellId.toHexString());
  if (!spell) return;
  spell.state = SpellState.LIFTED;
  spell.liftedTxnHash = event.transaction.hash.toHexString();
  spell.liftedBlock = event.block.number;
  spell.liftedTime = event.block.timestamp;
  spell.liftedWith = spell.totalWeightedVotes;
  spell.save();
}
