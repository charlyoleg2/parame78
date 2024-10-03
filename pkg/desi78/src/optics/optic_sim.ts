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

//const c_simOne = 0;
//const c_simTwo = 1;
//const c_simParallel = 2;
//const c_simObject = 3;

function rayTrace(
	objectPx: number,
	objectPy: number,
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
	TypeR: number
): [tContour[], string] {
	const rays: tContour[] = [];
	let logSim = 'Optic simulator:\n';
	const ray1A1 = degToRad(ray1Angle);
	const ray2A1 = degToRad(ray2Angle);
	const ctrRay1 = contour(objectPx, objectPy, 'yellow');
	ctrRay1.addSegStrokeRP(ray1A1, Math.abs(objectPx));
	rays.push(ctrRay1);
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
