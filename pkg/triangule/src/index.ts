// index.ts : entry point of the library triangule

function triDegRad(aDeg: number): number {
	const rA = (aDeg * Math.PI) / 180;
	return rA;
}

function triRadDeg(aRad: number): number {
	const rAdeg = (aRad * 180) / Math.PI;
	return rAdeg;
}

function triAArA(a1: number, a2: number): number {
	const rA = Math.PI - a1 - a2;
	return rA;
}

export { triDegRad, triRadDeg, triAArA };
