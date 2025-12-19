import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';

// Deployed on Celo Mainnet
const CONTRACT_ADDRESS = '0xd305C380eE424584498B719c2c25b696AaC729e5';

const ABI = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "grind",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "grinder", "type": "address" }],
    "name": "boost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dailyCheckIn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "grinder", "type": "address" }],
    "name": "getGrinderStats",
    "outputs": [
      {
        "components": [
          { "name": "totalGrinds", "type": "uint256" },
          { "name": "currentStreak", "type": "uint256" },
          { "name": "bestStreak", "type": "uint256" },
          { "name": "lastGrindTime", "type": "uint256" },
          { "name": "tier", "type": "uint256" },
          { "name": "points", "type": "uint256" }
        ],
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "grinder", "type": "address" }],
    "name": "canGrind",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "grinder", "type": "address" }],
    "name": "getTimeUntilNextGrind",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTopGrinders",
    "outputs": [{ "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const TIER_NAMES = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'LEGEND'];
const TIER_COLORS = ['#CD7F32', '#C0C0C0', '#FFD93D', '#4ECDC4', '#FF6B6B'];

function getTierIndex(tier) {
  if (tier >= 500) return 4;
  if (tier >= 100) return 3;
  if (tier >= 50) return 2;
  if (tier >= 10) return 1;
  return 0;
}

export default function ProofOfGrind() {
  const { address, isConnected } = useAccount();
  const [boostAddress, setBoostAddress] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Read contract data
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  });

  const { data: stats, refetch: refetchStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getGrinderStats',
    args: [address],
    enabled: !!address && balance > 0n,
  });

  const { data: canGrindNow, refetch: refetchCanGrind } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'canGrind',
    args: [address],
    enabled: !!address && balance > 0n,
  });

  const { data: timeUntil, refetch: refetchTime } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getTimeUntilNextGrind',
    args: [address],
    enabled: !!address && balance > 0n,
  });

  const { data: topGrinders } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getTopGrinders',
  });

  // Write functions
  const { writeContract: mint, data: mintHash } = useWriteContract();
  const { writeContract: grind, data: grindHash } = useWriteContract();
  const { writeContract: boost, data: boostHash } = useWriteContract();
  const { writeContract: checkIn, data: checkInHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isMinting, isSuccess: mintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });
  const { isLoading: isGrinding, isSuccess: grindSuccess } = useWaitForTransactionReceipt({ hash: grindHash });
  const { isLoading: isBoosting, isSuccess: boostSuccess } = useWaitForTransactionReceipt({ hash: boostHash });
  const { isLoading: isCheckingIn, isSuccess: checkInSuccess } = useWaitForTransactionReceipt({ hash: checkInHash });

  // Countdown timer
  useEffect(() => {
    if (timeUntil && timeUntil > 0n) {
      setCountdown(Number(timeUntil));
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            refetchCanGrind();
            refetchTime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeUntil]);

  // Refetch on success
  useEffect(() => {
    if (mintSuccess || grindSuccess || boostSuccess || checkInSuccess) {
      refetchStats();
      refetchCanGrind();
      refetchTime();
    }
  }, [mintSuccess, grindSuccess, boostSuccess, checkInSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const hasMinted = balance && balance > 0n;
  const tierIndex = stats ? getTierIndex(Number(stats.tier)) : 0;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-4">💪 Proof of Grind</h1>
        <p className="text-gray-400 mb-8">Connect your wallet to start grinding</p>
        {/* Add your wallet connect button here */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">💪 Proof of Grind</h1>

        {!hasMinted ? (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <h2 className="text-xl mb-4">Start Your Grind Journey</h2>
            <p className="text-gray-400 mb-6">Free mint - one per wallet</p>
            <button
              onClick={() => mint({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'mint' })}
              disabled={isMinting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 px-8 py-3 rounded-lg font-bold text-lg w-full"
            >
              {isMinting ? '⏳ Minting...' : '🆓 Free Mint'}
            </button>
          </div>
        ) : (
          <>
            {/* Stats Card */}
            <div className="bg-gray-800 rounded-xl p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <span 
                  className="text-2xl font-bold"
                  style={{ color: TIER_COLORS[tierIndex] }}
                >
                  {TIER_NAMES[tierIndex]}
                </span>
                <span className="text-yellow-400 text-xl">
                  ⭐ {stats ? Number(stats.points) : 0} pts
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{stats ? Number(stats.totalGrinds) : 0}</p>
                  <p className="text-gray-400 text-sm">Grinds</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">🔥 {stats ? Number(stats.currentStreak) : 0}</p>
                  <p className="text-gray-400 text-sm">Streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats ? Number(stats.bestStreak) : 0}</p>
                  <p className="text-gray-400 text-sm">Best</p>
                </div>
              </div>
            </div>

            {/* Grind Button */}
            <div className="bg-gray-800 rounded-xl p-6 mb-4">
              {canGrindNow ? (
                <button
                  onClick={() => grind({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'grind' })}
                  disabled={isGrinding}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 px-8 py-4 rounded-lg font-bold text-xl w-full"
                >
                  {isGrinding ? '⏳ Grinding...' : '💪 GRIND NOW'}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-2">Next grind in</p>
                  <p className="text-3xl font-mono">{formatTime(countdown)}</p>
                </div>
              )}
            </div>

            {/* Daily Check-in */}
            <button
              onClick={() => checkIn({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'dailyCheckIn' })}
              disabled={isCheckingIn}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 px-6 py-3 rounded-lg font-bold w-full mb-4"
            >
              {isCheckingIn ? '⏳ Checking in...' : '📅 Daily Check-in (+25 pts)'}
            </button>

            {/* Boost Section */}
            <div className="bg-gray-800 rounded-xl p-6 mb-4">
              <h3 className="font-bold mb-3">🤝 Boost a Grinder</h3>
              <input
                type="text"
                placeholder="0x..."
                value={boostAddress}
                onChange={(e) => setBoostAddress(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-3"
              />
              <button
                onClick={() => boost({ 
                  address: CONTRACT_ADDRESS, 
                  abi: ABI, 
                  functionName: 'boost',
                  args: [boostAddress]
                })}
                disabled={isBoosting || !boostAddress}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 px-6 py-2 rounded-lg font-bold w-full"
              >
                {isBoosting ? '⏳ Boosting...' : 'Boost (+5 to them, +2 to you)'}
              </button>
            </div>

            {/* Mini Leaderboard */}
            {topGrinders && topGrinders.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-bold mb-3">🏆 Top Grinders</h3>
                <div className="space-y-2">
                  {topGrinders.slice(0, 5).map((addr, i) => (
                    <div key={addr} className="flex justify-between text-sm">
                      <span className="text-gray-400">#{i + 1}</span>
                      <span className="font-mono">
                        {addr.slice(0, 6)}...{addr.slice(-4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
