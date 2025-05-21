import {
  LockstakeMkrRely,
  LockstakeMkrDeny,
  LockstakeMkrApproval,
  LockstakeMkrTransfer,
} from '../generated/schema';
import {
  Rely as LockstakeMkrRelyEvent,
  Deny as LockstakeMkrDenyEvent,
  Approval as LockstakeMkrApprovalEvent,
  Transfer as LockstakeMkrTransferEvent,
} from '../generated/LockstakeMkr/LockstakeMkr';

export function handleLockstakeMkrRely(event: LockstakeMkrRelyEvent): void {
  let entity = new LockstakeMkrRely(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleLockstakeMkrDeny(event: LockstakeMkrDenyEvent): void {
  let entity = new LockstakeMkrDeny(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleLockstakeMkrApproval(
  event: LockstakeMkrApprovalEvent,
): void {
  let entity = new LockstakeMkrApproval(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.owner = event.params.owner;
  entity.spender = event.params.spender;
  entity.value = event.params.value;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleLockstakeMkrTransfer(
  event: LockstakeMkrTransferEvent,
): void {
  let entity = new LockstakeMkrTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
