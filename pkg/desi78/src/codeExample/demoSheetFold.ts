// demoSheetFold.ts
// demonstration of the SheetFold library

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
	//radToDeg,
	//pointCoord,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';
//import { facet } from 'sheetfold';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'demoSheetFold',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W', 'mm', 40, 0, 200, 1),
		pNumber('L1', 'mm', 60, 0, 200, 1),
		pNumber('L2', 'mm', 35, 0, 200, 1),
		pSectionSeparator('Fold'),
		pNumber('Ja', 'degree', 60, -120, 120, 1),
		pNumber('Jr', 'mm', 10, 1, 20, 1),
		pNumber('Jn', '%', 50, 0, 100, 1),
		pSectionSeparator('Thickness'),
		pNumber('T', 'mm', 10, 1, 20, 1),
		pNumber('R1', 'mm', 10, 0, 30, 1),
		pNumber('R2', 'mm', 10, 0, 30, 1)
	],
	paramSvg: {
		W: 'demoSheetFold_cut.svg',
		L1: 'demoSheetFold_cut.svg',
		L2: 'demoSheetFold_cut.svg',
		Ja: 'demoSheetFold_cut.svg',
		Jr: 'demoSheetFold_cut.svg',
		Jn: 'demoSheetFold_cut.svg',
		T: 'demoSheetFold_cut.svg',
		R1: 'demoSheetFold_cut.svg',
		R2: 'demoSheetFold_cut.svg'
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
	const figCut = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const aJa = degToRad(param.Ja);
		const JarcN = aJa * param.Jr;
		const JarcI = aJa * (param.Jr - param.T * (param.Jn / 100));
		const JarcE = aJa * (param.Jr + param.T * ((100 - param.Jn) / 100));
		// step-5 : checks on the parameter values
		if (param.L1 < param.W) {
			throw `err633: L1 ${param.L1} is smaller than W ${param.W} and nobody cares!`;
		}
		// step-6 : any logs
		rGeome.logstr += `junction: neutral arc ${ffix(JarcN)}, intern arc ${ffix(JarcI)}, extern arc ${ffix(JarcE)}\n`;
		// step-7 : drawing of the figures
		// figCut
		const ctr1 = contour(0, 0)
			.addSegStrokeR(param.L1, 0)
			.addSegStrokeR(0, param.W)
			.addSegStrokeR(-param.L1, 0)
			.closeSegStroke();
		figCut.addMainO(ctr1);
		const ctr2 = contour(param.L1, 0)
			.addSegStrokeR(JarcN, 0)
			.addSegStrokeR(0, param.W)
			.addSegStrokeR(-JarcN, 0)
			.closeSegStroke();
		figCut.addMainO(ctr2);
		const ctr3 = contour(param.L1 + JarcN, 0)
			.addSegStrokeR(param.L2, param.W / 2)
			.addSegStrokeR(-param.L2, param.W / 2)
			.closeSegStroke();
		figCut.addMainO(ctr3);
		// final figure list
		rGeome.fig = {
			faceCut: figCut
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_cut`,
					face: `${designName}_faceCut`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_cut`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'demoSheetFold drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const demoSheetFoldDef: tPageDef = {
	pTitle: 'demoSheetFold',
	pDescription: 'demonstrate the SheetFold library',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { demoSheetFoldDef };
