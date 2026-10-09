# 9. Auto-Swap Logic: DEX Integration, TWAP Oracles and Converting USDC to $NEXUS

The NexusPaymaster.sol contract acts as a financial bridge between the stablecoin economy of AI agents (USDC) and the tokenomics of the base protocol ($NEXUS). When the Paymaster accepts USDC from an agent to cover gas and the escrow fee, it does not simply accumulate stablecoins on its balance. The contract includes an automated exchange logic module (Auto-Swap Module) integrated with decentralized exchanges (DEX Uniswap v3/v4).

This module solves a key task: it turns incoming fees into purchases of the $NEXUS token without creating price slippage risk (Slippage) and without being vulnerable to oracle manipulation.

## 9.1 Architecture of the Interaction Between Paymaster, DEX and Oracle

```
[AI Agent]
   │ (Payment in USDC)
   ▼
[NexusPaymaster.sol] ◄────── [TWAP Oracle (Uniswap v3/v4)]
   │                            (Request for the 30-min weighted average price)
   ├─► 1. Check slippage limits (Max Slippage Threshold)
   ├─► 2. Convert accumulated USDC ──► [Uniswap V3 Pool: USDC/$NEXUS]
   │                                                    │
   └─► 3. Transfer bought $NEXUS ────────────────────────┴──► [Proof-of-Burn / Treasury]
```

## 9.2 Rate Calculation and Protection Through TWAP Oracles (Time-Weighted Average Price)

The main vulnerability of ordinary decentralized exchanges under automatic calls from a smart contract is sensitivity to the spot price (Spot Price). If an attacker makes a large trade (Flash Loan Attack) in the USDC/$NEXUS pool just before the Paymaster's conversion call, they will move the rate and force the Paymaster to buy $NEXUS at an inflated price.

To prevent this, NexusPaymaster.sol forbids operating on the instantaneous spot price. The gas cost and conversion rate are calculated through a TWAP oracle (Time-Weighted Average Price) with geometric averaging over a set time interval (by default $T = 30\text{ minutes}$).

TWAP mathematics (Uniswap v3 Observation Cardinality):
The smart contract queries the pool's geometric tick accumulator (Tick Cumulatives):

$$\Delta \text{Tick} = \text{tickCumulative}(t_2) - \text{tickCumulative}(t_1)$$

$$\text{Tick}_{\text{TWAP}} = \frac{\Delta \text{Tick}}{t_2 - t_1}$$

$$\text{Price}_{\text{TWAP}} = 1.0001^{\text{Tick}_{\text{TWAP}}}$$

Protection properties: To move a 30-minute TWAP by even 2%, an attacker would have to hold an artificially inflated price for dozens of blocks, spending millions of dollars on holding liquidity against arbitrageurs. For an attack on the Paymaster this becomes economically pointless.

## 9.3 How the Auto-Swap Module Works in Solidity

The contract splits the process into two phases: Valuation (Gas Valuation) and Execution (Batch Execution).

```solidity
// Simplified fragment of the Auto-Swap module logic inside NexusPaymaster.sol
contract NexusPaymaster is IPaymaster, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IUniswapV3Pool public immutable swapPool;
    address public immutable nexusToken;
    address public immutable usdcToken;
    
    uint32 public constant TWAP_WINDOW = 1800; // 30 minutes (1800 sec)
    uint256 public constant MAX_SLIPPAGE_BPS = 100; // Maximum slippage 1.0% (100 BPS)

    // 1. Estimate the required amount of USDC based on TWAP
    function getRequiredUsdcForGas(uint256 nativeGasCostInEth) public view returns (uint256 usdcAmount) {
        int24 twapTick = getTwapTick(address(swapPool), TWAP_WINDOW);
        uint256 nexusPerEth = getEthToNexusRate(); // ETH -> $NEXUS cross rate
        
        // Convert native network gas into USDC equivalent with a risk buffer (+5%)
        usdcAmount = uint256(OracleLibrary.getQuoteAtTick(
            twapTick,
            uint128(nativeGasCostInEth * nexusPerEth),
            address(nexusToken),
            address(usdcToken)
        )) * 105 / 100;
    }

    // 2. Convert the accumulated USDC pool
    function _executeBatchSwap(uint256 usdcToSwap) internal returns (uint256 nexusBought) {
        uint256 minNexusOutput = getExpectedNexusOutput(usdcToSwap) * (10000 - MAX_SLIPPAGE_BPS) / 10000;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: usdcToken,
            tokenOut: nexusToken,
            fee: 3000, // 0.3% pool
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: usdcToSwap,
            amountOutMinimum: minNexusOutput, // Hard slippage limit
            sqrtPriceLimitX96: 0
        });

        IERC20(usdcToken).forceApprove(address(swapRouter), usdcToSwap);
        nexusBought = swapRouter.exactInputSingle(params);
    }
}
```

## 9.4 Buffering and Dynamic Slippage Calculation (Slippage Tolerance)

If the Paymaster tries to exchange a large volume of USDC in a pool with low liquidity, slippage protection (amountOutMinimum) will trigger and the transaction will revert.

To prevent this, the module has 3 built-in rules:

Dynamic trade cap (Max Swap Cap): The volume of a single conversion cannot exceed 0.5% of all liquidity (Depth) in the active price range of the Uniswap v3 pool. If the accumulated USDC amount is larger, the trade is automatically split into several batches.

Use of concentrated-liquidity pools (Uniswap v3 Range Orders): The protocol motivates liquidity providers to keep narrow price ranges around the current TWAP price, granting additional rewards from the Liquidity Mining fund.

Fallback to alternative pools (Multi-hop Swaps): If the direct USDC/$NEXUS pair has high volatility, the Paymaster's router automatically reroutes along a bypass path: USDC -> WETH -> $NEXUS.

## 9.5 A Seamless Deflationary Spiral for the Ecosystem

Thanks to this logic a sustainable economic cycle is created:

AI agents make millions of requests, paying in familiar USDC.

NexusPaymaster.sol smooths price jumps through the 30-minute TWAP and turns USDC into purchases of $NEXUS on the open market.

Every conversion buys $NEXUS directly from the liquidity pool, sending the bought tokens to the burn module (Proof-of-Burn).

Result: The higher the activity of autonomous AI agents in the network, the higher the constant organic demand for $NEXUS and the deflationary removal of tokens from circulation.
