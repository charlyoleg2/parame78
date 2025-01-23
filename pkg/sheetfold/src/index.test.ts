import { describe, it, expect } from 'vitest';
import * as dut from './index';

describe('sheetfold under tests', () => {
	// angle conversion
	it('angle conversion from degree to rad', () => {
		expect(dut.triDegRad(60)).toBeCloseTo(Math.PI / 3, 4);
	});
});
