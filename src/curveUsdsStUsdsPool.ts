import { TokenExchange as CurveTokenExchangeEvent } from '../generated/CurveUsdsStUsdsPool/CurveStableSwapNG';
import { CurveTokenExchange } from '../generated/schema';
import { getCurvePoolToken } from './helpers/getCurvePoolToken';

export function handleTokenExchange(event: CurveTokenExchangeEvent): void {
  let entity = new CurveTokenExchange(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.buyer = event.params.buyer;
  entity.soldId = event.params.sold_id;
  entity.amountSold = event.params.tokens_sold;
  entity.boughtId = event.params.bought_id;
  entity.amountBought = event.params.tokens_bought;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  const soldTokenAddress = getCurvePoolToken(
    event.address,
    event.params.sold_id,
  );
  const boughtTokenAddress = getCurvePoolToken(
    event.address,
    event.params.bought_id,
  );

  entity.soldTokenAddress = soldTokenAddress;
  entity.boughtTokenAddress = boughtTokenAddress;

  entity.save();
}
