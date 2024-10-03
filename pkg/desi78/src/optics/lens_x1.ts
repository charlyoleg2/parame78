// lens_x1.ts
// a single spherical lens

// step-1 : import from geometrix
import type {
	Contour,
	//tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	//tExtrude,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	point,
	//Point,
	//ShapePoint,
	//line,
	vector,
	contour,
	//contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';
import type { tLens } from './optic_sim';
import { rayTrace } from './optic_sim';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'lens_x1',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 40, 1, 500, 1),
		pNumber('E1', 'mm', 6, 0.5, 200, 0.5),
		pSectionSeparator('Dioptre left'),
		pNumber('Dl', 'mm', 30, 1, 500, 1),
		pNumber('Rl', 'mm', 35, 1, 5000, 0.1),
		pDropdown('TypeL', ['convex', 'planar', 'concave']),
		pSectionSeparator('Dioptre right'),
		pNumber('Dr', 'mm', 30, 1, 500, 1),
		pNumber('Rr', 'mm', 50, 1, 5000, 0.1),
		pDropdown('TypeR', ['convex', 'planar', 'concave']),
		pSectionSeparator('index of refraction'),
		pNumber('ni', 'no-unit', 1.6, 1, 3, 0.01),
		pNumber('ne', 'no-unit', 1.0, 1, 3, 0.01),
		pSectionSeparator('Simulation'),
		pNumber('objectPx', 'mm', -40, -500, 0, 1),
		pNumber('objectPy', 'mm', 0, -500, 500, 1),
		pNumber('ray1Angle', 'degree', 0, -60, 60, 1),
		pNumber('ray2Angle', 'degree', 0, -60, 60, 1),
		pNumber('rayNb', 'rays', 3, 1, 100, 1),
		pNumber('imagePx', 'mm', 120, 0, 2000, 1),
		pDropdown('simType', ['oneRay', 'twoRays', 'parallel', 'object'])
	],
	paramSvg: {
		D1: 'lens_profile.svg',
		E1: 'lens_profile.svg',
		Dl: 'lens_profile.svg',
		Rl: 'lens_profile.svg',
		TypeL: 'lens_profile.svg',
		Dr: 'lens_profile.svg',
		Rr: 'lens_profile.svg',
		TypeR: 'lens_profile.svg',
		ni: 'lens_profile.svg',
		ne: 'lens_profile.svg',
		objectPx: 'lens_profile.svg',
		objectPy: 'lens_profile.svg',
		ray1Angle: 'lens_profile.svg',
		ray2Angle: 'lens_profile.svg',
		rayNb: 'lens_profile.svg',
		imagePx: 'lens_profile.svg',
		simType: 'lens_profile.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

//const c_simOne = 0;
//const c_simTwo = 1;
//const c_simParallel = 2;
//const c_simObject = 3;

// sub-functions
function e1plus(aRcurve: number, aDiameter: number, aType: number): number {
	let rPlus = 0; // planar case
	const delta = aDiameter * (1 - Math.sqrt(1 - (aDiameter / (2 * aRcurve)) ** 2));
	if (aType === 0) {
		// convex case
		rPlus = delta;
	} else if (aType === 2) {
		// concave case
		rPlus = -1 * delta;
	}
	return rPlus;
}

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figLensSim = figure();
	const figLens3D = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Dr2 = param.Dr / 2;
		const Dl2 = param.Dl / 2;
		const E1pL = e1plus(param.Rl, param.Dl, param.TypeL);
		const E1pR = e1plus(param.Rr, param.Dr, param.TypeR);
		const E2 = param.E1 - E1pL - E1pR;
		const E1h = param.E1 / 2;
		const D1h = param.D1 / 2;
		const x1 = -E1h + E1pL;
		const x2 = E1h - E1pR;
		//const ray1A1 = degToRad(param.ray1Angle);
		//const ray2A1 = degToRad(param.ray2Angle);
		// step-5 : checks on the parameter values
		if (param.Dr > param.D1) {
			throw `err390: Dr ${param.Dr} is larger than D1 ${param.D1}`;
		}
		if (param.Dl > param.D1) {
			throw `err393: Dl ${param.Dl} is larger than D1 ${param.D1}`;
		}
		if (E2 < 0) {
			throw `err396: E2 ${ffix(E2)} is negative because of E1pL ${ffix(E1pL)} or E1pR ${ffix(E1pR)}`;
		}
		// step-6 : any logs
		rGeome.logstr += `E2: ${ffix(E2)} mm\n`;
		rGeome.logstr += `x1: ${ffix(x1)}, x2: ${ffix(x2)} mm\n`;
		// step-7 : drawing of the figures
		// figLensSim
		function ctrHalfLens(aYS: number, aClose: boolean): Contour {
			const rCtr = contour(E1h, 0);
			if (param.TypeR !== 1) {
				rCtr.addPointA(x2, aYS * Dr2).addSegArc3((aYS * Math.PI) / 2, true);
			}
			rCtr.addSegStrokeA(x2, aYS * D1h).addSegStrokeA(x1, aYS * D1h);
			if (param.TypeL !== 1) {
				rCtr.addSegStrokeA(x1, aYS * Dl2)
					.addPointA(-E1h, 0)
					.addSegArc3((aYS * Math.PI) / 2, false);
			} else {
				rCtr.addSegStrokeA(-E1h, 0);
			}
			if (aClose) {
				rCtr.closeSegStroke();
			}
			return rCtr;
		}
		const ctrLens = ctrHalfLens(1, false);
		// second half of the lens
		if (param.TypeL !== 1) {
			ctrLens.addPointA(-E1h + E1pL, -Dl2).addSegArc3(-Math.PI / 2, true);
		}
		ctrLens.addSegStrokeA(-E1h + E1pL, -D1h).addSegStrokeA(E1h - E1pR, -D1h);
		if (param.TypeR !== 1) {
			ctrLens
				.addSegStrokeA(E1h - E1pR, -Dr2)
				.addPointA(E1h, 0)
				.addSegArc3(-Math.PI / 2, false);
		} else {
			ctrLens.addSegStrokeA(E1h, 0);
		}
		figLensSim.addMainO(ctrLens);
		// simulation
		const ctrObject = contour(param.objectPx, param.objectPy, 'green');
		ctrObject.addSegStrokeA(param.objectPx, 0);
		figLensSim.addDynamics(ctrObject);
		const ctrImage = contour(param.imagePx, -D1h, 'green');
		ctrImage.addSegStrokeA(param.imagePx, D1h);
		figLensSim.addDynamics(ctrImage);
		const axisOxLen = 1.2 * param.imagePx - param.objectPx;
		figLensSim.addVector(vector(0, axisOxLen, point(param.objectPx, 0)));
		const ctrAxisOx = contour(param.objectPx, 0, 'grey').addSegStrokeR(axisOxLen, 0);
		figLensSim.addDynamics(ctrAxisOx);
		//if (param.simType === c_simOne) {
		//	//figLensSim.addVector(
		//	//	vector(ray1A1, Math.abs(param.objectPx), point(param.objectPx, param.objectPy))
		//	//);
		//	//figLensSim.addPoint(point(param.objectPx, param.objectPy, ShapePoint.eBigSquare));
		//	//figLensSim.addLine(line(param.objectPx, param.objectPy, ray1A1));
		//	const ctrRay1 = contour(param.objectPx, param.objectPy, 'yellow');
		//	ctrRay1.addSegStrokeRP(ray1A1, Math.abs(param.objectPx));
		//	figLensSim.addDynamics(ctrRay1);
		//}
		const lens1: tLens = {
			E1: param.E1,
			Dl: param.Dl,
			Rl: param.Rl,
			TypeL: param.TypeL,
			Dr: param.Dr,
			Rr: param.Rr,
			TypeR: param.TypeR,
			ni: param.ni,
			PosX: 0
		};
		const [rays, logSim] = rayTrace(
			param.objectPx,
			param.objectPy,
			param.ray1Angle,
			param.ray2Angle,
			param.rayNb,
			param.simType,
			param.ne,
			[lens1],
			param.imagePx
		);
		for (const ray of rays) {
			figLensSim.addDynamics(ray);
		}
		rGeome.logstr += logSim;
		// figLens3D
		figLens3D.addMainO(ctrHalfLens(1, true).rotate(0, 0, Math.PI / 2));
		figLens3D.addSecond(ctrHalfLens(-1, true).rotate(0, 0, Math.PI / 2));
		// final figure list
		rGeome.fig = {
			faceLensSim: figLensSim,
			faceLens3D: figLens3D
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}`,
					face: `${designName}_faceLens3D`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'lens_x1 drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const lensX1Def: tPageDef = {
	pTitle: 'Lens_x1',
	pDescription: 'A single spherical lens',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { lensX1Def };
