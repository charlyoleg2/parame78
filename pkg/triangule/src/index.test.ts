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
		expect(dut.triAArA(1, 2, dut.EAngleCheck.eError)).toBeCloseTo(0.14159, 4);
	});
	it('triangle angles', () => {
		expect(dut.triAArA(-1, -2)).toBeCloseTo(-0.14159, 4);
	});
	// triALArLAL
	it('triALArLAL', () => {
		expect(dut.triALArLAL(Math.PI / 3, 100, Math.PI / 3)).toEqual([
			expect.closeTo(100, 4),
			expect.closeTo(Math.PI / 3, 4),
			expect.closeTo(100, 4)
		]);
	});
	// triLALrL
	it('triLALrL', () => {
		expect(dut.triLALrL(100, Math.PI / 3, 100)).toBeCloseTo(100, 4);
	});
	// triLALrALA
	it('triLALrALA', () => {
		expect(dut.triLALrALA(100, Math.PI / 3, 100)).toEqual([
			expect.closeTo(Math.PI / 3, 4),
			expect.closeTo(100, 4),
			expect.closeTo(Math.PI / 3, 4)
		]);
	});
	// triALLrL
	it('triALLrL', () => {
		expect(dut.triALLrL(Math.PI / 3, 100, 100)).toEqual([
			expect.closeTo(100, 4),
			expect.closeTo(100, 4)
		]);
	});
	// triOrderLLLrIII
	it('triOrderLLLrIII', () => {
		expect(dut.triOrderLLLrIII(100, 90, 80)).toEqual([0, 1, 2]);
		expect(dut.triOrderLLLrIII(100, 190, 80)).toEqual([1, 0, 2]);
		expect(dut.triOrderLLLrIII(100, 190, 280)).toEqual([2, 1, 0]);
		expect(dut.triOrderLLLrIII(100, 190, 100)).toEqual([1, 2, 0]);
		expect(dut.triOrderLLLrIII(100, 100, 100)).toEqual([0, 2, 1]);
	});
	// triLLLrAAA
	it('triLLLrAAA', () => {
		expect(dut.triLLLrAAA(100, 100, 100)).toEqual([
			expect.closeTo(Math.PI / 3, 4),
			expect.closeTo(Math.PI / 3, 4),
			expect.closeTo(Math.PI / 3, 4)
		]);
	});
});
