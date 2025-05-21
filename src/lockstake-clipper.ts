import {
  Rely,
  Deny,
  FileUint,
  FileAddress,
  Kick,
  Take,
  Redo,
  Yank,
} from '../generated/schema';
import {
  Rely as RelyEvent,
  Deny as DenyEvent,
  File as FileUintEvent,
  File1 as FileAddressEvent,
  Kick as KickEvent,
  Take as TakeEvent,
  Redo as RedoEvent,
  Yank as YankEvent,
} from '../generated/LockstakeClipper/LockstakeClipper';

export function handleRely(event: RelyEvent): void {
  let entity = new Rely(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleDeny(event: DenyEvent): void {
  let entity = new Deny(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleFileUint(event: FileUintEvent): void {
  let entity = new FileUint(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.what = event.params.what;
  entity.data = event.params.data;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleFileAddress(event: FileAddressEvent): void {
  let entity = new FileAddress(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.what = event.params.what;
  entity.data = event.params.data;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleKick(event: KickEvent): void {
  let entity = new Kick(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.top = event.params.top;
  entity.tab = event.params.tab;
  entity.lot = event.params.lot;
  entity.usr = event.params.usr;
  entity.kpr = event.params.kpr;
  entity.coin = event.params.coin;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleTake(event: TakeEvent): void {
  let entity = new Take(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.max = event.params.max;
  entity.price = event.params.price;
  entity.owe = event.params.owe;
  entity.tab = event.params.tab;
  entity.lot = event.params.lot;
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleRedo(event: RedoEvent): void {
  let entity = new Redo(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.top = event.params.top;
  entity.tab = event.params.tab;
  entity.lot = event.params.lot;
  entity.usr = event.params.usr;
  entity.kpr = event.params.kpr;
  entity.coin = event.params.coin;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleYank(event: YankEvent): void {
  let entity = new Yank(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
