// optic_sim.ts
// Simple optic simulator for spherical lens
// the spherical lens are alwaz centered on the Ox axis
// the light goes always from left to right. No vertical or backward ray

import type {
	//Contour,
	tContour
} from 'geometrix';
import {
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

const c_simOne = 0;
//const c_simTwo = 1;
//const c_simParallel = 2;
//const c_simObject = 3;

// intersection between a line (lx, ly, la) and a wall (a vertical line at wx)
function lineXwall(lx: number, ly: number, la: number, wx: number): number {
	const dx = wx - lx;
	const dy = dx * Math.tan(la);
	const rwy = ly + dy;
	return rwy;
}

// compute a single ray
function traceOneRay(
	objPx: number,
	objPy: number,
	rayAngle1: number,
	n0: number,
	lenss: tLens[],
	imgPx: number
) {
	const rCtrRay1 = contour(objPx, objPy, 'yellow');
	const wallX = imgPx * 1.2;
	const wallY = lineXwall(objPx, objPy, rayAngle1, wallX);
	rCtrRay1.addSegStrokeA(wallX, wallY);
	console.log(lenss[0].E1, n0); //dbg
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
