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
const c_simTwo = 1;
const c_simParallel = 2;
//const c_simObject = 3;

// line intersection
function lineXline(rs1: tRaySeg, rs2: tRaySeg): tInterX {
	// ta1 = tan(a1); ta2 = tan(a2)
	// y = ta1 * (x - x1) + y1 = ta2 * (x - x2) + y2
	// x * (ta1 - ta2) = y2 - y1 - x2 * ta2 + x1 * ta1
	const ta1 = Math.tan(rs1.aa);
	const ta2 = Math.tan(rs2.aa);
	const ta12 = ta1 - ta2;
	if (ta12 === 0) {
		throw `err073: error of parallel line intersection. a1: ${ffix(rs1.aa)} a2: ${ffix(rs2.aa)}`;
	}
	const ix = (rs2.yy - rs1.yy - rs2.xx * ta2 + rs1.xx * ta1) / ta12;
	const iy = ta1 * (ix - rs1.xx) + rs1.yy;
	const rInterX: tInterX = { ix: ix, iy: iy, refR: 0 };
	return rInterX;
}

// quadratic equation
function lineXcircle(
	rs: tRaySeg,
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
	const ta = Math.tan(rs.aa);
	const AA = ta ** 2 + 1;
	const BB = 2 * ta * (rs.yy - rs.xx * ta) - 2 * cx;
	const CC = (rs.yy - rs.xx * ta) ** 2 - radius ** 2 + cx ** 2;
	const DD = BB ** 2 - 4 * AA * CC;
	if (DD < 0) {
		throw `err090: D ${ffix(DD)} < 0. The ray is out of the circle`;
	}
	const ix = (-BB - signe * Math.sqrt(DD)) / (2 * AA); // select opening or closing with signe
	const iy = rs.yy + (ix - rs.xx) * ta;
	const refR = withinHPiHPi(Math.atan2(iy, ix - cx));
	if (Math.abs(refR) > angle) {
		throw `err097: refR ${ffix(refR)} out of lens-angle ${ffix(angle)}`;
	}
	const rInterX: tInterX = { ix: ix, iy: iy, refR: refR };
	return rInterX;
}

// a single ray, one dioptre
function traceDioptre(rs: tRaySeg, diop: tDioptre): tRaySeg {
	const rRaySeg: tRaySeg = { xx: 0, yy: 0, aa: 0 };
	if (diop.signe === 0) {
		// stroke
		rRaySeg.xx = diop.cx;
		rRaySeg.yy = rs.yy + (diop.cx - rs.xx) * Math.tan(rs.aa);
		rRaySeg.aa = Math.asin((Math.sin(rs.aa) * diop.n0) / diop.n1);
	} else {
		// opening circle and closing circle
		const interX = lineXcircle(rs, diop.cx, diop.radius, diop.signe, diop.angle);
		rRaySeg.xx = interX.ix;
		rRaySeg.yy = interX.iy;
		rRaySeg.aa = interX.refR + Math.asin((Math.sin(rs.aa - interX.refR) * diop.n0) / diop.n1);
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
function traceOneRayInLens(rs0: tRaySeg, n0: number, lens: tLens): [tRaySeg, tRaySeg] {
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
	const rs1 = traceDioptre(rs0, dioptre1);
	const rs2 = traceDioptre(rs1, dioptre2);
	return [rs1, rs2];
}

// intersection between a line (lx, ly, la) and a wall (a vertical line at wx)
function lineXwall(rs: tRaySeg, wx: number): number {
	const dx = wx - rs.xx;
	const dy = dx * Math.tan(rs.aa);
	const rwy = rs.yy + dy;
	return rwy;
}

// a single ray, full path
function traceOneRay(obj: tRaySeg, n0: number, lenss: tLens[], imgPx: number): [tContour, tRaySeg] {
	const rCtrRay1 = contour(obj.xx, obj.yy, 'yellow');
	const rs0: tRaySeg = { xx: obj.xx, yy: obj.yy, aa: obj.aa };
	for (const lens of lenss) {
		const [rs1, rs2] = traceOneRayInLens(rs0, n0, lens);
		rCtrRay1.addSegStrokeA(rs1.xx, rs1.yy).addSegStrokeA(rs2.xx, rs2.yy);
		rs0.xx = rs2.xx;
		rs0.yy = rs2.yy;
		rs0.aa = rs2.aa;
	}
	const wallX = imgPx * 1.2;
	const wallY = lineXwall(rs0, wallX);
	rCtrRay1.addSegStrokeA(wallX, wallY);
	return [rCtrRay1, rs0];
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
	const ray1A1 = degToRad(ray1Angle);
	const ray2A1 = degToRad(ray2Angle);
	let logSim = `Optic simulator:
ray1-angle1: ${ffix(radToDeg(ray1A1))}
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
	logSim += `index of refraction of the environment: n0: ${n0}\n`;
	const obj1: tRaySeg = { xx: objPx, yy: objPy, aa: ray1A1 };
	const obj2: tRaySeg = { xx: objPx, yy: objPy, aa: ray2A1 };
	const DlUsed = lenss[0].Dl * 0.98;
	if (simType === c_simOne) {
		const [ctrRay1] = traceOneRay(obj1, n0, lenss, imgPx);
		rays.push(ctrRay1);
	} else if (simType === c_simTwo) {
		const [ctrRay1, rs1] = traceOneRay(obj1, n0, lenss, imgPx);
		const [ctrRay2, rs2] = traceOneRay(obj2, n0, lenss, imgPx);
		rays.push(ctrRay1, ctrRay2);
		const pi = lineXline(rs1, rs2);
		logSim += `ray intersection:  ix: ${ffix(pi.ix)}, iy: ${ffix(pi.iy)}\n`;
	} else {
		const rss: tRaySeg[] = [];
		if (simType === c_simParallel) {
			if (rayNb < 2) {
				const objPy2 = objPx * Math.tan(ray1A1);
				const obj: tRaySeg = { xx: objPx, yy: objPy2, aa: ray1A1 };
				const [ctrRay1] = traceOneRay(obj, n0, lenss, imgPx);
				rays.push(ctrRay1);
			} else {
				const objPy2 = objPx * Math.tan(ray1A1) - DlUsed / 2;
				const objPyS = DlUsed / (rayNb - 1);
				for (let idx = 0; idx < rayNb; idx++) {
					const obj: tRaySeg = { xx: objPx, yy: objPy2 + idx * objPyS, aa: ray1A1 };
					const [ctrRay, rs] = traceOneRay(obj, n0, lenss, imgPx);
					rays.push(ctrRay);
					rss.push(rs);
				}
			}
		}
		if (rayNb > 1) {
			const pi1 = lineXline(rss[0], rss[1]);
			logSim += `ray intersection:  ix: ${ffix(pi1.ix)}, iy: ${ffix(pi1.iy)}\n`;
			if (rayNb > 2) {
				const pi2 = lineXline(rss.slice(-2)[0], rss.slice(-1)[0]);
				const pi3 = lineXline(rss[0], rss.slice(-1)[0]);
				const dx12 = Math.abs(pi2.ix - pi1.ix);
				const dx32 = Math.abs(pi3.ix - pi2.ix);
				const dx31 = Math.abs(pi3.ix - pi1.ix);
				const dy12 = Math.abs(pi2.iy - pi1.iy);
				const dy32 = Math.abs(pi3.iy - pi2.iy);
				const dy31 = Math.abs(pi3.iy - pi1.iy);
				const aberX = Math.max(dx12, dx32, dx31);
				const aberY = Math.max(dy12, dy32, dy31);
				logSim += `aberration:  aberX: ${ffix(aberX)}, aberY: ${ffix(aberY)}\n`;
			}
		}
	}
	logSim += `End of simulator\n`;
	return [rays, logSim];
}

export type { tLens };
export { rayTrace };
