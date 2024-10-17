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
});
