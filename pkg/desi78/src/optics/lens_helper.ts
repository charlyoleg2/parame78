// lens_helper.ts
// helper function for creating design with several lens on the Ox axis

import type { Contour } from 'geometrix';
import { contour, ffix } from 'geometrix';

interface tPL {
	D1: number;
	E1: number;
	Rl: number;
	Dl: number;
	TypeL: number;
	Rr: number;
	Dr: number;
	TypeR: number;
	Drh: number;
	Dlh: number;
	E1pL: number;
	E1pR: number;
	E2: number;
	E1h: number;
	D1h: number;
	x1: number;
	x2: number;
}

function initPL(): tPL {
	const rPL: tPL = {
		D1: 0,
		E1: 0,
		Rl: 0,
		Dl: 0,
		TypeL: 0,
		Rr: 0,
		Dr: 0,
		TypeR: 0,
		Drh: 0,
		Dlh: 0,
		E1pL: 0,
		E1pR: 0,
		E2: 0,
		E1h: 0,
		D1h: 0,
		x1: 0,
		x2: 0
	};
	return rPL;
}

// sub-functions
function e1plus(aRcurve: number, aDiameter: number, aType: number): number {
	let rPlus = 0; // planar case
	const diamH = aDiameter / 2;
	const delta = aRcurve * (1 - Math.sqrt(1 - (diamH / aRcurve) ** 2));
	if (aType === 0) {
		// convex case
		rPlus = delta;
	} else if (aType === 2) {
		// concave case
		rPlus = -1 * delta;
	}
	return rPlus;
}

function checkLensParam(pl: tPL, label: string) {
	if (pl.Dr > pl.D1) {
		throw `err390: ${label} : Dr ${pl.Dr} is larger than D1 ${pl.D1}`;
	}
	if (pl.Dl > pl.D1) {
		throw `err393: ${label} : Dl ${pl.Dl} is larger than D1 ${pl.D1}`;
	}
	if (pl.E2 < 0) {
		throw `err396:${label} :  E2 ${ffix(pl.E2)} is negative because of E1pL ${ffix(pl.E1pL)} or E1pR ${ffix(pl.E1pR)}`;
	}
}

function logLens(pl: tPL, label: string): string {
	const rLog = `${label} : E2: ${ffix(pl.E2)} mm
${label} : x1: ${ffix(pl.x1)}, x2: ${ffix(pl.x2)} mm\n`;
	return rLog;
}

// first half of the lens
function ctrHalfLens(pl: tPL, Px: number, aYS: number, aClose: boolean): Contour {
	const rCtr = contour(Px + pl.E1h, 0);
	if (pl.TypeR !== 1) {
		rCtr.addPointA(Px + pl.x2, aYS * pl.Drh).addSegArc3((aYS * Math.PI) / 2, true);
	}
	rCtr.addSegStrokeA(Px + pl.x2, aYS * pl.D1h).addSegStrokeA(Px + pl.x1, aYS * pl.D1h);
	if (pl.TypeL !== 1) {
		rCtr.addSegStrokeA(Px + pl.x1, aYS * pl.Dlh)
			.addPointA(Px - pl.E1h, 0)
			.addSegArc3((aYS * Math.PI) / 2, false);
	} else {
		rCtr.addSegStrokeA(Px - pl.E1h, 0);
	}
	if (aClose) {
		rCtr.closeSegStroke();
	}
	return rCtr;
}

// second half of the lens
function otherHalfLens(ctrLens: Contour, pl: tPL, Px: number) {
	if (pl.TypeL !== 1) {
		ctrLens.addPointA(Px - pl.E1h + pl.E1pL, -pl.Dlh).addSegArc3(-Math.PI / 2, true);
	}
	ctrLens.addSegStrokeA(Px - pl.E1h + pl.E1pL, -pl.D1h).addSegStrokeA(pl.E1h - pl.E1pR, -pl.D1h);
	if (pl.TypeR !== 1) {
		ctrLens
			.addSegStrokeA(pl.E1h - pl.E1pR, -pl.Drh)
			.addPointA(pl.E1h, 0)
			.addSegArc3(-Math.PI / 2, false);
	} else {
		ctrLens.addSegStrokeA(pl.E1h, 0);
	}
}

export type { tPL };
export { initPL, e1plus, checkLensParam, logLens, ctrHalfLens, otherHalfLens };
