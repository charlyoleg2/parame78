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
	initGeom
	//EExtrude,
	//EBVolume
} from 'geometrix';
import {
	tJDir,
	tJSide,
	contourJ,
	facet,
	sheetFold,
	contourJ2contour,
	facet2figure
} from 'sheetfold';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'demoSheetFold',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W', 'mm', 80, 10, 200, 1),
		pNumber('L1', 'mm', 60, 10, 200, 1),
		pNumber('L2', 'mm', 35, 10, 200, 1),
		pSectionSeparator('Fold'),
		pNumber('Ja', 'degree', 60, -240, 240, 1),
		pNumber('Jr', 'mm', 10, 0, 20, 1),
		pNumber('Jn', '%', 50, 0, 100, 1),
		pSectionSeparator('Thickness'),
		pNumber('T', 'mm', 10, 1, 20, 1),
		pNumber('jMark', 'mm', 1, 0, 20, 0.1),
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
		const aJn = param.Jn / 100;
		const JRadiusI = param.Jr - param.T * aJn;
		const JRadiusE = param.Jr + param.T * (1 - aJn);
		const aJa = degToRad(param.Ja);
		const JarcN = aJa * param.Jr;
		const JarcI = aJa * JRadiusI;
		const JarcE = aJa * JRadiusE;
		// step-5 : checks on the parameter values
		if (param.L1 > param.W) {
			throw `err633: L1 ${param.L1} is bigger than W ${param.W} and nobody cares!`;
		}
		// step-6 : any logs
		rGeome.logstr += `junction: radius neutral ${ffix(param.Jr)}, intern ${ffix(JRadiusI)}, extern ${ffix(JRadiusE)}\n`;
		rGeome.logstr += `junction: neutral arc ${ffix(JarcN)}, intern arc ${ffix(JarcI)}, extern arc ${ffix(JarcE)}\n`;
		// step-7 : drawing of the figures
		// figCut
		const ctr1 = contourJ(0, 0)
			.addCornerRounded(param.R1)
			.addSegStrokeR(param.L1, 0)
			.startJunction('J1', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, param.W)
			.addSegStrokeR(-param.L1, 0)
			.addCornerRounded(param.R1)
			.closeSegStroke();
		const fa1 = facet([ctr1]);
		figCut.addMainO(contourJ2contour(ctr1));
		const ctr2 = contour(param.L1, 0)
			.addSegStrokeR(JarcN, 0)
			.addSegStrokeR(0, param.W)
			.addSegStrokeR(-JarcN, 0)
			.closeSegStroke();
		figCut.addMainO(ctr2);
		const ctr3 = contourJ(param.L1 + JarcN, 0)
			.addSegStrokeR(param.L2, param.W / 2)
			.addCornerRounded(param.R2)
			.addSegStrokeR(-param.L2, param.W / 2)
			.startJunction('J1', tJDir.eB, tJSide.eABRight)
			.closeSegStroke();
		const fa3 = facet([ctr3]);
		figCut.addMainO(contourJ2contour(ctr3));
		// sheetFold
		const sFold = sheetFold(
			[fa1, fa3],
			{
				J1: { angle: aJa, radius: param.Jr, neutral: aJn, mark: param.jMark }
			},
			[{ x1: 0, y1: 0, a1: 0, l1: param.L1, ante: [], post: ['J1', param.L2] }],
			param.T,
			rGeome.partName
		);
		// final figure list
		rGeome.fig = {
			faceCut: figCut,
			facet1: facet2figure(fa1),
			facet3: facet2figure(fa3)
		};
		const ffObj = sFold.makeFigures();
		for (const iFace of Object.keys(ffObj)) {
			rGeome.fig[iFace] = ffObj[iFace];
		}
		// step-8 : recipes of the 3D construction
		rGeome.vol = sFold.makeVolume();
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
