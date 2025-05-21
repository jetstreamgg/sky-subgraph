import { CreateVoteDelegate } from '../generated/DelegateFactoryV3/DelegateFactoryV3';
import { Delegate, DelegateAdmin } from '../generated/schema';
import { BIGINT_ZERO } from './helpers/constants';
import { VoteDelegateV3 as VoteDelegateV3Template } from '../generated/templates';
import { getVoter } from './helpers/helpers';

export function handleCreateVoteDelegateV3(event: CreateVoteDelegate): void {
  const delegateOwnerAddress = event.params.usr.toHexString();
  const delegateContractAddress = event.params.voteDelegate;

  const voter = getVoter(delegateContractAddress.toHexString());
  voter.isVoteDelegate = true;
  voter.isVoteProxy = false;
  // Assign the delegate contract to the voter
  voter.delegateContract = delegateContractAddress.toHexString();
  voter.save();

  let delegate = Delegate.load(delegateContractAddress.toHexString());
  if (!delegate) {
    delegate = new Delegate(delegateContractAddress.toHexString());
    delegate.ownerAddress = delegateOwnerAddress;
    delegate.voter = voter.id;
    delegate.delegations = [];
    delegate.delegators = 0;
    delegate.blockTimestamp = event.block.timestamp;
    delegate.blockNumber = event.block.number;
    delegate.txnHash = event.transaction.hash.toHexString();
    delegate.totalDelegated = BIGINT_ZERO;
    delegate.delegationHistory = [];
    delegate.version = '3';
    delegate.save();
  }

  let delegateAdmin = DelegateAdmin.load(delegateOwnerAddress);

  if (!delegateAdmin) {
    delegateAdmin = new DelegateAdmin(delegateOwnerAddress);
  }
  delegateAdmin.delegateContract = delegate.id;
  delegateAdmin.save();

  // Track this new vote delegate contract
  VoteDelegateV3Template.create(delegateContractAddress);
}
