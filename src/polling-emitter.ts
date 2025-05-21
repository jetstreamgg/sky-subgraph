import {
  PollCreated,
  PollWithdrawn,
  Voted,
} from '../generated/PollingEmitter/PollingEmitter';
import { Poll, PollVote } from '../generated/schema';
import { getVoter } from './helpers/helpers';

export function handlePollCreated(event: PollCreated): void {
  const creator = event.params.creator.toHexString();
  const blockCreated = event.params.blockCreated;
  const pollId = event.params.pollId;
  const startDate = event.params.startDate;
  const endDate = event.params.endDate;
  const multiHash = event.params.multiHash;
  const url = event.params.url;

  let poll = Poll.load(pollId.toString());

  if (!poll) {
    poll = new Poll(pollId.toString());
  }
  //always update poll properties, in case it was previously created with just an id in the vote handler
  poll.creator = creator;
  poll.blockCreated = blockCreated;
  poll.startDate = startDate;
  poll.endDate = endDate;
  poll.multiHash = multiHash;
  poll.save();
}

export function handlePollWithdrawn(event: PollWithdrawn): void {
  const creator = event.params.creator.toHexString();
  const blockWithdrawn = event.params.blockWithdrawn;
  const pollId = event.params.pollId;

  let poll = Poll.load(pollId.toString());

  if (poll) {
    poll.blockWithdrawn = blockWithdrawn;
    poll.withdrawnBy = creator;
    poll.save();
  }
}

export function handlePollVote(event: Voted): void {
  const sender = event.params.voter.toHexString();
  const pollId = event.params.pollId.toString();
  const optionId = event.params.optionId;

  const voter = getVoter(sender);

  let poll = Poll.load(pollId);
  if (!poll) { //poll won't exist if it was created on arbitrum
    poll = new Poll(pollId);
    poll.save();
  }

  voter.lastVotedTimestamp = event.block.timestamp;

  const voteId = `${pollId}-${sender}-${event.block.number}`;

  let pollVote = PollVote.load(voteId);
  if (!pollVote) {
    pollVote = new PollVote(voteId);
    pollVote.voter = voter.id;
    pollVote.poll = poll.id;
    voter.numberPollVotes = voter.numberPollVotes + 1;
  }

  pollVote.choice = optionId;
  pollVote.block = event.block.number;
  pollVote.blockTime = event.block.timestamp;
  pollVote.txnHash = event.transaction.hash.toHexString();
  pollVote.save();

  voter.save();
}
