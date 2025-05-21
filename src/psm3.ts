import { Swap as SwapEvent } from '../generated/Psm3/Psm3';
import { Swap } from '../generated/schema';

export function handleSwap(event: SwapEvent): void {
  const id =
    event.transaction.hash.toHexString() + '-' + event.logIndex.toString();

  const swap = new Swap(id);

  swap.assetIn = event.params.assetIn;
  swap.assetOut = event.params.assetOut;
  swap.sender = event.params.sender;
  swap.receiver = event.params.receiver;
  swap.amountIn = event.params.amountIn;
  swap.amountOut = event.params.amountOut;
  swap.referralCode = event.params.referralCode;
  swap.blockNumber = event.block.number;
  swap.blockTimestamp = event.block.timestamp;
  swap.transactionHash = event.transaction.hash;

  swap.save();
}
