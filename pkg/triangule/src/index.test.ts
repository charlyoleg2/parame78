import { describe, it, expect } from 'vitest';
import * as dut from './index';

describe('triangule under tests', () => {
	it('triangle angles', () => {
		expect(dut.triAArA(1, 2)).toBeCloseTo(0.14159, 4);
	});
});
