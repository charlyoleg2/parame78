// demoTriangule.ts
// demonstration of the Triangule library

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
	//designParam,
	//checkGeom,
	//prefixLog,
	//point,
	//Point,
	//ShapePoint,
	//line,
	//vector,
	contour,
	//contourCircle,
	//ctrRectangle,
	figure,
	degToRad,
	radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'demoTriangule',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('lAB', 'mm', 60, -200, 200, 1),
		pNumber('lBC', 'mm', 40, -200, 200, 1),
		pNumber('lAC', 'mm', 35, -200, 200, 1),
		pNumber('aCAB', 'degree', 35, -180, 180, 1),
		pNumber('aABC', 'degree', 45, -180, 180, 1),
		pNumber('aBCA', 'degree', 100, -180, 180, 1),
		pSectionSeparator('Start'),
		pNumber('Ax', 'mm', 50, -1000, 1000, 1),
		pNumber('Ay', 'mm', 50, -1000, 1000, 1),
		pNumber('aAB', 'degree', 10, -190, 190, 1),
		pSectionSeparator('Thickness'),
		pNumber('T1', 'mm', 5, 1, 20, 1)
	],
	paramSvg: {
		lAB: 'demoTriangule_triangle.svg',
		lBC: 'demoTriangule_triangle.svg',
		lAC: 'demoTriangule_triangle.svg',
		aCAB: 'demoTriangule_triangle.svg',
		aABC: 'demoTriangule_strokeAngle.svg',
		aBCA: 'demoTriangule_anglePotentialError.svg',
		Ax: 'demoTriangule_start.svg',
		Ay: 'demoTriangule_start.svg',
		aAB: 'demoTriangule_start.svg',
		T1: 'demoTriangule_triangle.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figExample1 = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const a3 = degToRad(param.a3);
		const a4 = degToRad(param.a4);
		const a5 = degToRad(param.a5);
		const sumAngles = a3 + a4 + a5;
		// step-5 : checks on the parameter values
		if (param.L2 < param.L3) {
			throw `err639: L2 ${ffix(param.L2)} is smaller than L3 ${ffix(param.L3)}}`;
		}
		// step-6 : any logs
		rGeome.logstr += `sum of angles: ${ffix(radToDeg(sumAngles))} degree`;
		// step-7 : drawing of the figures
		// figExample1
		const ctr1 = contour(0, 0)
			.addSegStrokeR(param.L2, 0)
			.addSegStrokeRP(a3, param.L3)
			.addPointAP(a4, param.L4)
			.addSegArc(param.R34, true, true)
			.addCornerRounded(param.R4)
			.addPointA(0, param.L5)
			.addSegArc3(a5, false)
			.closeSegStroke();
		figExample1.addMainO(ctr1);
		// final figure list
		rGeome.fig = {
			faceExample1: figExample1
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_example1`,
					face: `${designName}_faceExample1`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_example1`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'demoTriangule drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const demoTrianguleDef: tPageDef = {
	pTitle: 'demoTriangule',
	pDescription: 'demonstrate the Triangule library',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { demoTrianguleDef };
