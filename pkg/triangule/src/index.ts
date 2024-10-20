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
	if (a1b <= 0) {
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
	if (l1 <= 0) {
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
 *  @returns the two lengths and one angle of the triangle : l23, a3, l31
 */
function triALArLAL(
	a1: number,
	l12: number,
	a2: number,
	checkLevel = ECheck.eError
): [number, number, number] {
	const ra3 = triAArA(a1, a2, checkLevel);
	triCheckL(l12, 'triALArLAL', checkLevel);
	let rl23 = 0;
	let rl31 = 0;
	if (triIsZero(ra3)) {
		const logstr = `triALArLAL : flat triangle with a1 ${ffix(a1)}, a2 ${ffix(a2)} and ra3 ${ffix(ra3)}`;
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
		rl23 = (l12 * Math.sin(a1)) / Math.sin(ra3);
		rl31 = (l12 * Math.sin(a2)) / Math.sin(ra3);
	}
	return [rl23, ra3, rl31];
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
	if (a12 < 0) {
		const logstr = `triLALrL a12 ${ffix(a12)} is negative`;
		if (checkLevel === ECheck.eError) {
			throw `err490: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn491: ${logstr}`);
		}
	}
	const rl3 = Math.sqrt(l1 ** 2 + l2 ** 2 - 2 * l1 * l2 * Math.cos(a12));
	return rl3;
}

/**
 * Calculate one length and two angles of a triangle from l1, a12 and l2
 *
 *  @param l1 the first length of the triangle
 *  @param a12 the angle between l1 and l2 in radian
 *  @param l2 the second length of the triangle
 *  @param checkLevel the level of check on the input angle
 *  @returns one length and two angles of the triangle: a23, l3, a31
 */
function triLALrALA(
	l1: number,
	a12: number,
	l2: number,
	checkLevel = ECheck.eIgnore
): [number, number, number] {
	const rl3 = triLALrL(l1, a12, l2, checkLevel);
	if (rl3 <= 0) {
		const logstr = `triLALrALA rl3 ${ffix(rl3)} is null or negative`;
		if (checkLevel === ECheck.eError) {
			throw `err498: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn499: ${logstr}`);
		}
	}
	const ra23 = Math.asin((Math.sin(a12) * l1) / rl3);
	const ra31 = Math.asin((Math.sin(a12) * l2) / rl3);
	return [ra23, rl3, ra31];
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
	if (a31 < 0) {
		const logstr = `triALLrL a31 ${ffix(a31)} is negative`;
		if (checkLevel === ECheck.eError) {
			throw `err590: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
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
	checkLevel = ECheck.eError
): [number, number, number] {
	// check that the 3 lengths are positive
	if (l1 <= 0 || l2 <= 0 || l3 <= 0) {
		const logstr = `triLLLrAAA some lengths are null or negative: l1 ${ffix(l1)}, l2 ${ffix(l2)}, l3 ${ffix(l3)}`;
		if (checkLevel === ECheck.eError) {
			throw `err694: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
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
	checkLevel = ECheck.eError
): [number, number, number] {
	const triLenghts = [l1, l2, l3];
	const [tl1Idx, tl2Idx, tl3Idx] = triOrderLLLrIII(l1, l2, l3, checkLevel);
	const tl1 = triLenghts[tl1Idx];
	const tl2 = triLenghts[tl2Idx];
	const tl3 = triLenghts[tl3Idx];
	//console.log(`dbg326: tl1 ${ffix(tl1)}, tl2 ${ffix(tl2)}, tl3 ${ffix(tl3)}`);
	const tl23 = tl2 + tl3;
	// check the length condition tl1 < tl2 + tl3
	if (tl23 < tl1) {
		const logstr = `triLLLrAAA tl1 ${ffix(tl1)} is bigger than tl2+tl3 ${ffix(tl23)}, tl2 ${ffix(tl2)}, tl3 ${ffix(tl3)}`;
		if (checkLevel === ECheck.eError) {
			throw `err690: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn691: ${logstr}`);
		}
	}
	// lAB and LBC
	const lAB = (tl2 ** 2 - tl3 ** 2 + tl1 ** 2) / (2 * tl1);
	const lBC = tl1 - lAB;
	//console.log(`dbg340: lAB ${ffix(lAB)}, lBC ${ffix(lBC)}`);
	// angle calculation
	if (tl2 < Math.abs(lAB)) {
		const logstr = `triLLLrAAA tl2 ${ffix(tl2)} is smaller than lAB ${ffix(lAB)}`;
		if (checkLevel === ECheck.eError) {
			throw `err390: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn391: ${logstr}`);
		}
	}
	if (tl3 < Math.abs(lBC)) {
		const logstr = `triLLLrAAA tl3 ${ffix(tl3)} is smaller than lBC ${ffix(lBC)}`;
		if (checkLevel === ECheck.eError) {
			throw `err392: ${logstr}`;
		} else if (checkLevel === ECheck.eWarn) {
			console.log(`warn393: ${logstr}`);
		}
	}
	const ta12 = Math.acos(lAB / tl2);
	const ta23 = Math.acos(lBC / tl3);
	const ta31 = triAArA(ta12, ta23);
	//console.log(`dbg343: ta12 ${ffix(ta12)}, ta23 ${ffix(ta23)}, ta31 ${ffix(ta31)}`);
	// reordering of the angles
	const rAAA: [number, number, number] = [0, 0, 0];
	rAAA[tl1Idx] = ta12;
	rAAA[tl2Idx] = ta23;
	rAAA[tl3Idx] = ta31;
	return rAAA;
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
	triALArLAL,
	triLALrL,
	triLALrALA,
	triALLrL,
	triOrderLLLrIII,
	triLLLrAAA
};
