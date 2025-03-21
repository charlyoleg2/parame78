// multiFacets.ts
// a shape for testing sheetfold

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
//import { triLALrL, triLLLrA } from 'triangule';
//import type { Facet, tJuncs, tHalfProfile } from 'sheetfold';
import type { tJuncs } from 'sheetfold';
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
	partName: 'sfTube',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 200, 10, 500, 1),
		pNumber('E2', 'mm', 20, 10, 500, 1),
		pNumber('N1', '', 3, 1, 8, 1),
		pSectionSeparator('Foot'),
		pNumber('W1', 'mm', 50, 1, 200, 1),
		pNumber('W2', 'mm', 50, 1, 200, 1),
		pNumber('W3', 'mm', 50, 1, 200, 1),
		pNumber('W4', 'mm', 50, 1, 200, 1),
		pNumber('E1', 'mm', 5, 1, 20, 1),
		pNumber('R1', 'mm', 5, 1, 20, 1),
		pSectionSeparator('Intern'),
		pNumber('V1', 'mm', 50, 1, 200, 1),
		pNumber('V2', 'mm', 50, 1, 200, 1),
		pNumber('V3', 'mm', 50, 1, 200, 1),
		pNumber('V4', 'mm', 50, 1, 200, 1),
		pSectionSeparator('Thickness and fold'),
		pNumber('Th', 'mm', 10, 1, 20, 1),
		pNumber('Jangle', 'degree', 60, -120, 120, 0.1),
		pNumber('Jradius', 'mm', 20, 1, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1)
	],
	paramSvg: {
		D1: 'multiFacets_overview.svg',
		E2: 'multiFacets_overview.svg',
		N1: 'multiFacets_overview.svg',
		W1: 'multiFacets_foot.svg',
		W2: 'multiFacets_foot.svg',
		W3: 'multiFacets_foot.svg',
		W4: 'multiFacets_foot.svg',
		E1: 'multiFacets_foot.svg',
		R1: 'multiFacets_foot.svg',
		V1: 'multiFacets_intern.svg',
		V2: 'multiFacets_intern.svg',
		V3: 'multiFacets_intern.svg',
		V4: 'multiFacets_intern.svg',
		Th: 'multiFacets_overview.svg',
		Jangle: 'multiFacets_overview.svg',
		Jradius: 'multiFacets_overview.svg',
		Jneutral: 'multiFacets_overview.svg',
		Jmark: 'multiFacets_overview.svg'
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
		const aJa = degToRad(param.Jangle);
		const Rd1 = param.D1 / 2;
		const Rd2 = Rd1 + param.E2;
		const V12 = param.V1 / 2;
		const V12y = Math.sqrt(Rd1 ** 2 - V12 ** 2);
		const W12 = param.W1 / 2;
		const W12x = Math.sqrt(Rd2 ** 2 - W12 ** 2);
		const aW12 = Math.asin(W12 / Rd2);
		const aW12b = Math.PI / param.N1 - aW12;
		// step-5 : checks on the parameter values
		if (aJr < aJn * param.Th) {
			throw `err107: Jradius ${aJr} is too small compare to Th ${param.Th} and Jneutral ${param.Jneutral}`;
		}
		if (aW12b < 0.001) {
			throw `err132: aW12b ${ffix(aW12b)} is negative or quasi-negative`;
		}
		// step-6 : any logs
		rGeome.logstr += `multiFacets: N1 ${param.N1}\n`;
		// step-7 : drawing of the figures
		// facet fa1
		// central disc
		const jointFootList: tJuncs = {};
		const ctr1 = contourJ(W12x, W12);
		for (let idx = 0; idx < param.N1; idx++) {
			const Jfoot = `Jf${idx}1`;
			const a1 = idx * (2 * aW12b + 2 * aW12) + aW12;
			const a2 = a1 + aW12b;
			const a3 = a2 + aW12b;
			const a4 = a3 + 2 * aW12;
			ctr1.addPointAP(a2, Rd2)
				.addPointAP(a3, Rd2)
				.addSegArc2()
				.startJunction(Jfoot, tJDir.eA, tJSide.eABLeft);
			if (idx < param.N1 - 1) {
				ctr1.addSegStrokeAP(a4, Rd2);
			} else {
				ctr1.closeSegStroke();
			}
			jointFootList[Jfoot] = { angle: aJa, radius: aJr, neutral: aJn, mark: aJm };
		}
		const ctr2 = contourJ(V12, -V12y)
			.addPointA(Rd1, 0)
			.addPointA(V12, V12y)
			.addSegArc2()
			.startJunction('Ji11', tJDir.eA, tJSide.eABRight)
			.addSegStrokeA(-V12, V12y)
			.addPointA(-Rd1, 0)
			.addPointA(-V12, -V12y)
			.addSegArc2()
			.startJunction('Ji21', tJDir.eA, tJSide.eABRight)
			.closeSegStroke();
		// foot
		const footCtr3 = contourJ(0, 0)
			.startJunction('Jf01', tJDir.eA, tJSide.eABRight)
			.addSegStrokeR(param.W1, 0)
			.addSegStrokeR(0, param.W4 - param.W2)
			.startJunction('Jf02', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, param.W2)
			.addSegStrokeR(-param.W1, 0)
			.startJunction('Jf03', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, -param.W2)
			.closeSegStroke();
		const fa1 = facet([ctr1, ctr2, footCtr3]);
		// sheetFold
		const sFold = sheetFold(
			[fa1],
			{
				...jointFootList,
				Jf02: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm },
				Jf03: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm },
				Ji11: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm },
				Ji21: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm }
			},
			[
				{ x1: 0, y1: 0, a1: 0, l1: param.W1, ante: [], post: ['Ji11', param.W1] },
				{ x1: 0, y1: 4 * param.W2, a1: 0, l1: param.V1, ante: [], post: ['Ji21', param.V1] }
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
		rGeome.logstr += 'multiFacets drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const multiFacetsDef: tPageDef = {
	pTitle: 'multiFacets',
	pDescription: 'a shape for testing sheetfold',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { multiFacetsDef };
