import { parseDecimal } from './decimal.js';

export function validate(params, rules) {
  const values = {};
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = parseDecimal(params?.[field]);
    if (value === null) {
      errors.push({ field, message: 'Enter a finite decimal number (up to 100 significant digits and exponent ±100).' });
    } else if (value.lt(0)) {
      errors.push({ field, message: 'Values cannot be negative' });
    } else if (rule.positive && value.isZero()) {
      errors.push({ field, message: rule.zeroMessage ?? 'Must be greater than zero.' });
    } else if (rule.percent && (rule.exclusive ? value.gte(100) : value.gt(100))) {
      errors.push({ field, message: rule.limitMessage ?? (rule.exclusive ? 'Must be less than 100%.' : 'Cannot exceed 100%.') });
    } else {
      values[field] = value;
    }
  }
  return { values, errors };
}

