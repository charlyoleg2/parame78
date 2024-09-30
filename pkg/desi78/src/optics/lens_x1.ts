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
	//point,
	//Point,
	//ShapePoint,
	//vector,
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
		pNumber('ne', 'no-unit', 1.0, 1, 3, 0.01)
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
		ne: 'lens_profile.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

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
		// step-7 : drawing of the figures
		// figLensSim
		function ctrHalfLens(aYS: number, aClose: boolean): Contour {
			const rCtr = contour(E1h, 0);
			if (param.TypeR !== 1) {
				rCtr.addPointA(E1h - E1pR, aYS * Dr2).addSegArc3((aYS * Math.PI) / 2, true);
			}
			rCtr.addSegStrokeA(E1h - E1pR, aYS * D1h).addSegStrokeA(-E1h + E1pL, aYS * D1h);
			if (param.TypeL !== 1) {
				rCtr.addSegStrokeA(-E1h + E1pL, aYS * Dl2)
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
			ctrLens.addPointA(-E1h + E1pL, -Dr2).addSegArc3(-Math.PI / 2, true);
		}
		ctrLens.addSegStrokeA(-E1h + E1pL, -D1h).addSegStrokeA(E1h - E1pR, -D1h);
		if (param.TypeR !== 1) {
			ctrLens
				.addSegStrokeA(E1h - E1pR, -Dl2)
				.addPointA(E1h, 0)
				.addSegArc3(-Math.PI / 2, false);
		} else {
			ctrLens.addSegStrokeA(E1h, 0);
		}
		figLensSim.addMainO(ctrLens);
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
