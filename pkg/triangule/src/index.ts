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
 *  @returns the string to be printed in log
 */
function triCheckAction(strID: string, msg: string, checkLevel: ECheck): string {
	let rStr = '';
	if (checkLevel === ECheck.eError) {
		throw `err${strID}: ${msg}`;
	} else if (checkLevel === ECheck.eWarn) {
		rStr += `warn${strID}: ${msg}\n`;
	}
	//console.log(rStr);
	return rStr;
}

/**
 * Check if the angle is zero or negative
 *
 *  @param a1 - an angle in radian
 *  @param ctx - a string to give an hint of the context of the check
 *  @param checkLevel - the level of check on the input angles
 *  @returns the string to be printed in log
 */
function triCheckA(a1: number, ctx: string, checkLevel = ECheck.eError): string {
	let rStr = '';
	const a1b = triAPiPi(a1);
	if (a1b <= 0 || triIsZero(a1b)) {
		const eMsg = `${ctx} : a1 ${ffix(a1)}, a1b ${ffix(a1b)} is null or negative`;
		rStr += triCheckAction('145', eMsg, checkLevel);
	}
	return rStr;
}

/**
 * Check if the length is zero or negative
 *
 *  @param l1 - a length
 *  @param ctx - a string to give an hint of the context of the check
 *  @param checkLevel - the level of check on the input length
 *  @returns the string to be printed in log
 */
function triCheckL(l1: number, ctx: string, checkLevel = ECheck.eError): string {
	let rStr = '';
	if (l1 <= 0 || triIsZero(l1)) {
		const eMsg = `${ctx} : l1 ${ffix(l1)} is null or negative`;
		rStr += triCheckAction('159', eMsg, checkLevel);
	}
	return rStr;
}

/**
 * Calculate the third angle of a triangle from the first two angles
 *
 *  @param a1 - the first angle of the triangle in radian
 *  @param a2 - the second angle of the triangle in radian
 *  @param checkLevel - the level of check on the input angles
 *  @returns the third angle of the triangle in radian + string-for-log
 */
function triAArA(a1: number, a2: number, checkLevel = ECheck.eError): [number, string] {
	let rStr = '';
	const a1b = triAPiPi(a1);
	const a2b = triAPiPi(a2);
	rStr += triCheckA(a1b, 'triAArA', ECheck.eIgnore);
	rStr += triCheckA(a2b, 'triAArA', ECheck.eIgnore);
	if (Math.sign(a1) * Math.sign(a2) < 0) {
		const eMsg = `triAArA : the signs of a1 ${ffix(a1)} and a2 ${ffix(a2)} differ`;
		rStr += triCheckAction('178', eMsg, checkLevel);
	}
	if (Math.abs(a1b) + Math.abs(a2b) >= Math.PI) {
		const eMsg = `triAArA : a1 ${ffix(a1)} plus a2 ${ffix(a2)} are bigger than Pi`;
		rStr += triCheckAction('182', eMsg, checkLevel);
	}
	const rA = triAPiPi(Math.PI - a1 - a2);
	return [rA, rStr];
}

/**
 * Calculate the two last lengths and one anmgle of a triangle from the first length and two angles
 *
 *  @param a1 - the first angle of the triangle in radian
 *  @param l12 - the length between the angles a1 and a2 in radian
 *  @param a2 - the second angle of the triangle in radian
 *  @param checkLevel - the level of check
 *  @returns the two lengths of the triangle : l23, l31 + string-fot-log
 */
function triALArLL(
	a1: number,
	l12: number,
	a2: number,
	checkLevel = ECheck.eError
): [number, number, string] {
	let rStr = '';
	const [a3, str2] = triAArA(a1, a2, checkLevel);
	rStr += str2;
	rStr += triCheckL(l12, 'triALArLL', checkLevel);
	let rl23 = 0;
	let rl31 = 0;
	if (triIsZero(a3)) {
		const eMsg = `triALArLL : flat triangle with a1 ${ffix(a1)}, a2 ${ffix(a2)} and a3 ${ffix(a3)}`;
		rStr += triCheckAction('209', eMsg, checkLevel);
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
	return [rl23, rl31, rStr];
}

/**
 * Calculate the length l3 of a triangle from l1, a12 and l2
 *
 *  @param l1 - the first length of the triangle
 *  @param a12 - the angle between l1 and l2 in radian
 *  @param l2 - the second length of the triangle
 *  @param checkLevel - the level of check
 *  @returns the length l3 of the triangle + string-for-log
 */
function triLALrL(
	l1: number,
	a12: number,
	l2: number,
	checkLevel = ECheck.eError
): [number, string] {
	let rStr = '';
	rStr += triCheckL(l1, 'triLALrL', checkLevel);
	rStr += triCheckA(a12, 'triLALrL', ECheck.eIgnore);
	rStr += triCheckL(l2, 'triLALrL', checkLevel);
	const ql3 = l1 ** 2 + l2 ** 2 - 2 * l1 * l2 * Math.cos(a12);
	if (ql3 < 0) {
		const eMsg = `triLALrL : ql3 ${ffix(ql3)} is negative with l1 ${ffix(l1)}, a12 ${ffix(a12)}, l2 ${ffix(l2)}`;
		rStr += triCheckAction('241', eMsg, checkLevel);
	}
	const rl3 = Math.sqrt(ql3);
	return [rl3, rStr];
}

/**
 * Calculate the length l3 of a triangle from a31, l1 and l2
 *
 *  @param a31 - the angle between l3 and l1 in radian
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param checkLevel - the level of check
 *  @returns the two possible lengths of l3 of the triangle. l3 can be positive or negative + string-for-log
 */
function triALLrL(
	a31: number,
	l1: number,
	l2: number,
	checkLevel = ECheck.eError
): [number, number, string] {
	let rStr = '';
	rStr += triCheckA(a31, 'triALLrL', ECheck.eIgnore);
	rStr += triCheckL(l1, 'triALLrL', checkLevel);
	rStr += triCheckL(l2, 'triALLrL', checkLevel);
	//const qA = 1;
	const qB = -2 * l1 * Math.cos(a31);
	const qC = l1 ** 2 - l2 ** 2;
	const qD = qB ** 2 - 4 * qC;
	if (qD < 0) {
		const eMsg = `triALLrL : qD ${ffix(qD)} is negative with a31 ${ffix(a31)}, l1 ${ffix(l1)}, l2 ${ffix(l2)}`;
		rStr += triCheckAction('271', eMsg, checkLevel);
	}
	const rx1 = (-qB - Math.sqrt(qD)) / 2;
	const rx2 = (-qB + Math.sqrt(qD)) / 2;
	rStr += triCheckL(rx1, 'triALLrL', ECheck.eWarn);
	rStr += triCheckL(rx2, 'triALLrL', ECheck.eWarn);
	return [rx1, rx2, rStr];
}

/**
 * Calculate the length l3 and angle a12 of a triangle from a31, l1 and l2
 *
 *  @param a31 - the angle between l3 and l1 in radian
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param checkLevel - the level of check
 *  @returns the two possible sets of l3, a31, a12 of the triangle [l3a, a31a, a12a, l3b, a31b, a12b] + string-for-log
 */
function triALLrLAA(
	a31: number,
	l1: number,
	l2: number,
	checkLevel = ECheck.eError
): [number, number, number, number, number, number, string] {
	let rStr = '';
	const [rl3a, rl3b, str2] = triALLrL(a31, l1, l2, checkLevel);
	rStr += str2;
	const ra31a = rl3a > 0 ? a31 : triAPiPi(a31 - Math.PI);
	const ra31b = rl3b > 0 ? a31 : triAPiPi(a31 - Math.PI);
	const [a12a, str3] = triLLLrA(l2, Math.abs(rl3a), l1, checkLevel);
	const [a12b, str4] = triLLLrA(l2, Math.abs(rl3b), l1, checkLevel);
	rStr += str3 + str4;
	const ra12a = Math.sign(ra31a) * a12a;
	const ra12b = Math.sign(ra31b) * a12b;
	return [rl3a, ra31a, ra12a, rl3b, ra31b, ra12b, rStr];
}

/**
 * Calculate one angle of a triangle from l1, l2, l3
 *
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param l3 - the third length of the triangle
 *  @param checkLevel - the level of check
 *  @returns one angles of the triangle: a31 + string-for-log
 */
function triLLLrA(
	l1: number,
	l2: number,
	l3: number,
	checkLevel = ECheck.eError
): [number, string] {
	let rStr = '';
	rStr += triCheckL(l1, 'triLLLrA', checkLevel);
	rStr += triCheckL(l2, 'triLLLrA', checkLevel);
	rStr += triCheckL(l3, 'triLLLrA', checkLevel);
	const cosA31 = (l3 ** 2 + l1 ** 2 - l2 ** 2) / (2 * l3 * l1);
	if (Math.abs(cosA31) > 1) {
		const eMsg = `triLLLrA : cosA31 ${ffix(cosA31)} is bigger than 1`;
		rStr += triCheckAction('296', eMsg, checkLevel);
	}
	const ra31 = Math.acos(cosA31);
	return [ra31, rStr];
}

/**
 * Calculate the angles a12, a23, a31 of a triangle from the lengths l1, l2 and l3
 *
 *  @param l1 - the first length of the triangle
 *  @param l2 - the second length of the triangle
 *  @param l3 - the third length of the triangle
 *  @param checkLevel - the level of check
 *  @returns the three angles a12, a23, a31 of the triangle + string-for-log
 */
function triLLLrAAA(
	l1: number,
	l2: number,
	l3: number,
	checkLevel = ECheck.eError
): [number, number, number, string] {
	let rStr = '';
	const [ra31, str2] = triLLLrA(l1, l2, l3, checkLevel);
	const [ra12, str3] = triLLLrA(l2, l3, l1, checkLevel);
	const [ra23, str4] = triAArA(ra31, ra12, checkLevel);
	rStr += str2 + str3 + str4;
	return [ra31, ra12, ra23, rStr];
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
