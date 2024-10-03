// optic_sim.ts

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

const c_simOne = 0;
//const c_simTwo = 1;
//const c_simParallel = 2;
//const c_simObject = 3;

function traceOneRay(
	objPx: number,
	objPy: number,
	rayAngle1: number,
	E1: number,
	Dl: number,
	Rl: number,
	TypeL: number,
	Dr: number,
	Rr: number,
	TypeR: number,
	imgPx: number
) {
	const rCtrRay1 = contour(objPx, objPy, 'yellow');
	rCtrRay1.addSegStrokeRP(rayAngle1, Math.abs(objPx));
	console.log(E1, Dl, Rl, TypeL, Dr, Rr, TypeR, imgPx); //dbg
	return rCtrRay1;
}

function rayTrace(
	objPx: number,
	objPy: number,
	ray1Angle: number,
	ray2Angle: number,
	rayNb: number,
	simType: number,
	E1: number,
	Dl: number,
	Rl: number,
	TypeL: number,
	Dr: number,
	Rr: number,
	TypeR: number,
	imgPx: number
): [tContour[], string] {
	const rays: tContour[] = [];
	let logSim = 'Optic simulator:\n';
	const ray1A1 = degToRad(ray1Angle);
	const ray2A1 = degToRad(ray2Angle);
	if (simType === c_simOne) {
		const ctrRay1 = traceOneRay(objPx, objPy, ray1A1, E1, Dl, Rl, TypeL, Dr, Rr, TypeR, imgPx);
		rays.push(ctrRay1);
	}
	logSim += `ray1-angle1: ${ffix(radToDeg(ray1A1))}
ray2-angle1: ${ffix(radToDeg(ray2A1))}
rayNb: ${rayNb}
simType: ${simType}
E1: ${E1}
Dioptre-left  :  Dl: ${Dl}, Rl: ${Rl}, TypeL: ${TypeL}
Dioptre-right :  Dr: ${Dr}, Rr: ${Rr}, TypeR: ${TypeR}
End of simulator\n`;
	return [rays, logSim];
}

export { rayTrace };
