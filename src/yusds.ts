import {
  Deposit as YUsdsDepositEvent,
  Withdraw as YUsdsWithdrawEvent,
  Referral as YUsdsReferralEvent,
} from '../generated/YUsds/YUsds';
import {
  YUsdsDeposit,
  YUsdsWithdraw,
  YUsdsReferral,
} from '../generated/schema';

export function handleYUsdsDeposit(event: YUsdsDepositEvent): void {
  let entity = new YUsdsDeposit(
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

export function handleYUsdsWithdraw(event: YUsdsWithdrawEvent): void {
  let entity = new YUsdsWithdraw(
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

export function handleYUsdsReferral(event: YUsdsReferralEvent): void {
  let entity = new YUsdsReferral(
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