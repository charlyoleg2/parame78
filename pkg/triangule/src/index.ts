// index.ts : entry point of the library triangule

/**
 * Prepare a float for printing log
 * @internal
 *
 *  @param ifloat the floaf to be printed
 *  @returns the string ready for printing
 */
function ffix(ifloat: number): string {
	return ifloat.toFixed(2);
}

/**
 * Converts an angle in degree into radian
 *
 *  @param aDeg the angle in degree
 *  @returns the angle in radian
 */
function triDegRad(aDeg: number): number {
	const rA = (aDeg * Math.PI) / 180;
	return rA;
}

/**
 * Converts an angle in radian into degree
 *
 *  @param aRad the angle in radian
 *  @returns the angle in degree
 */
function triRadDeg(aRad: number): number {
	const rAdeg = (aRad * 180) / Math.PI;
	return rAdeg;
}

/**
 * Translate the angle in the range [-Pi, Pi]
 *
 *  @param aRad the input angle in radian
 *  @returns the translated angle
 */
function triAPiPi(aRad: number): number {
	let rA = aRad;
	while (rA < -Math.PI) {
		rA += 2 * Math.PI;
	}
	while (rA > Math.PI) {
		rA -= 2 * Math.PI;
	}
	return rA;
}

/**
 * Translate the angle in the range [0, 2*Pi]
 *
 *  @param aRad the input angle in radian
 *  @returns the translated angle
 */
function triA02Pi(aRad: number): number {
	let rA = triAPiPi(aRad);
	if (rA < 0) {
		rA += 2 * Math.PI;
	}
	return rA;
}

/**
 * Translate the angle in the range [0, Pi]
 *
 *  @param aRad the input angle in radian
 *  @returns the translated angle
 */
function triA0Pi(aRad: number): number {
	let rA = triAPiPi(aRad);
	if (rA < 0) {
		rA += Math.PI;
	}
	return rA;
}

/**
 * Translate the angle in the range [-Pi/2, Pi/2]
 *
 *  @param aRad the input angle in radian
 *  @returns the translated angle
 */
function triAPihPih(aRad: number): number {
	let rA = triAPiPi(aRad);
	if (rA < -Math.PI / 2) {
		rA += Math.PI;
	}
	if (rA > Math.PI / 2) {
		rA -= Math.PI;
	}
	return rA;
}

/**
 * Check if a float is zero or quasi-zero
 * @internal
 *
 *  @param the float under test
 *  @returns true if the float is very closed to zero
 */
function triIsZero(aFloat: number): boolean {
	let rb = false;
	const tolerance = 10 ** -4;
	if (Math.abs(aFloat) < tolerance) {
		rb = true;
	}
	return rb;
}

enum EAngleCheck {
	eError,
	eWarn,
	eIgnore
}

/**
 * Calculate the third angle of a triangle from the first two angles
 *
 *  @param a1 the first angle of the triangle in radian
 *  @param a2 the second angle of the triangle in radian
 *  @param checkLevel the level of check on the input angles
 *  @returns the third angle of the triangle in radian
 */
function triAArA(a1: number, a2: number, checkLevel = EAngleCheck.eError): number {
	if (Math.sign(a1) * Math.sign(a2) < 0) {
		if (checkLevel === EAngleCheck.eError) {
			throw `err628: the signs of a1 ${ffix(a1)} and a2 ${ffix(a2)} differ`;
		}
	}
	const rA = triAPiPi(Math.PI - a1 - a2);
	return rA;
}

/**
 * Calculate the two last lengths of a triangle from the first length and two angles
 *
 *  @param a1 the first angle of the triangle in radian
 *  @param l12 the length between the angles a1 and a2 in radian
 *  @param a2 the second angle of the triangle in radian
 *  @param checkLevel the level of check on the input angles
 *  @returns the two lengths l23 and l31 of the triangle
 */
function triALArLL(
	a1: number,
	l12: number,
	a2: number,
	checkLevel = EAngleCheck.eError
): [number, number] {
	const a3 = triAArA(a1, a2, checkLevel);
	let rl23 = 0;
	let rl31 = 0;
	if (triIsZero(a3)) {
		const logstr = `flat triangle with a1 ${ffix(a1)}, a2 ${ffix(a2)} and a3 ${ffix(a3)}`;
		if (checkLevel === EAngleCheck.eError) {
			throw `err390: ${logstr}`;
		} else if (checkLevel === EAngleCheck.eWarn) {
			console.log(`warn391: ${logstr}`);
		}
		console.log();
		if (triIsZero(a1)) {
			rl23 = 0; // length can not be defined
			rl31 = l12; // minimal length
		} else {
			rl23 = l12;
			rl31 = 0;
		}
	} else {
		// law of sines
		rl23 = (l12 * Math.sin(a1)) / Math.sin(a3);
		rl31 = (l12 * Math.sin(a2)) / Math.sin(a3);
	}
	return [rl23, rl31];
}

export {
	triDegRad,
	triRadDeg,
	triAPiPi,
	triA02Pi,
	triA0Pi,
	triAPihPih,
	EAngleCheck,
	triAArA,
	triALArLL
};
