// Shared hashing and canonicalization utilities
// Server-side Node (Next.js API routes) can use crypto from Node
// If you need client-side hashing later, add a browser variant using SubtleCrypto

import crypto from 'crypto';

// Recursively sort object keys to achieve deterministic JSON stringification
export function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === 'object') {
    const sorted = {};
    Object.keys(value)
      .sort()
      .forEach((k) => {
        sorted[k] = sortKeysDeep(value[k]);
      });
    return sorted;
  }
  return value;
}

// Remove volatile or sensitive fields from a record
export function redactRecord(record) {
  if (!record || typeof record !== 'object') return record;
  const { _id, id, user, userId, createdAt, updatedAt, pdf, ...rest } = record;
  // If pdf info exists and you want to keep filename only (no URLs), you could do:
  if (record.pdf && record.pdf.fileName) {
    rest.pdfFileName = record.pdf.fileName;
  }
  return rest;
}

export function canonicalize(value) {
  const redacted = redactRecord(value);
  const sorted = sortKeysDeep(redacted);
  return JSON.stringify(sorted);
}

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

export function computeHashForObject(obj) {
  const canonical = canonicalize(obj);
  const hash = sha256Hex(canonical);
  return { canonical, hash };
}
