// sfCheck.ts
// an other shape for testing sheetfold

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
	//contour,
	//contourCircle,
	//ctrRectangle,
	//figure,
	//degToRad,
	//radToDeg,
	//pointCoord,
	//ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom
	//EExtrude,
	//EBVolume
} from 'geometrix';
//import { triLALrL, triLLLrA } from 'triangule';
//import type { Facet, tJuncs, tHalfProfile } from 'sheetfold';
//import type { Facet, tJuncs } from 'sheetfold';
import {
	//tJDir,
	//tJSide,
	contourJ,
	facet,
	//contourJ2contour,
	//facet2figure
	sheetFold
} from 'sheetfold';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'sfTube',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 200, 10, 500, 1),
		pNumber('W1', 'mm', 100, 10, 500, 1),
		pSectionSeparator('Thickness and fold'),
		pNumber('Th', 'mm', 10, 1, 20, 1),
		pNumber('Jangle', 'degree', 45, -120, 120, 0.1),
		pNumber('Jradius', 'mm', 10, 1, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1)
	],
	paramSvg: {
		L1: 'sfCheck_overview.svg',
		W1: 'sfCheck_overview.svg',
		Th: 'sfCheck_overview.svg',
		Jangle: 'sfCheck_overview.svg',
		Jradius: 'sfCheck_overview.svg',
		Jneutral: 'sfCheck_overview.svg',
		Jmark: 'sfCheck_overview.svg'
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
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const aJn = param.Jneutral / 100;
		const aJr = param.Jradius;
		//const aJm = param.Jmark;
		//const aJa = degToRad(param.Jangle);
		// step-5 : checks on the parameter values
		if (aJr < aJn * param.Th) {
			throw `err107: Jradius ${aJr} is too small compare to Th ${param.Th} and Jneutral ${param.Jneutral}`;
		}
		// step-6 : any logs
		rGeome.logstr += `sfCheck: L1 ${param.L1} W1 ${param.W1} mm\n`;
		// step-7 : drawing of the figures
		// facet fa1
		const ctr1 = contourJ(0, 0)
			.addSegStrokeR(param.L1, 0)
			.addSegStrokeR(0, param.W1)
			.addSegStrokeR(-param.L1, 0)
			.closeSegStroke();
		const fa1 = facet([ctr1]);
		// sheetFold
		const sFold = sheetFold(
			[fa1],
			{
				//J1: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm }
			},
			[
				{ x1: 0, y1: 0, a1: 0, l1: param.W1, ante: [], post: [] },
				{ x1: 0, y1: 4 * param.W1, a1: 0, l1: param.V1, ante: [], post: [] }
			],
			param.Th,
			rGeome.partName
		);
		// final figure list
		//rGeome.fig = {};
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
		rGeome.logstr += 'sfCheck drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const sfCheckDef: tPageDef = {
	pTitle: 'sfCheck',
	pDescription: 'an other shape for testing sheetfold',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { sfCheckDef };
