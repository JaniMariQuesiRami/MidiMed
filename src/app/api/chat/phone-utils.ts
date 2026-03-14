// Phone number normalization and matching utilities for Guatemala-format numbers.
// Created: 2026-03-14

/**
 * Strips everything except digits from a phone string.
 * "+502 5555-1234" -> "50255551234"
 */
export function stripToDigits(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Extracts the last N significant digits (default 8 for Guatemala).
 * Strips country codes and leading zeros automatically.
 * "50255551234" -> "55551234"
 */
export function getSignificantDigits(phone: string, length = 8): string {
  const digits = stripToDigits(phone)
  return digits.slice(-length)
}

/**
 * Compares two phone numbers by their last 8 digits.
 * Handles any format: "+502 5555-1234" matches "55551234"
 */
export function phonesMatch(a: string, b: string): boolean {
  return getSignificantDigits(a) === getSignificantDigits(b)
}
