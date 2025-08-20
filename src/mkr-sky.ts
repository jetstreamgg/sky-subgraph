import {
  MkrToSky as MkrToSkyEvent,
  SkyToMkr as SkyToMkrEvent,
} from '../generated/MkrSky/MkrSky';
import { MkrToSkyUpgrade, SkyToMkrRevert, Total } from '../generated/schema';
import { BIGINT_ZERO } from './helpers/constants';

export function handleMkrToSkyUpgrade(event: MkrToSkyEvent): void {
  let entity = new MkrToSkyUpgrade(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.caller = event.params.caller;
  entity.usr = event.params.usr;
  entity.mkrAmt = event.params.mkrAmt;
  entity.skyAmt = event.params.skyAmt;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  //add to running total of mkrUpgraded
  let totalMkrUpgraded = Total.load('mkrUpgraded');
  if (!totalMkrUpgraded) {
    totalMkrUpgraded = new Total('mkrUpgraded');
    totalMkrUpgraded.total = BIGINT_ZERO;
  }
  totalMkrUpgraded.total = totalMkrUpgraded.total.plus(entity.mkrAmt);
  totalMkrUpgraded.save();

  //add to running total of skyUpgraded
  let totalSkyUpgraded = Total.load('skyUpgraded');
  if (!totalSkyUpgraded) {
    totalSkyUpgraded = new Total('skyUpgraded');
    totalSkyUpgraded.total = BIGINT_ZERO;
  }
  totalSkyUpgraded.total = totalSkyUpgraded.total.plus(entity.skyAmt);
  totalSkyUpgraded.save();
}

export function handleSkyToMkrRevert(event: SkyToMkrEvent): void {
  let entity = new SkyToMkrRevert(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.caller = event.params.caller;
  entity.usr = event.params.usr;
  entity.mkrAmt = event.params.mkrAmt;
  entity.skyAmt = event.params.skyAmt;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
