// demoSheetFold2.ts
// demonstration of SheetFold with multiple stages

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
	//contourJ2contour,
	//facet2figure
	sheetFold
} from 'sheetfold';
import { triLALrL } from 'triangule';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'demoSheetFold2',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 100, 10, 300, 1),
		pNumber('W1', 'mm', 200, 10, 500, 1),
		pNumber('J1', 'degree', 60, -200, 200, 1),
		pNumber('L2', 'mm', 100, 10, 300, 1),
		pNumber('A2', 'degree', 60, 1, 179, 1),
		pNumber('J2', 'degree', 60, -200, 200, 1),
		pNumber('L3', 'mm', 100, 10, 300, 1),
		pNumber('A3', 'degree', 60, 1, 179, 1),
		pNumber('J3', 'degree', 60, -200, 200, 1),
		pNumber('L4', 'mm', 100, 10, 300, 1),
		pNumber('A4', 'degree', 60, 1, 179, 1),
		pNumber('J4', 'degree', 60, -200, 200, 1),
		pNumber('W5', 'mm', 100, 10, 300, 1),
		pSectionSeparator('Thickness and fold'),
		pNumber('Th', 'mm', 10, 1, 20, 1),
		pNumber('Jradius', 'mm', 20, 1, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1)
	],
	paramSvg: {
		L1: 'demoSF2_patron.svg',
		W1: 'demoSF2_patron.svg',
		J1: 'demoSF2_patron.svg',
		L2: 'demoSF2_patron.svg',
		A2: 'demoSF2_patron.svg',
		J2: 'demoSF2_patron.svg',
		L3: 'demoSF2_patron.svg',
		A3: 'demoSF2_patron.svg',
		J3: 'demoSF2_patron.svg',
		L4: 'demoSF2_patron.svg',
		A4: 'demoSF2_patron.svg',
		J4: 'demoSF2_patron.svg',
		W5: 'demoSF2_patron.svg',
		Th: 'demoSF2_patron.svg',
		Jradius: 'demoSF2_patron.svg',
		Jneutral: 'demoSF2_patron.svg',
		Jmark: 'demoSF2_patron.svg'
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
		const aJm = param.Jmark;
		const JRadiusI = aJr - param.Th * aJn;
		const JRadiusE = aJr + param.Th * (1 - aJn);
		// step-5 : checks on the parameter values
		if (aJr < param.Th) {
			throw `err107: Jradius ${aJr} is smaller than Th ${param.Th}`;
		}
		// step-6 : any logs
		rGeome.logstr += `junction: radius neutral ${ffix(aJr)}, intern ${ffix(JRadiusI)}, extern ${ffix(JRadiusE)}\n`;
		// step-7 : drawing of the figures
		// facet1
		const ctr1 = contourJ(0, 0)
			.addSegStrokeR(param.W1, 0)
			.startJunction('J1', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, param.L1)
			.addSegStrokeR(-param.W1, 0)
			.closeSegStroke();
		const fa1 = facet([ctr1]);
		// facet2
		const ctr2 = contourJ(0, 0)
			.startJunction('J1', tJDir.eB, tJSide.eABRight)
			.addSegStrokeA(param.L1, 0)
			.addSegStrokeAP(degToRad(param.A2), param.L2)
			.startJunction('J2', tJDir.eB, tJSide.eABRight)
			.closeSegStroke();
		const fa2 = facet([ctr2]);
		// facet3
		const ctr3 = contourJ(0, 0)
			.startJunction('J3', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeA(param.L3, 0)
			.addSegStrokeAP(degToRad(param.A3), param.L2)
			.startJunction('J2', tJDir.eA, tJSide.eABLeft)
			.closeSegStroke();
		const fa3 = facet([ctr3]);
		// facet4
		const ctr4 = contourJ(0, 0)
			.startJunction('J3', tJDir.eB, tJSide.eABRight)
			.addSegStrokeA(param.L3, 0)
			.addSegStrokeAP(degToRad(param.A4), param.L4)
			.startJunction('J4', tJDir.eA, tJSide.eABLeft)
			.closeSegStroke();
		const fa4 = facet([ctr4]);
		// facet5
		const ctr5 = contourJ(0, 0)
			.addSegStrokeR(param.W5, 0)
			.addSegStrokeR(0, param.L4)
			.addSegStrokeR(-param.W5, 0)
			.startJunction('J4', tJDir.eB, tJSide.eABRight)
			.closeSegStroke();
		const fa5 = facet([ctr5]);
		// sheetFold
		const [l12, log12] = triLALrL(param.L1, degToRad(param.A2), param.L2);
		const [l23, log23] = triLALrL(param.L2, degToRad(param.A3), param.L3);
		const [l34, log34] = triLALrL(param.L3, degToRad(param.A4), param.L4);
		rGeome.logstr += log12 + log23 + log34;
		const sFold = sheetFold(
			[fa1, fa2, fa3, fa4, fa5],
			{
				J1: { angle: degToRad(param.J1), radius: aJr, neutral: aJn, mark: aJm },
				J2: { angle: degToRad(param.J2), radius: aJr, neutral: aJn, mark: aJm },
				J3: { angle: degToRad(param.J3), radius: aJr, neutral: aJn, mark: aJm },
				J4: { angle: degToRad(param.J4), radius: aJr, neutral: aJn, mark: aJm }
			},
			[
				{
					x1: 0,
					y1: 0,
					a1: 0,
					l1: param.W1,
					ante: [],
					post: ['J1', l12, 'J2', 1, 'J3', l34, 'J4', param.W5]
				},
				{
					x1: 0,
					y1: 4 * param.L1,
					a1: 0,
					l1: param.W1,
					ante: [],
					post: ['J1', 1, 'J2', l23, 'J3', 1, 'J4', param.W5]
				}
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
		rGeome.logstr += 'demoSheetFold2 drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const demoSheetFoldDef2: tPageDef = {
	pTitle: 'demoSheetFold2',
	pDescription: 'demonstrate SheetFold with multiple stages',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { demoSheetFoldDef2 };
