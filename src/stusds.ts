import {
  Deposit as StusdsDepositEvent,
  Withdraw as StusdsWithdrawEvent,
  Referral as StusdsReferralEvent,
} from '../generated/Stusds/Stusds';
import {
  StusdsDeposit,
  StusdsWithdraw,
  StusdsReferral,
} from '../generated/schema';

export function handleStusdsDeposit(event: StusdsDepositEvent): void {
  let entity = new StusdsDeposit(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.sender = event.params.sender;
  entity.owner = event.params.owner;
  entity.assets = event.params.assets;
  entity.shares = event.params.shares;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleStusdsWithdraw(event: StusdsWithdrawEvent): void {
  let entity = new StusdsWithdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.sender = event.params.sender;
  entity.receiver = event.params.receiver;
  entity.owner = event.params.owner;
  entity.assets = event.params.assets;
  entity.shares = event.params.shares;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleStusdsReferral(event: StusdsReferralEvent): void {
  let entity = new StusdsReferral(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.referral = event.params.referral;
  entity.owner = event.params.owner;
  entity.assets = event.params.assets;
  entity.shares = event.params.shares;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
} 