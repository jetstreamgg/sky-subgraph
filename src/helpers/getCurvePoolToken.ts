export async function getCurvePoolToken(
  poolAddress: string,
  tokenIndex: bigint,
): Promise<string> {
  // TODO: Implement RPC call to CurveStableSwapNG.coins(tokenIndex)
  // For now, return zero address as fallback
  console.warn(
    `Failed to fetch token at index ${tokenIndex} from pool ${poolAddress} - RPC call not yet implemented`,
  );
  return "0x0000000000000000000000000000000000000000";
}
