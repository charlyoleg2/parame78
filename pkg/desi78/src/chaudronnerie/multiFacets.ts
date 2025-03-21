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
		pNumber('D2', 'mm', 300, 10, 500, 1),
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
		D2: 'multiFacets_overview.svg',
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
		// step-5 : checks on the parameter values
		if (aJr < aJn * param.Th) {
			throw `err107: Jradius ${aJr} is too small compare to Th ${param.Th} and Jneutral ${param.Jneutral}`;
		}
		// step-6 : any logs
		rGeome.logstr += `multiFacets: N1 ${param.N1}\n`;
		// step-7 : drawing of the figures
		// facet-loop
		const ctr1 = contourJ(0, 0)
			.addSegStrokeR(param.W1, 0)
			.startJunction('J1', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, param.W2)
			.addSegStrokeR(-param.W1, 0)
			.closeSegStroke();
		const fa1 = facet([ctr1]);
		// sheetFold
		const sFold = sheetFold(
			[fa1],
			{ J1: { angle: aJa, radius: aJr, neutral: aJn, mark: aJm } },
			[
				{ x1: 0, y1: 0, a1: 0, l1: param.W1, ante: [], post: ['J1', param.W1] },
				{ x1: 0, y1: 4 * param.W2, a1: 0, l1: param.V1, ante: [], post: ['J1', param.V1] }
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
