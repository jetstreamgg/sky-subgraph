import {
  Deposit as SupplyEvent,
  Withdraw as WithdrawEvent,
  Referral as ReferralEvent,
} from '../generated/SavingsUsds/SavingsUsds';
import {
  SavingsSupply,
  SavingsWithdraw,
  SavingsReferral,
  SavingsSupplier,
} from '../generated/schema';

export function handleSavingsSupplied(event: SupplyEvent): void {
  let entity = new SavingsSupply(
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

  // Track unique suppliers
  let supplier = SavingsSupplier.load(event.params.owner);
  if (supplier === null) {
    supplier = new SavingsSupplier(event.params.owner);
    supplier.save();
  }
}

export function handleSavingsWithdrawn(event: WithdrawEvent): void {
  let entity = new SavingsWithdraw(
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

export function handleSavingsReferral(event: ReferralEvent): void {
  let entity = new SavingsReferral(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  let ref = event.params.referral;
  if (!ref) {
    ref = 0;
  }
  entity.referral = ref;
  entity.owner = event.params.owner;
  entity.assets = event.params.assets;
  entity.shares = event.params.shares;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
