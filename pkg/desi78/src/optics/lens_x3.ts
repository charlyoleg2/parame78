// lens_x3.ts
// three spherical lens

// step-1 : import from geometrix
import type {
	//Contour,
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
	//ffix,
	pNumber,
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';
//import type { tPL } from './lens_helper';
import { initPL, e1plus, checkLensParam, logLens, ctrHalfLens, otherHalfLens } from './lens_helper';
import type { tLens } from './optic_sim';
import { rayTrace } from './optic_sim';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'lens_x3',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('ne', 'no-unit', 1.0, 1, 3, 0.01),
		pSectionSeparator('First lens'),
		pNumber('l1ni', 'no-unit', 1.6, 1, 3, 0.01),
		pNumber('l1D1', 'mm', 40, 1, 500, 1),
		pNumber('l1E1', 'mm', 8, 0.5, 200, 0.5),
		pNumber('l1Dl', 'mm', 30, 1, 500, 1),
		pNumber('l1Rl', 'mm', 35, 1, 5000, 0.1),
		pDropdown('l1TypeL', ['convex', 'planar', 'concave']),
		pNumber('l1Dr', 'mm', 30, 1, 500, 1),
		pNumber('l1Rr', 'mm', 50, 1, 5000, 0.1),
		pDropdown('l1TypeR', ['convex', 'planar', 'concave']),
		pSectionSeparator('Second lens'),
		pCheckbox('l2Active', true),
		pNumber('l2ni', 'no-unit', 1.6, 1, 3, 0.01),
		pNumber('l2D1', 'mm', 40, 1, 500, 1),
		pNumber('l2E1', 'mm', 8, 0.5, 200, 0.5),
		pNumber('l2Dl', 'mm', 30, 1, 500, 1),
		pNumber('l2Rl', 'mm', 35, 1, 5000, 0.1),
		pDropdown('l2TypeL', ['convex', 'planar', 'concave']),
		pNumber('l2Dr', 'mm', 30, 1, 500, 1),
		pNumber('l2Rr', 'mm', 50, 1, 5000, 0.1),
		pDropdown('l2TypeR', ['convex', 'planar', 'concave']),
		pNumber('l2Px', 'mm', 40, 0, 500, 1),
		pSectionSeparator('Third lens'),
		pCheckbox('l3Active', true),
		pNumber('l3ni', 'no-unit', 1.6, 1, 3, 0.01),
		pNumber('l3D1', 'mm', 40, 1, 500, 1),
		pNumber('l3E1', 'mm', 8, 0.5, 200, 0.5),
		pNumber('l3Dl', 'mm', 30, 1, 500, 1),
		pNumber('l3Rl', 'mm', 35, 1, 5000, 0.1),
		pDropdown('l3TypeL', ['convex', 'planar', 'concave']),
		pNumber('l3Dr', 'mm', 30, 1, 500, 1),
		pNumber('l3Rr', 'mm', 50, 1, 5000, 0.1),
		pDropdown('l3TypeR', ['convex', 'planar', 'concave']),
		pNumber('l3Px', 'mm', 80, 0, 500, 1),
		pSectionSeparator('Simulation'),
		pNumber('objectPx', 'mm', -50, -500, 0, 1),
		pNumber('objectPy', 'mm', 8, -500, 500, 1),
		pNumber('ray1Angle', 'degree', 0, -60, 60, 1),
		pNumber('ray2Angle', 'degree', -2, -60, 60, 1),
		pNumber('rayNb', 'rays', 3, 1, 100, 1),
		pNumber('imagePx', 'mm', 140, 0, 2000, 1),
		pDropdown('simType', ['oneRay', 'twoRays', 'parallel', 'object'])
	],
	paramSvg: {
		ne: 'lens_profile.svg',
		l1ni: 'lens_profile.svg',
		l1D1: 'lens_profile.svg',
		l1E1: 'lens_profile.svg',
		l1Dl: 'lens_profile.svg',
		l1Rl: 'lens_profile.svg',
		l1TypeL: 'lens_profile.svg',
		l1Dr: 'lens_profile.svg',
		l1Rr: 'lens_profile.svg',
		l1TypeR: 'lens_profile.svg',
		l2Active: 'lens_profile.svg',
		l2ni: 'lens_profile.svg',
		l2D1: 'lens_profile.svg',
		l2E1: 'lens_profile.svg',
		l2Dl: 'lens_profile.svg',
		l2Rl: 'lens_profile.svg',
		l2TypeL: 'lens_profile.svg',
		l2Dr: 'lens_profile.svg',
		l2Rr: 'lens_profile.svg',
		l2TypeR: 'lens_profile.svg',
		l2Px: 'lens_profile.svg',
		l3Active: 'lens_profile.svg',
		l3ni: 'lens_profile.svg',
		l3D1: 'lens_profile.svg',
		l3E1: 'lens_profile.svg',
		l3Dl: 'lens_profile.svg',
		l3Rl: 'lens_profile.svg',
		l3TypeL: 'lens_profile.svg',
		l3Dr: 'lens_profile.svg',
		l3Rr: 'lens_profile.svg',
		l3TypeR: 'lens_profile.svg',
		l3Px: 'lens_profile.svg',
		objectPx: 'lens_simOneRay.svg',
		objectPy: 'lens_simOneRay.svg',
		ray1Angle: 'lens_simOneRay.svg',
		ray2Angle: 'lens_simTwoRays.svg',
		rayNb: 'lens_simParallel.svg',
		imagePx: 'lens_simOneRay.svg',
		simType: 'lens_simObject.svg'
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

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figLensSim = figure();
	const figLens1 = figure();
	const figLens2 = figure();
	const figLens3 = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pl1 = initPL();
		pl1.D1 = param.l1D1;
		pl1.E1 = param.l1E1;
		pl1.Rl = param.l1Rl;
		pl1.Dl = param.l1Dl;
		pl1.TypeL = param.l1TypeL;
		pl1.Rr = param.l1Rr;
		pl1.Dr = param.l1Dr;
		pl1.TypeR = param.l1TypeR;
		pl1.Drh = pl1.Dr / 2;
		pl1.Dlh = pl1.Dl / 2;
		pl1.E1pL = e1plus(pl1.Rl, pl1.Dl, pl1.TypeL);
		pl1.E1pR = e1plus(pl1.Rr, pl1.Dr, pl1.TypeR);
		pl1.E2 = pl1.E1 - pl1.E1pL - pl1.E1pR;
		pl1.E1h = pl1.E1 / 2;
		pl1.D1h = pl1.D1 / 2;
		pl1.x1 = -pl1.E1h + pl1.E1pL;
		pl1.x2 = pl1.E1h - pl1.E1pR;
		const pl2 = initPL();
		pl2.D1 = param.l2D1;
		pl2.E1 = param.l2E1;
		pl2.Rl = param.l2Rl;
		pl2.Dl = param.l2Dl;
		pl2.TypeL = param.l2TypeL;
		pl2.Rr = param.l2Rr;
		pl2.Dr = param.l2Dr;
		pl2.TypeR = param.l2TypeR;
		pl2.Drh = pl2.Dr / 2;
		pl2.Dlh = pl2.Dl / 2;
		pl2.E1pL = e1plus(pl2.Rl, pl2.Dl, pl2.TypeL);
		pl2.E1pR = e1plus(pl2.Rr, pl2.Dr, pl2.TypeR);
		pl2.E2 = pl2.E1 - pl2.E1pL - pl2.E1pR;
		pl2.E1h = pl2.E1 / 2;
		pl2.D1h = pl2.D1 / 2;
		pl2.x1 = -pl2.E1h + pl2.E1pL;
		pl2.x2 = pl2.E1h - pl2.E1pR;
		const pl3 = initPL();
		pl3.D1 = param.l3D1;
		pl3.E1 = param.l3E1;
		pl3.Rl = param.l3Rl;
		pl3.Dl = param.l3Dl;
		pl3.TypeL = param.l3TypeL;
		pl3.Rr = param.l3Rr;
		pl3.Dr = param.l3Dr;
		pl3.TypeR = param.l3TypeR;
		pl3.Drh = pl3.Dr / 2;
		pl3.Dlh = pl3.Dl / 2;
		pl3.E1pL = e1plus(pl3.Rl, pl3.Dl, pl3.TypeL);
		pl3.E1pR = e1plus(pl3.Rr, pl3.Dr, pl3.TypeR);
		pl3.E2 = pl3.E1 - pl3.E1pL - pl3.E1pR;
		pl3.E1h = pl3.E1 / 2;
		pl3.D1h = pl3.D1 / 2;
		pl3.x1 = -pl3.E1h + pl3.E1pL;
		pl3.x2 = pl3.E1h - pl3.E1pR;
		// step-5 : checks on the parameter values
		checkLensParam(pl1, 'lens-1');
		checkLensParam(pl2, 'lens-2');
		checkLensParam(pl3, 'lens-3');
		// step-6 : any logs
		rGeome.logstr += logLens(pl1, 'lens-1');
		rGeome.logstr += logLens(pl2, 'lens-2');
		rGeome.logstr += logLens(pl3, 'lens-3');
		// step-7 : drawing of the figures
		// figLensSim
		const ctrLens1 = ctrHalfLens(pl1, 0, 1, false);
		otherHalfLens(ctrLens1, pl1, 0);
		figLensSim.addMainO(ctrLens1);
		const ctrLens2 = ctrHalfLens(pl2, param.l2Px, 1, false);
		otherHalfLens(ctrLens2, pl2, param.l2Px);
		if (param.l2Active) {
			figLensSim.addMainO(ctrLens2);
		} else {
			figLensSim.addSecond(ctrLens2);
		}
		const ctrLens3 = ctrHalfLens(pl3, param.l3Px, 1, false);
		otherHalfLens(ctrLens3, pl3, param.l3Px);
		if (param.l3Active) {
			figLensSim.addMainO(ctrLens3);
		} else {
			figLensSim.addSecond(ctrLens3);
		}
		// simulation
		const ctrObject = contour(param.objectPx, param.objectPy, 'green');
		ctrObject.addSegStrokeA(param.objectPx, 0);
		figLensSim.addDynamics(ctrObject);
		const ctrImage = contour(param.imagePx, -pl1.D1h, 'green');
		ctrImage.addSegStrokeA(param.imagePx, pl1.D1h);
		figLensSim.addDynamics(ctrImage);
		const axisOxLen = 1.2 * param.imagePx - param.objectPx;
		figLensSim.addVector(vector(0, axisOxLen, point(param.objectPx, 0)));
		const ctrAxisOx = contour(param.objectPx, 0, 'grey').addSegStrokeR(axisOxLen, 0);
		figLensSim.addDynamics(ctrAxisOx);
		const lens1: tLens = {
			E1: pl1.E1,
			Dl: pl1.Dl,
			Rl: pl1.Rl,
			TypeL: pl1.TypeL,
			Dr: pl1.Dr,
			Rr: pl1.Rr,
			TypeR: pl1.TypeR,
			ni: param.l1ni,
			PosX: 0
		};
		const lens2: tLens = {
			E1: pl2.E1,
			Dl: pl2.Dl,
			Rl: pl2.Rl,
			TypeL: pl2.TypeL,
			Dr: pl2.Dr,
			Rr: pl2.Rr,
			TypeR: pl2.TypeR,
			ni: param.l2ni,
			PosX: param.l2Px
		};
		const lens3: tLens = {
			E1: pl3.E1,
			Dl: pl3.Dl,
			Rl: pl3.Rl,
			TypeL: pl3.TypeL,
			Dr: pl3.Dr,
			Rr: pl3.Rr,
			TypeR: pl3.TypeR,
			ni: param.l3ni,
			PosX: param.l3Px
		};
		const lensList = [lens1];
		if (param.l2Active) {
			lensList.push(lens2);
		}
		if (param.l3Active) {
			lensList.push(lens3);
		}
		const [rays, logSim] = rayTrace(
			param.objectPx,
			param.objectPy,
			param.ray1Angle,
			param.ray2Angle,
			param.rayNb,
			param.simType,
			param.ne,
			lensList,
			param.imagePx
		);
		for (const ray of rays) {
			figLensSim.addDynamics(ray);
		}
		rGeome.logstr += logSim;
		// figLens1
		figLens1.addMainO(ctrHalfLens(pl1, 0, 1, true).rotate(0, 0, Math.PI / 2));
		figLens1.addSecond(ctrHalfLens(pl1, 0, -1, true).rotate(0, 0, Math.PI / 2));
		// figLens2
		figLens2.addMainO(ctrHalfLens(pl2, 0, 1, true).rotate(0, 0, Math.PI / 2));
		figLens2.addSecond(ctrHalfLens(pl2, 0, -1, true).rotate(0, 0, Math.PI / 2));
		// figLens3
		figLens3.addMainO(ctrHalfLens(pl3, 0, 1, true).rotate(0, 0, Math.PI / 2));
		figLens3.addSecond(ctrHalfLens(pl3, 0, -1, true).rotate(0, 0, Math.PI / 2));
		// final figure list
		rGeome.fig = {
			faceLensSim: figLensSim,
			faceLens1: figLens1,
			faceLens2: figLens2,
			faceLens3: figLens3
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_lens1`,
					face: `${designName}_faceLens1`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_lens2`,
					face: `${designName}_faceLens2`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, param.l2Px]
				},
				{
					outName: `subpax_${designName}_lens3`,
					face: `${designName}_faceLens3`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, param.l3Px]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_lens1`,
						`subpax_${designName}_lens2`,
						`subpax_${designName}_lens3`
					]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'lens_x3 drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const lensX3Def: tPageDef = {
	pTitle: 'Lens_x3',
	pDescription: 'Three spherical lens',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { lensX3Def };
