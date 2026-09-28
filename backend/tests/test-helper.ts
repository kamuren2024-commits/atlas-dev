import { describe as nodeDescribe, it as nodeIt, beforeEach as nodeBeforeEach, afterEach as nodeAfterEach } from 'node:test';
import assert from 'node:assert/strict';

export const describe = nodeDescribe;
export const it = nodeIt;
export const test = nodeIt;
export const beforeEach = nodeBeforeEach;
export const afterEach = nodeAfterEach;

export function expect(actual: any) {
  const matcher = (isNot: boolean) => ({
    toBe(expected: any) {
      if (isNot) {
        assert.notStrictEqual(actual, expected);
      } else {
        assert.strictEqual(actual, expected);
      }
    },
    toEqual(expected: any) {
      if (isNot) {
        assert.notDeepStrictEqual(actual, expected);
      } else {
        assert.deepStrictEqual(actual, expected);
      }
    },
    toContain(expected: any) {
      if (typeof actual === 'string' || Array.isArray(actual)) {
        const contains = actual.includes(expected);
        if (isNot) {
          assert.ok(!contains, `Expected ${JSON.stringify(actual)} not to contain ${expected}`);
        } else {
          assert.ok(contains, `Expected ${JSON.stringify(actual)} to contain ${expected}`);
        }
      } else if (actual instanceof Set || actual instanceof Map) {
        const contains = actual.has(expected);
        if (isNot) {
          assert.ok(!contains);
        } else {
          assert.ok(contains);
        }
      } else {
        assert.fail(`toContain received non-collection: ${typeof actual}`);
      }
    },
    toContainEqual(expected: any) {
      if (Array.isArray(actual)) {
        const found = actual.some(item => {
          try {
            assert.deepStrictEqual(item, expected);
            return true;
          } catch {
            return false;
          }
        });
        if (isNot) {
          assert.ok(!found, `Expected array not to contain equal item`);
        } else {
          assert.ok(found, `Expected array to contain equal item`);
        }
      } else {
        assert.fail(`toContainEqual received non-array: ${typeof actual}`);
      }
    },
    toBeDefined() {
      if (isNot) {
        assert.strictEqual(actual, undefined);
      } else {
        assert.notStrictEqual(actual, undefined);
      }
    },
    toBeUndefined() {
      if (isNot) {
        assert.notStrictEqual(actual, undefined);
      } else {
        assert.strictEqual(actual, undefined);
      }
    },
    toBeNull() {
      if (isNot) {
        assert.notStrictEqual(actual, null);
      } else {
        assert.strictEqual(actual, null);
      }
    },
    toBeTruthy() {
      if (isNot) {
        assert.ok(!actual);
      } else {
        assert.ok(!!actual);
      }
    },
    toBeFalsy() {
      if (isNot) {
        assert.ok(!!actual);
      } else {
        assert.ok(!actual);
      }
    },
    toBeGreaterThan(expected: number) {
      if (isNot) {
        assert.ok(actual <= expected);
      } else {
        assert.ok(actual > expected, `Expected ${actual} > ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (isNot) {
        assert.ok(actual < expected);
      } else {
        assert.ok(actual >= expected);
      }
    },
    toBeLessThan(expected: number) {
      if (isNot) {
        assert.ok(actual >= expected);
      } else {
        assert.ok(actual < expected, `Expected ${actual} < ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (isNot) {
        assert.ok(actual > expected);
      } else {
        assert.ok(actual <= expected);
      }
    },
    toBeCloseTo(expected: number, precision: number = 2) {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      if (isNot) {
        assert.ok(diff >= tolerance);
      } else {
        assert.ok(diff < tolerance, `Expected ${actual} to be close to ${expected} within precision ${precision}`);
      }
    },
    toBeInstanceOf(expected: any) {
      if (isNot) {
        assert.ok(!(actual instanceof expected));
      } else {
        assert.ok(actual instanceof expected, `Expected instance of ${expected.name}`);
      }
    },
    toHaveLength(expected: number) {
      const len = actual?.length ?? actual?.size ?? 0;
      if (isNot) {
        assert.notStrictEqual(len, expected);
      } else {
        assert.strictEqual(len, expected, `Expected length ${expected}, got ${len}`);
      }
    },
    toHaveProperty(prop: string, value?: any) {
      const hasProp = actual !== null && actual !== undefined && (prop in actual || Object.prototype.hasOwnProperty.call(actual, prop));
      if (isNot) {
        assert.ok(!hasProp || (value !== undefined && actual[prop] !== value), `Expected not to have property ${prop}`);
      } else {
        assert.ok(hasProp, `Expected object to have property "${prop}"`);
        if (value !== undefined) {
          assert.deepStrictEqual(actual[prop], value);
        }
      }
    },
    toMatch(regex: RegExp | string) {
      const re = typeof regex === 'string' ? new RegExp(regex) : regex;
      if (isNot) {
        assert.ok(!re.test(String(actual)));
      } else {
        assert.ok(re.test(String(actual)), `Expected "${actual}" to match ${re}`);
      }
    },
    toThrow(expectedError?: any) {
      assert.strictEqual(typeof actual, 'function', 'toThrow must be called with a function');
      let threw = false;
      let errorThrown: any = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        errorThrown = err;
      }
      if (isNot) {
        assert.ok(!threw, `Expected function not to throw, but threw: ${errorThrown}`);
      } else {
        assert.ok(threw, 'Expected function to throw');
        if (expectedError) {
          if (typeof expectedError === 'string') {
            assert.ok(String(errorThrown?.message || errorThrown).includes(expectedError));
          } else if (expectedError instanceof RegExp) {
            assert.ok(expectedError.test(String(errorThrown?.message || errorThrown)));
          } else if (typeof expectedError === 'function') {
            assert.ok(errorThrown instanceof expectedError);
          }
        }
      }
    },
    get not() {
      return matcher(true);
    },
    get resolves() {
      return {
        async toBe(expected: any) {
          const res = await actual;
          assert.strictEqual(res, expected);
        },
        async toEqual(expected: any) {
          const res = await actual;
          assert.deepStrictEqual(res, expected);
        }
      };
    },
    get rejects() {
      return {
        async toThrow(expectedError?: any) {
          let threw = false;
          let errorThrown: any = null;
          try {
            await actual;
          } catch (err) {
            threw = true;
            errorThrown = err;
          }
          assert.ok(threw, 'Expected promise to reject');
          if (expectedError) {
            if (typeof expectedError === 'string') {
              assert.ok(String(errorThrown?.message || errorThrown).includes(expectedError));
            }
          }
        }
      };
    }
  });

  return matcher(false);
}
