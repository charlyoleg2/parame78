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
		const logstr = `triALArLL : flat triangle with a1 ${ffix(a1)}, a2 ${ffix(a2)} and a3 ${ffix(a3)}`;
		if (checkLevel === EAngleCheck.eError) {
			throw `err390: ${logstr}`;
		} else if (checkLevel === EAngleCheck.eWarn) {
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
function triLALrL(l1: number, a12: number, l2: number, checkLevel = EAngleCheck.eIgnore): number {
	if (a12 < 0) {
		const logstr = `triLALrL a12 ${ffix(a12)} is negative`;
		if (checkLevel === EAngleCheck.eError) {
			throw `err490: ${logstr}`;
		} else if (checkLevel === EAngleCheck.eWarn) {
			console.log(`warn491: ${logstr}`);
		}
	}
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
	checkLevel = EAngleCheck.eIgnore
): [number, number] {
	if (a31 < 0) {
		const logstr = `triALLrL a31 ${ffix(a31)} is negative`;
		if (checkLevel === EAngleCheck.eError) {
			throw `err590: ${logstr}`;
		} else if (checkLevel === EAngleCheck.eWarn) {
			console.log(`warn591: ${logstr}`);
		}
	}
	// TODO
	const rl3a = 100;
	const rl3b = 100;
	return [rl3a, rl3b];
}

/**
 * Order the lengths l1, l2 and l3\
 * @internal
 *
 *  @param l1 a positive length-value
 *  @param l2 a positive length-value
 *  @param l3 a positive length-value
 *  @param checkLevel the level of check on the input lengths
 *  @returns [index of the max-value, index of middle-value, index of min-value]
 */
function triOrderLLLrIII(
	l1: number,
	l2: number,
	l3: number,
	checkLevel = EAngleCheck.eError
): [number, number, number] {
	// check that the 3 lengths are positive
	if (l1 <= 0 || l2 <= 0 || l3 <= 0) {
		const logstr = `triLLLrAAA some lengths are null or negative: l1 ${ffix(l1)}, l2 ${ffix(l2)}, l3 ${ffix(l3)}`;
		if (checkLevel === EAngleCheck.eError) {
			throw `err694: ${logstr}`;
		} else if (checkLevel === EAngleCheck.eWarn) {
			console.log(`warn695: ${logstr}`);
		}
	}
	// order the 3 lengths
	const triLenghts = [l1, l2, l3];
	const tl1 = Math.max(...triLenghts);
	const tl3 = Math.min(...triLenghts);
	const tl1idx = triLenghts.indexOf(tl1);
	let tl3idx = triLenghts.indexOf(tl3);
	if (tl3idx === tl1idx) {
		tl3idx += 1; // tl1idx should be 0
	}
	//console.log(`dbg291: tl1 ${tl1} tl3 ${tl3}`);
	//console.log(`dbg292: tl1idx ${tl1idx} tl3idx ${tl3idx}`);
	const tl2 = Math.max(...triLenghts.toSpliced(tl1idx, 1));
	let tl2idx = triLenghts.indexOf(tl2);
	for (let idx = 0; idx < 2; idx++) {
		if (tl2idx === tl1idx || tl2idx === tl3idx) {
			tl2idx += 1;
		}
	}
	//console.log(`dbg293: tl1idx ${tl1idx} tl2idx ${tl2idx} tl3idx ${tl3idx}`);
	return [tl1idx, tl2idx, tl3idx];
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
	checkLevel = EAngleCheck.eError
): [number, number, number] {
	const triLenghts = [l1, l2, l3];
	const [tl1Idx, tl2Idx, tl3Idx] = triOrderLLLrIII(l1, l2, l3, checkLevel);
	const tl1 = triLenghts[tl1Idx];
	const tl2 = triLenghts[tl2Idx];
	const tl3 = triLenghts[tl3Idx];
	const tl23 = tl2 + tl3;
	// check the length condition tl1 < tl2 + tl3
	if (tl23 < tl1) {
		const logstr = `triLLLrAAA tl1 ${ffix(tl1)} is bigger than tl2+tl3 ${ffix(tl23)}, tl2 ${ffix(tl2)}, tl3 ${ffix(tl3)}`;
		if (checkLevel === EAngleCheck.eError) {
			throw `err690: ${logstr}`;
		} else if (checkLevel === EAngleCheck.eWarn) {
			console.log(`warn691: ${logstr}`);
		}
	}
	// angle calculation
	// TODO
	const ra12 = Math.PI / 3;
	const ra23 = Math.PI / 3;
	const ra31 = Math.PI / 3;
	return [ra12, ra23, ra31];
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
	triALArLL,
	triLALrL,
	triALLrL,
	triOrderLLLrIII,
	triLLLrAAA
};
