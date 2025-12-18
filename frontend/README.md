# Frontend Integration

This folder contains a React component for interacting with the ProofOfGrind contract.

## Setup

### 1. Install Dependencies

In your Next.js/React project:

```bash
npm install wagmi viem @tanstack/react-query
```

### 2. Configure wagmi

```javascript
// wagmi.config.js
import { http, createConfig } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';

export const config = createConfig({
  chains: [celo, celoAlfajores],
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
  },
});
```

### 3. Update Contract Address

In `ProofOfGrind.jsx`, replace `YOUR_CONTRACT_ADDRESS_HERE` with your deployed contract address.

### 4. Import Component

```javascript
import ProofOfGrind from './ProofOfGrind';

function App() {
  return <ProofOfGrind />;
}
```

## Styling

The component uses Tailwind CSS classes. Make sure Tailwind is configured in your project.

## MiniPay Integration

For MiniPay, add the feeCurrency parameter to transactions:

```javascript
const CUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a';

// In writeContract calls, add:
{
  ...
  feeCurrency: CUSD_ADDRESS,
}
```
