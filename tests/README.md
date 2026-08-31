# Integration tests expect mocked providers only. Never point these at a funded mainnet wallet.

See packages/*/src/*.test.ts for unit coverage (address, amounts, FIFO, fees, state machine).
Playwright covers the public web landing and trade terminal chrome.
