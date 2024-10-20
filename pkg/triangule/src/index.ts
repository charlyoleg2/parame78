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

enum ECheck {
	eError,
	eWarn,
	eIgnore
}

/**
 * Check if the angle is zero or neagtive
 *
 *  @param a1 an angle in radian
 *  @param ctx a string to give an hint of the context of the check
 *  @param checkLevel the level of check on the input angles
 */
function triCheckA(a1: number, ctx: string, checkLevel = ECheck.eError) {
	const a1b = triAPiPi(a1);
	if (a1b <= 0 || triIsZero(a1b)) {
		const logstr = `${ctx} : a1 ${ffix(a1)}, a1b ${ffix(a1b)} is null or negative`;
		if (checkLevel === ECheck.eError) {
			throw `err120: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn121: ${logstr}`);
		}
	}
}

/**
 * Check if the length is zero or neagtive
 *
 *  @param l1 a length
 *  @param ctx a string to give an hint of the context of the check
 *  @param checkLevel the level of check on the input length
 */
function triCheckL(l1: number, ctx: string, checkLevel = ECheck.eError) {
	if (l1 <= 0 || triIsZero(l1)) {
		const logstr = `${ctx} : l1 ${ffix(l1)} is null or negative`;
		if (checkLevel === ECheck.eError) {
			throw `err130: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn131: ${logstr}`);
		}
	}
}

/**
 * Calculate the third angle of a triangle from the first two angles
 *
 *  @param a1 the first angle of the triangle in radian
 *  @param a2 the second angle of the triangle in radian
 *  @param checkLevel the level of check on the input angles
 *  @returns the third angle of the triangle in radian
 */
function triAArA(a1: number, a2: number, checkLevel = ECheck.eError): number {
	const a1b = triAPiPi(a1);
	const a2b = triAPiPi(a2);
	triCheckA(a1b, 'triAArA', ECheck.eWarn);
	triCheckA(a2b, 'triAArA', ECheck.eWarn);
	if (Math.sign(a1) * Math.sign(a2) < 0) {
		const logstr = `triAArA : the signs of a1 ${ffix(a1)} and a2 ${ffix(a2)} differ`;
		if (checkLevel === ECheck.eError) {
			throw `err628: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn629: ${logstr}`);
		}
	}
	if (Math.abs(a1b) + Math.abs(a2b) >= Math.PI) {
		const logstr = `triAArA : a1 ${ffix(a1)} plus a2 ${ffix(a2)} are bigger than Pi`;
		if (checkLevel === ECheck.eError) {
			throw `err141: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn142: ${logstr}`);
		}
	}
	const rA = triAPiPi(Math.PI - a1 - a2);
	return rA;
}

/**
 * Calculate the two last lengths and one anmgle of a triangle from the first length and two angles
 *
 *  @param a1 the first angle of the triangle in radian
 *  @param l12 the length between the angles a1 and a2 in radian
 *  @param a2 the second angle of the triangle in radian
 *  @param checkLevel the level of check on the input angles
 *  @returns the two lengths of the triangle : l23, l31
 */
function triALArLL(
	a1: number,
	l12: number,
	a2: number,
	checkLevel = ECheck.eError
): [number, number] {
	const a3 = triAArA(a1, a2, checkLevel);
	triCheckL(l12, 'triALArLL', checkLevel);
	let rl23 = 0;
	let rl31 = 0;
	if (triIsZero(a3)) {
		const logstr = `triALArLL : flat triangle with a1 ${ffix(a1)}, a2 ${ffix(a2)} and a3 ${ffix(a3)}`;
		if (checkLevel === ECheck.eError) {
			throw `err390: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn391: ${logstr}`);
		}
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

/**
 * Calculate the length l3 of a triangle from l1, a12 and l2
 *
 *  @param l1 the first length of the triangle
 *  @param a12 the angle between l1 and l2 in radian
 *  @param l2 the second length of the triangle
 *  @param checkLevel the level of check on the input angle
 *  @returns the length l3 of the triangle
 */
function triLALrL(l1: number, a12: number, l2: number, checkLevel = ECheck.eIgnore): number {
	triCheckL(l1, 'triLALrL', checkLevel);
	triCheckA(a12, 'triLALrL', checkLevel);
	triCheckL(l2, 'triLALrL', checkLevel);
	const rl3 = Math.sqrt(l1 ** 2 + l2 ** 2 - 2 * l1 * l2 * Math.cos(a12));
	return rl3;
}

/**
 * Calculate the length l3 of a triangle from a31, l1 and l2
 *
 *  @param a31 the angle between l3 and l1 in radian
 *  @param l1 the first length of the triangle
 *  @param l2 the second length of the triangle
 *  @param checkLevel the level of check on the input angle
 *  @returns the two possible lengths of l3 of the triangle
 */
function triALLrL(
	a31: number,
	l1: number,
	l2: number,
	checkLevel = ECheck.eIgnore
): [number, number] {
	triCheckA(a31, 'triALLrL', checkLevel);
	triCheckL(l1, 'triALLrL', checkLevel);
	triCheckL(l2, 'triALLrL', checkLevel);
	// TODO
	const rl3a = 100;
	const rl3b = 100;
	return [rl3a, rl3b];
}

/**
 * Calculate one angle of a triangle from l1, l2, l3
 *
 *  @param l1 the first length of the triangle
 *  @param l2 the second length of the triangle
 *  @param l3 the third length of the triangle
 *  @param checkLevel the level of check on the input length
 *  @returns one angles of the triangle: a31
 */
function triLLLrA(l1: number, l2: number, l3: number, checkLevel = ECheck.eIgnore): number {
	triCheckL(l1, 'triLLLrA', checkLevel);
	triCheckL(l2, 'triLLLrA', checkLevel);
	triCheckL(l3, 'triLLLrA', checkLevel);
	const cosA31 = (l3 ** 2 + l1 ** 2 - l2 ** 2) / (2 * l3 * l1);
	if (Math.abs(cosA31) > 1) {
		const logstr = `triLLLrA : cosA31 ${ffix(cosA31)} is bigger than 1`;
		if (checkLevel === ECheck.eError) {
			throw `err181: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn182: ${logstr}`);
		}
	}
	const ra31 = Math.acos(cosA31);
	return ra31;
}

/**
 * Calculate the angles a12, a23, a31 of a triangle from the lengths l1, l2 and l3
 *
 *  @param l1 the first length of the triangle
 *  @param l2 the second length of the triangle
 *  @param l3 the third length of the triangle
 *  @param checkLevel the level of check on the input lengths
 *  @returns the three angles a12, a23, a31 of the triangle
 */
function triLLLrAAA(
	l1: number,
	l2: number,
	l3: number,
	checkLevel = ECheck.eError
): [number, number, number] {
	const ra31 = triLLLrA(l1, l2, l3, checkLevel);
	const ra12 = triLLLrA(l2, l3, l1, checkLevel);
	const ra23 = triAArA(ra31, ra12, checkLevel);
	return [ra31, ra12, ra23];
}

export {
	triDegRad,
	triRadDeg,
	triAPiPi,
	triA02Pi,
	triA0Pi,
	triAPihPih,
	ECheck,
	triAArA,
	triALArLL,
	triLALrL,
	triALLrL,
	triLLLrA,
	triLLLrAAA
};
