import {
  DaiToUsds as DaiToUsdsEvent,
  UsdsToDai as UsdsToDaiEvent,
} from '../generated/DaiUsds/DaiUsds';
import { DaiToUsdsUpgrade, UsdsToDaiRevert, Total } from '../generated/schema';
import { BIGINT_ZERO } from './helpers/constants';

export function handleDaiToUsdsUpgrade(event: DaiToUsdsEvent): void {
  let entity = new DaiToUsdsUpgrade(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.caller = event.params.caller;
  entity.usr = event.params.usr;
  entity.wad = event.params.wad;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Add to running total of daiUpgraded
  let totalDaiUpgraded = Total.load('daiUpgraded');
  if (!totalDaiUpgraded) {
    totalDaiUpgraded = new Total('daiUpgraded');
    totalDaiUpgraded.total = BIGINT_ZERO;
  }
  totalDaiUpgraded.total = totalDaiUpgraded.total.plus(entity.wad);
  totalDaiUpgraded.save();
}

export function handleUsdsToDaiRevert(event: UsdsToDaiEvent): void {
  let entity = new UsdsToDaiRevert(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.caller = event.params.caller;
  entity.usr = event.params.usr;
  entity.wad = event.params.wad;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
