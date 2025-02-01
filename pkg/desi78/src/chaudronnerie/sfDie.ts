// sfDie.ts
// a die (a.k.a. dice) made out metal sheet

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
	contourCircle,
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

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'sfDie',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 200, 10, 500, 1),
		pNumber('J1', 'degree', 90, -200, 200, 1),
		pNumber('J5', 'degree', 90, -200, 200, 1),
		pNumber('D1', 'mm', 50, 1, 100, 1),
		pSectionSeparator('Thickness and fold'),
		pNumber('Th', 'mm', 10, 1, 20, 1),
		pNumber('Jradius', 'mm', 20, 1, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1)
	],
	paramSvg: {
		W1: 'sfDie_pattern.svg',
		J1: 'sfDie_pattern.svg',
		J5: 'sfDie_pattern.svg',
		D1: 'sfDie_pattern.svg',
		Th: 'sfDie_pattern.svg',
		Jradius: 'sfDie_pattern.svg',
		Jneutral: 'sfDie_pattern.svg',
		Jmark: 'sfDie_pattern.svg'
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
		const w1d2 = param.W1 / 2;
		const w1d3 = param.W1 / 3;
		const w1d4 = param.W1 / 4;
		const r1 = param.D1 / 2;
		// step-5 : checks on the parameter values
		if (aJr < param.Th) {
			throw `err107: Jradius ${aJr} is smaller than Th ${param.Th}`;
		}
		if (3 * param.D1 > param.W1) {
			throw `err108: D1 ${param.D1} is too large compare to W1 ${param.W1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `junction: radius neutral ${ffix(aJr)}, intern ${ffix(JRadiusI)}, extern ${ffix(JRadiusE)}\n`;
		// step-7 : drawing of the figures
		// facet1
		const ctr1 = contourJ(0, 0)
			.startJunction('J1', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(param.W1, 0)
			.startJunction('J2', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, param.W1)
			.startJunction('J3', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(-param.W1, 0)
			.startJunction('J4', tJDir.eA, tJSide.eABLeft)
			.closeSegStroke();
		const c1h1 = contourCircle(w1d2, w1d2, r1);
		const fa1 = facet([ctr1, c1h1]);
		// facet2
		const ctr2 = contourJ(0, 0)
			.addSegStrokeR(param.W1, 0)
			.startJunction('J5', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, param.W1)
			.addSegStrokeR(-param.W1, 0)
			.startJunction('J2', tJDir.eB, tJSide.eABRight)
			.closeSegStroke();
		const c2h1 = contourCircle(w1d3, w1d3, r1);
		const c2h2 = contourCircle(2 * w1d3, 2 * w1d3, r1);
		const fa2 = facet([ctr2, c2h1, c2h2]);
		// facet3
		const ctr3 = contourJ(0, 0)
			.addSegStrokeR(param.W1, 0)
			.addSegStrokeR(0, param.W1)
			.startJunction('J1', tJDir.eB, tJSide.eABRight)
			.addSegStrokeR(-param.W1, 0)
			.closeSegStroke();
		const c3h1 = contourCircle(w1d4, w1d4, r1);
		const c3h2 = contourCircle(w1d2, w1d2, r1);
		const c3h3 = contourCircle(3 * w1d4, 3 * w1d4, r1);
		const fa3 = facet([ctr3, c3h1, c3h2, c3h3]);
		// facet4
		const ctr4 = contourJ(0, 0)
			.startJunction('J3', tJDir.eB, tJSide.eABRight)
			.addSegStrokeR(param.W1, 0)
			.addSegStrokeR(0, param.W1)
			.addSegStrokeR(-param.W1, 0)
			.closeSegStroke();
		const fa4 = facet([ctr4]);
		// facet5
		const ctr5 = contourJ(0, 0)
			.addSegStrokeR(param.W1, 0)
			.startJunction('J4', tJDir.eB, tJSide.eABRight)
			.addSegStrokeR(0, param.W1)
			.addSegStrokeR(-param.W1, 0)
			.closeSegStroke();
		const fa5 = facet([ctr5]);
		// facet6
		const ctr6 = contourJ(0, 0)
			.addSegStrokeR(param.W1, 0)
			.startJunction('J5', tJDir.eB, tJSide.eABRight)
			.addSegStrokeR(0, param.W1)
			.addSegStrokeR(-param.W1, 0)
			.closeSegStroke();
		const fa6 = facet([ctr6]);
		// sheetFold
		const sFold = sheetFold(
			[fa1, fa2, fa3, fa4, fa5, fa6],
			{
				J1: { angle: degToRad(param.J1), radius: aJr, neutral: aJn, mark: aJm },
				J2: { angle: degToRad(param.J1), radius: aJr, neutral: aJn, mark: aJm },
				J3: { angle: degToRad(param.J1), radius: aJr, neutral: aJn, mark: aJm },
				J4: { angle: degToRad(param.J1), radius: aJr, neutral: aJn, mark: aJm },
				J5: { angle: degToRad(param.J5), radius: aJr, neutral: aJn, mark: aJm }
			},
			param.Th,
			rGeome.partName
		);
		// final figure list
		rGeome.fig = {
			facePattern: sFold.makePatternFigure()
		};
		const ffObj = sFold.makeFacetFigures();
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
		rGeome.logstr += 'sfDie drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const sfDieDef: tPageDef = {
	pTitle: 'sfDie',
	pDescription: 'a die (or dice) made out metal sheet',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { sfDieDef };
