import {
    Voted
  } from '../generated/PollingEmitter/PollingEmitter';
  import { ArbitrumPollVote, ArbitrumPoll, ArbitrumVoter } from '../generated/schema';
  import { BIGINT_ZERO } from './helpers/constants';
  import { PollCreated } from '../generated/PollingEmitterArbitrum/PollingEmitter';

  // Helper function to get or create an ArbitrumVoter
  function getArbitrumVoter(address: string): ArbitrumVoter {
    let voter = ArbitrumVoter.load(address);
    if (!voter) {
      voter = new ArbitrumVoter(address);
      voter.numberPollVotes = 0;
      voter.lastVotedTimestamp = BIGINT_ZERO;
    }
    return voter;
  }

  export function handlePollVote(event: Voted): void {
    const sender = event.params.voter.toHexString();
    const pollId = event.params.pollId.toString();
    const optionId = event.params.optionId;

    const voter = getArbitrumVoter(sender);
    voter.lastVotedTimestamp = event.block.timestamp;

    const voteId = `${pollId}-${sender}-${event.block.number}`;

    let pollVote = ArbitrumPollVote.load(voteId);
    if (!pollVote) {
      pollVote = new ArbitrumPollVote(voteId);
      voter.numberPollVotes = voter.numberPollVotes + 1;
    }

    let poll = ArbitrumPoll.load(pollId);
    if (!poll) {
      poll = new ArbitrumPoll(pollId);
      poll.save();
    }

    pollVote.voter = voter.id;
    pollVote.poll = poll.id;
    pollVote.choice = optionId;
    pollVote.block = event.block.number;
    pollVote.blockTime = event.block.timestamp;
    pollVote.txnHash = event.transaction.hash.toHexString();
    pollVote.save();

    voter.save();
}

export function handlePollCreated(event: PollCreated): void {
  const creator = event.params.creator.toHexString();
  const blockCreated = event.params.blockCreated;
  const pollId = event.params.pollId;
  const startDate = event.params.startDate;
  const endDate = event.params.endDate;
  const multiHash = event.params.multiHash;
  const url = event.params.url;

  let poll = ArbitrumPoll.load(pollId.toString());

  if (!poll) {
    poll = new ArbitrumPoll(pollId.toString());
  }
  //always update poll properties, in case it was previously created with just an id in the vote handler
  poll.creator = creator;
  poll.blockCreated = blockCreated;
  poll.startDate = startDate;
  poll.endDate = endDate;
  poll.multiHash = multiHash;
  poll.url = url;
  poll.save();
}
