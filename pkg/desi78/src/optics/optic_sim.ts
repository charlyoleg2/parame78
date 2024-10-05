// optic_sim.ts
// Simple optic simulator for spherical lens
// the spherical lens are alwaz centered on the Ox axis
// the light goes always from left to right. No vertical or backward ray

import type {
	//Contour,
	tContour
} from 'geometrix';
import {
	withinHPiHPi,
	//point,
	//Point,
	//ShapePoint,
	//line,
	//vector,
	contour,
	//contourCircle,
	//ctrRectangle,
	//figure,
	degToRad,
	radToDeg,
	ffix
} from 'geometrix';

interface tLens {
	E1: number;
	Dl: number;
	Rl: number;
	TypeL: number;
	Dr: number;
	Rr: number;
	TypeR: number;
	ni: number;
	PosX: number;
}

interface tRayInLens {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	a2: number;
}

interface tDioptre {
	n0: number;
	n1: number;
	signe: number; // -1: open, 0: stroke, 1: close
	cx: number;
	radius: number;
	angle: number;
}

interface tRaySeg {
	xx: number;
	yy: number;
	aa: number;
}

interface tInterX {
	ix: number;
	iy: number;
	refR: number;
}

const c_simOne = 0;
//const c_simTwo = 1;
//const c_simParallel = 2;
//const c_simObject = 3;

// quadratic equation
function lineXcircle(
	x0: number,
	y0: number,
	a0: number,
	cx: number,
	radius: number,
	signe: number,
	angle: number
): tInterX {
	// y = y1+(x-x1)*tan(a1)
	// y**2 = cr**2-(x-cx)**2
	// ta = tan(a1)
	// y = y1+(x-x1)*ta = x*ta + y1-x1*ta
	// y**2 = x**2*ta**2 + x*2*ta*(y1-x1*ta) + (y1-x1*ta)**2
	// y**2 = -x**2 + x*2*cx + cr**2-cx**2
	// 0 = A*x**2 + B*x + C
	// A = ta**2+1
	// B = 2*ta*(y1-x1*ta)-2*cx
	// C = (y1-x1*ta)**2-cr**2+cx**2
	// D = B**2-4*A*C
	const ta = Math.tan(a0);
	const AA = ta ** 2 + 1;
	const BB = 2 * ta * (y0 - x0 * ta) - 2 * cx;
	const CC = (y0 - x0 * ta) ** 2 - radius ** 2 + cx ** 2;
	const DD = BB ** 2 - 4 * AA * CC;
	if (DD < 0) {
		throw `err090: D ${ffix(DD)} < 0. The ray is out of the circle`;
	}
	const ix = (-BB - signe * Math.sqrt(DD)) / (2 * AA); // select opening or closing with signe
	const iy = y0 + (ix - x0) * ta;
	const refR = withinHPiHPi(Math.atan2(iy, ix - cx));
	if (Math.abs(refR) > angle) {
		throw `err097: refR ${ffix(refR)} out of lens-angle ${ffix(angle)}`;
	}
	const rInterX: tInterX = { ix: ix, iy: iy, refR: refR };
	return rInterX;
}

// a single ray, one dioptre
function traceDioptre(x0: number, y0: number, a0: number, diop: tDioptre): tRaySeg {
	const rRaySeg: tRaySeg = { xx: 0, yy: 0, aa: 0 };
	if (diop.signe === 0) {
		// stroke
		rRaySeg.xx = diop.cx;
		rRaySeg.yy = y0 + (diop.cx - x0) * Math.tan(a0);
		rRaySeg.aa = Math.asin((Math.sin(a0) * diop.n0) / diop.n1);
	} else {
		// opening circle and closing circle
		const interX = lineXcircle(x0, y0, a0, diop.cx, diop.radius, diop.signe, diop.angle);
		rRaySeg.xx = interX.ix;
		rRaySeg.yy = interX.iy;
		rRaySeg.aa = interX.refR + Math.asin((Math.sin(a0 - interX.refR) * diop.n0) / diop.n1);
	}
	return rRaySeg;
}

// consvert type (0: convex, 1: stroke, 2: concave)
function typeToSign(typ: number): number {
	let rSigne = 0;
	if (typ === 0) {
		rSigne = 1;
	} else if (typ === 2) {
		rSigne = -1;
	}
	return rSigne;
}

// a single ray, one lens
function traceOneRayInLens(
	x0: number,
	y0: number,
	a0: number,
	n0: number,
	lens: tLens
): tRayInLens {
	const dioptre1: tDioptre = {
		n0: n0,
		n1: lens.ni,
		signe: typeToSign(lens.TypeL),
		cx: lens.PosX - lens.E1 / 2 + typeToSign(lens.TypeL) * lens.Rl,
		radius: lens.Rl,
		angle: Math.asin(lens.Dl / (2 * lens.Rl))
	};
	const dioptre2: tDioptre = {
		n0: lens.ni,
		n1: n0,
		signe: -typeToSign(lens.TypeR),
		cx: lens.PosX + lens.E1 / 2 - typeToSign(lens.TypeR) * lens.Rr,
		radius: lens.Rr,
		angle: Math.asin(lens.Dr / (2 * lens.Rr))
	};
	const rs1 = traceDioptre(x0, y0, a0, dioptre1);
	const rs2 = traceDioptre(rs1.xx, rs1.yy, rs1.aa, dioptre2);
	const rRayInLens: tRayInLens = { x1: rs1.xx, y1: rs1.yy, x2: rs2.xx, y2: rs2.yy, a2: rs2.aa };
	return rRayInLens;
}

// intersection between a line (lx, ly, la) and a wall (a vertical line at wx)
function lineXwall(lx: number, ly: number, la: number, wx: number): number {
	const dx = wx - lx;
	const dy = dx * Math.tan(la);
	const rwy = ly + dy;
	return rwy;
}

// a single ray, full path
function traceOneRay(
	objPx: number,
	objPy: number,
	rayAngle1: number,
	n0: number,
	lenss: tLens[],
	imgPx: number
): tContour {
	const rCtrRay1 = contour(objPx, objPy, 'yellow');
	let x0 = objPx;
	let y0 = objPy;
	let a0 = rayAngle1;
	for (const lens of lenss) {
		const ris = traceOneRayInLens(x0, y0, a0, n0, lens);
		rCtrRay1.addSegStrokeA(ris.x1, ris.y1).addSegStrokeA(ris.x2, ris.y2);
		x0 = ris.x2;
		y0 = ris.y2;
		a0 = ris.a2;
	}
	const wallX = imgPx * 1.2;
	const wallY = lineXwall(x0, y0, a0, wallX);
	rCtrRay1.addSegStrokeA(wallX, wallY);
	return rCtrRay1;
}

// entry function for all simulation types
function rayTrace(
	objPx: number,
	objPy: number,
	ray1Angle: number,
	ray2Angle: number,
	rayNb: number,
	simType: number,
	n0: number,
	lenss: tLens[],
	imgPx: number
): [tContour[], string] {
	const rays: tContour[] = [];
	let logSim = 'Optic simulator:\n';
	const ray1A1 = degToRad(ray1Angle);
	const ray2A1 = degToRad(ray2Angle);
	if (simType === c_simOne) {
		const ctrRay1 = traceOneRay(objPx, objPy, ray1A1, n0, lenss, imgPx);
		rays.push(ctrRay1);
	}
	logSim += `ray1-angle1: ${ffix(radToDeg(ray1A1))}
ray2-angle1: ${ffix(radToDeg(ray2A1))}
rayNb: ${rayNb}
simType: ${simType}\n`;
	for (let idx = 0; idx < lenss.length; idx++) {
		logSim += `lens-${idx + 1}
  E1: ${lenss[idx].E1}
  Dioptre-left  :  Dl: ${lenss[idx].Dl}, Rl: ${lenss[idx].Rl}, TypeL: ${lenss[idx].TypeL}
  Dioptre-right :  Dr: ${lenss[idx].Dr}, Rr: ${lenss[idx].Rr}, TypeR: ${lenss[idx].TypeR}
  index of refraction of the lens: ni: ${lenss[idx].ni}
  Position-X: ${lenss[idx].PosX} mm\n`;
	}
	logSim += `index of refraction of the environment: n0: ${n0}
End of simulator\n`;
	return [rays, logSim];
}

export type { tLens };
export { rayTrace };
