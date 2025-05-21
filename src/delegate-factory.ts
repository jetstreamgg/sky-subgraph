// import { BigInt } from '@graphprotocol/graph-ts';
import {
  // DelegateFactory,
  CreateVoteDelegate,
} from '../generated/DelegateFactory/DelegateFactory';
import { Delegate, DelegateAdmin } from '../generated/schema';
import { BIGINT_ZERO } from './helpers/constants';
import { VoteDelegate as VoteDelegateTemplate } from '../generated/templates';
import { getVoter } from './helpers/helpers';

export function handleCreateVoteDelegate(event: CreateVoteDelegate): void {
  // https://etherscan.io/address/0xD897F108670903D1d6070fcf818f9db3615AF272#code
  // event.params.delegate and event.transcation.from.toHexString() should be the same
  const delegateOwnerAddress = event.transaction.from;
  const delegateContractAddress = event.params.voteDelegate;

  // create the voter entity
  const voter = getVoter(delegateContractAddress.toHexString())
  voter.isVoteDelegate = true;
  voter.isVoteProxy = false;
  // Assign the delegate contract to the voter
  voter.delegateContract = delegateContractAddress.toHexString();
  voter.save();

  // Create the delegate contract
  let delegateInfo = Delegate.load(delegateContractAddress.toHexString());

  if (!delegateInfo) {
    delegateInfo = new Delegate(delegateContractAddress.toHexString());
    delegateInfo.ownerAddress = delegateOwnerAddress.toHexString();
    delegateInfo.voter = voter.id;
    delegateInfo.delegations = [];
    delegateInfo.delegators = 0;
    delegateInfo.blockTimestamp = event.block.timestamp;
    delegateInfo.blockNumber = event.block.number;
    delegateInfo.txnHash = event.transaction.hash.toHexString();
    delegateInfo.totalDelegated = BIGINT_ZERO;
    delegateInfo.delegationHistory = [];
    delegateInfo.metadata = delegateContractAddress.toHexString();
    delegateInfo.version = '1';
    delegateInfo.save();
  }

  // Create delegate admin entity, it links the owner address with the delegate contract
  // In the future this entity might hold more than 1 delegate contract
  let delegateAdmin = DelegateAdmin.load(delegateOwnerAddress.toHexString());

  if (!delegateAdmin) {
    delegateAdmin = new DelegateAdmin(delegateOwnerAddress.toHexString());
  }
  delegateAdmin.delegateContract = delegateInfo.id;
  delegateAdmin.save();

  // Track this new vote delegate contract
  VoteDelegateTemplate.create(delegateContractAddress);
}
