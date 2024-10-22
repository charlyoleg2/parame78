// index.ts : entry point of the library triangule

/**
 * Prepare a float for printing log
 * @internal
 *
 *  @param ifloat - the floaf to be printed
 *  @returns the string ready for printing
 */
function ffix(ifloat: number): string {
	return ifloat.toFixed(2);
}

/**
 * Converts an angle in degree into radian
 *
 *  @param aDeg - the angle in degree
 *  @returns the angle in radian
 */
function triDegRad(aDeg: number): number {
	const rA = (aDeg * Math.PI) / 180;
	return rA;
}

/**
 * Converts an angle in radian into degree
 *
 *  @param aRad - the angle in radian
 *  @returns the angle in degree
 */
function triRadDeg(aRad: number): number {
	const rAdeg = (aRad * 180) / Math.PI;
	return rAdeg;
}

/**
 * Translate the angle in the range [-Pi, Pi]
 *
 *  @param aRad - the input angle in radian
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
 *  @param aRad - the input angle in radian
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
 *  @param aRad - the input angle in radian
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
 *  @param aRad - the input angle in radian
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
 *  @param aFloat - the float under test
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
 * Actions of the check
 *
 *  @param strID - an ID for identifying the context
 *  @param msg - the error/warning message to be displayed
 *  @param checkLevel - the level of check
 */
function triCheckAction(strID: string, msg: string, checkLevel: ECheck) {
	if (checkLevel === ECheck.eError) {
		throw `err${strID}: ${msg}`;
	} else if (checkLevel === ECheck.eWarn) {
		console.log(`warn${strID}: ${msg}`);
	}
}

/**
 * Check if the angle is zero or negative
 *
 *  @param a1 - an angle in radian
 *  @param ctx - a string to give an hint of the context of the check
 *  @param checkLevel - the level of check on the input angles
 */
function triCheckA(a1: number, ctx: string, checkLevel = ECheck.eError) {
	const a1b = triAPiPi(a1);
	if (a1b <= 0 || triIsZero(a1b)) {
		const eMsg = `${ctx} : a1 ${ffix(a1)}, a1b ${ffix(a1b)} is null or negative`;
		triCheckAction('145', eMsg, checkLevel);
	}
}

/**
 * Check if the length is zero or negative
 *
 *  @param l1 - a length
 *  @param ctx - a string to give an hint of the context of the check
 *  @param checkLevel - the level of check on the input length
 */
function triCheckL(l1: number, ctx: string, checkLevel = ECheck.eError) {
	if (l1 <= 0 || triIsZero(l1)) {
		const eMsg = `${ctx} : l1 ${ffix(l1)} is null or negative`;
		triCheckAction('159', eMsg, checkLevel);
	}
}

/**
 * Calculate the third angle of a triangle from the first two angles
 *
 *  @param a1 - the first angle of the triangle in radian
 *  @param a2 - the second angle of the triangle in radian
 *  @param checkLevel - the level of check on the input angles
 *  @returns the third angle of the triangle in radian
 */
function triAArA(a1: number, a2: number, checkLevel = ECheck.eError): number {
	const a1b = triAPiPi(a1);
	const a2b = triAPiPi(a2);
	triCheckA(a1b, 'triAArA', ECheck.eWarn);
	triCheckA(a2b, 'triAArA', ECheck.eWarn);
	if (Math.sign(a1) * Math.sign(a2) < 0) {
		const eMsg = `triAArA : the signs of a1 ${ffix(a1)} and a2 ${ffix(a2)} differ`;
		triCheckAction('178', eMsg, checkLevel);
	}
	if (Math.abs(a1b) + Math.abs(a2b) >= Math.PI) {
		const eMsg = `triAArA : a1 ${ffix(a1)} plus a2 ${ffix(a2)} are bigger than Pi`;
		triCheckAction('182', eMsg, checkLevel);
	}
	const rA = triAPiPi(Math.PI - a1 - a2);
	return rA;
}

/**
 * Calculate the two last lengths and one anmgle of a triangle from the first length and two angles
 *
 *  @param a1 - the first angle of the triangle in radian
 *  @param l12 - the length between the angles a1 and a2 in radian
 *  @param a2 - the second angle of the triangle in radian
 *  @param checkLevel - the level of check
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
		const eMsg = `triALArLL : flat triangle with a1 ${ffix(a1)}, a2 ${ffix(a2)} and a3 ${ffix(a3)}`;
		triCheckAction('209', eMsg, checkLevel);
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
 *  @param l1 - the first length of the triangle
 *  @param a12 - the angle between l1 and l2 in radian
 *  @param l2 - the second length of the triangle
 *  @param checkLevel - the level of check
 *  @returns the length l3 of the triangle
 */
function triLALrL(l1: number, a12: number, l2: number, checkLevel = ECheck.eError): number {
	triCheckL(l1, 'triLALrL', checkLevel);
	triCheckA(a12, 'triLALrL', ECheck.eWarn);
	triCheckL(l2, 'triLALrL', checkLevel);
	const ql3 = l1 ** 2 + l2 ** 2 - 2 * l1 * l2 * Math.cos(a12);
	if (ql3 < 0) {
		const eMsg = `triLALrL : ql3 ${ffix(ql3)} is negative with l1 ${ffix(l1)}, a12 ${ffix(a12)}, l2 ${ffix(l2)}`;
		triCheckAction('241', eMsg, checkLevel);
	}
	const rl3 = Math.sqrt(ql3);
	return rl3;
}

/**
 * Calculate the length l3 of a triangle from a31, l1 and l2
 *
 *  @param a31 - the angle between l3 and l1 in radian
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param checkLevel - the level of check
 *  @returns the two possible lengths of l3 of the triangle
 */
function triALLrL(
	a31: number,
	l1: number,
	l2: number,
	checkLevel = ECheck.eError
): [number, number] {
	triCheckA(a31, 'triALLrL', ECheck.eWarn);
	triCheckL(l1, 'triALLrL', checkLevel);
	triCheckL(l2, 'triALLrL', checkLevel);
	//const qA = 1;
	const qB = -2 * l1 * Math.cos(a31);
	const qC = l1 ** 2 - l2 ** 2;
	const qD = qB ** 2 - 4 * qC;
	if (qD < 0) {
		const eMsg = `triALLrL : qD ${ffix(qD)} is negative with a31 ${ffix(a31)}, l1 ${ffix(l1)}, l2 ${ffix(l2)}`;
		triCheckAction('271', eMsg, checkLevel);
	}
	const rx1 = (-qB - Math.sqrt(qD)) / 2;
	const rx2 = (-qB + Math.sqrt(qD)) / 2;
	triCheckL(rx1, 'triALLrL', ECheck.eWarn);
	triCheckL(rx2, 'triALLrL', ECheck.eWarn);
	return [rx1, rx2];
}

/**
 * Calculate the length l3 and angle a12 of a triangle from a31, l1 and l2
 *
 *  @param a31 - the angle between l3 and l1 in radian
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param checkLevel - the level of check
 *  @returns the two possible sets of l3, a31, a12 of the triangle [l3a, a31a, a12a, l3b, a31b, a12b]
 */
function triALLrLAA(
	a31: number,
	l1: number,
	l2: number,
	checkLevel = ECheck.eError
): [number, number, number, number, number, number] {
	const [rl3a, rl3b] = triALLrL(a31, l1, l2, checkLevel);
	const ra31a = rl3a > 0 ? a31 : triAPiPi(a31 - Math.PI);
	const ra31b = rl3b > 0 ? a31 : triAPiPi(a31 - Math.PI);
	const ra12a = Math.sign(ra31a) * triLLLrA(l2, Math.abs(rl3a), l1, checkLevel);
	const ra12b = Math.sign(ra31b) * triLLLrA(l2, Math.abs(rl3b), l1, checkLevel);
	return [rl3a, ra31a, ra12a, rl3b, ra31b, ra12b];
}

/**
 * Calculate one angle of a triangle from l1, l2, l3
 *
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param l3 - the third length of the triangle
 *  @param checkLevel - the level of check
 *  @returns one angles of the triangle: a31
 */
function triLLLrA(l1: number, l2: number, l3: number, checkLevel = ECheck.eError): number {
	triCheckL(l1, 'triLLLrA', checkLevel);
	triCheckL(l2, 'triLLLrA', checkLevel);
	triCheckL(l3, 'triLLLrA', checkLevel);
	const cosA31 = (l3 ** 2 + l1 ** 2 - l2 ** 2) / (2 * l3 * l1);
	if (Math.abs(cosA31) > 1) {
		const eMsg = `triLLLrA : cosA31 ${ffix(cosA31)} is bigger than 1`;
		triCheckAction('296', eMsg, checkLevel);
	}
	const ra31 = Math.acos(cosA31);
	return ra31;
}

/**
 * Calculate the angles a12, a23, a31 of a triangle from the lengths l1, l2 and l3
 *
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param l3 - the third length of the triangle
 *  @param checkLevel - the level of check
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
	triALLrLAA,
	triLLLrA,
	triLLLrAAA
};
