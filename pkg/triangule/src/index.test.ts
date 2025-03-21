import { describe, it, expect } from 'vitest';
import * as dut from './index';

describe('triangule under tests', () => {
	// angle conversion
	it('angle conversion from degree to rad', () => {
		expect(dut.triDegRad(60)).toBeCloseTo(Math.PI / 3, 4);
	});
	it('angle conversion from rad to degree', () => {
		expect(dut.triRadDeg(-Math.PI / 3)).toBeCloseTo(-60, 4);
	});
	// angle translation
	it('angle translation to [-Pi, Pi]', () => {
		expect(dut.triAPiPi((-14 * Math.PI) / 3)).toBeCloseTo(dut.triDegRad(-120), 4);
	});
	it('angle translation to [0, 2*Pi]', () => {
		expect(dut.triA02Pi((-16 * Math.PI) / 3)).toBeCloseTo(dut.triDegRad(120), 4);
	});
	it('angle translation to [0, Pi]', () => {
		expect(dut.triA0Pi((16 * Math.PI) / 3)).toBeCloseTo(dut.triDegRad(60), 4);
	});
	it('angle translation to [-Pi/2, Pi/2]', () => {
		expect(dut.triAPihPih((17 * Math.PI) / 3)).toBeCloseTo(dut.triDegRad(-60), 4);
	});
	// angles of triangle
	it('triangle angles', () => {
		expect(dut.triAArA(1, 2, dut.ECheck.eError)).toEqual([
			expect.closeTo(0.14159, 4),
			expect.any(String)
		]);
	});
	it('triangle angles', () => {
		expect(dut.triAArA(-1, -2)).toEqual([expect.closeTo(-0.14159, 4), expect.any(String)]);
	});
	// triALArLL
	it('triALArLL', () => {
		expect(dut.triALArLL(Math.PI / 3, 100, Math.PI / 3)).toEqual([
			expect.closeTo(100, 4),
			expect.closeTo(100, 4),
			expect.any(String)
		]);
	});
	// triLALrL
	it('triLALrL', () => {
		expect(dut.triLALrL(100, Math.PI / 3, 100)).toEqual([
			expect.closeTo(100, 4),
			expect.any(String)
		]);
	});
	// triALLrL
	it('triALLrL', () => {
		expect(dut.triALLrL(Math.PI / 3, 100, 100)).toEqual([
			expect.closeTo(0, 4),
			expect.closeTo(100, 4),
			expect.any(String)
		]);
	});
	// triLLLrA
	it('triLLLrA', () => {
		expect(dut.triLLLrA(100, 100, 100)).toEqual([
			expect.closeTo(Math.PI / 3, 4),
			expect.any(String)
		]);
	});
	// triLLLrAAA
	it('triLLLrAAA', () => {
		expect(dut.triLLLrAAA(100, 100, 100)).toEqual([
			expect.closeTo(Math.PI / 3, 4),
			expect.closeTo(Math.PI / 3, 4),
			expect.closeTo(Math.PI / 3, 4),
			expect.any(String)
		]);
	});
});
