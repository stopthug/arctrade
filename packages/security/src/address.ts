import { getAddress, isAddress } from "viem";
import type { Address } from "viem";

export function isValidEvmAddress(value: string): boolean {
  return isAddress(value, { strict: false });
}

export function toChecksumAddress(value: string): Address {
  if (!isAddress(value, { strict: false })) {
    throw new Error("Invalid EVM address.");
  }
  return getAddress(value);
}

export function assertChecksumAddress(value: string): Address {
  if (!isAddress(value, { strict: true })) {
    if (isAddress(value, { strict: false })) {
      throw new Error("Invalid address checksum.");
    }
    throw new Error("Invalid EVM address.");
  }
  return getAddress(value);
}

export function normalizeAddress(value: string): Address {
  return toChecksumAddress(value);
}

export function addressesEqual(a: string, b: string): boolean {
  if (!isValidEvmAddress(a) || !isValidEvmAddress(b)) return false;
  return toChecksumAddress(a) === toChecksumAddress(b);
}
