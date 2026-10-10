import { expect, it } from 'vitest';
import { sanitizeNumericInput } from '../logic/shared/input.js';

it.each([['999999999', '999999999'], ['$999,999,999', '999999999'], ['33.33', '33.33'], ['.5', '.5'], ['12.', '12.'], ['', ''], ['$', '']])('sanitizes %s to %s', (input, expected) => {
  expect(sanitizeNumericInput(input, '75')).toBe(expected);
});
it.each(['abc', '1e9', '1.2.3', '-10', '12abc', '+10', '€30'])('rejects %s without changing the previous value', input => {
  expect(sanitizeNumericInput(input, '75')).toBe('75');
});
