// sfTube.ts
// a conic tube made out metal sheet

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
	radToDeg,
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
	partName: 'sfTube',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 2000, 100, 10000, 1),
		pNumber('W1', 'mm', 100, 1, 500, 1),
		pNumber('W2', 'mm', 200, 1, 500, 1),
		pNumber('Jangle', 'degree', 120, 90, 180, 0.1),
		pNumber('N1', 'facet', 6, 1, 200, 1),
		pSectionSeparator('Thickness and fold'),
		pNumber('Th', 'mm', 10, 1, 20, 1),
		pNumber('Jradius', 'mm', 20, 1, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1)
	],
	paramSvg: {
		L1: 'sfTube_pattern.svg',
		W1: 'sfTube_pattern.svg',
		W2: 'sfTube_pattern.svg',
		Jangle: 'sfTube_pattern.svg',
		N1: 'sfTube_pattern.svg',
		Th: 'sfTube_pattern.svg',
		Jradius: 'sfTube_pattern.svg',
		Jneutral: 'sfTube_pattern.svg',
		Jmark: 'sfTube_pattern.svg'
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
		const W12 = (param.W2 - param.W1) / 2;
		const a1 = Math.acos(W12 / param.L1);
		const h1 = Math.sqrt(param.L1 ** 2 - W12 ** 2);
		// step-5 : checks on the parameter values
		if (aJr < aJn * param.Th) {
			throw `err107: Jradius ${aJr} is too small compare to Th ${param.Th} and Jneutral ${param.Jneutral}`;
		}
		if (param.W2 < param.W1) {
			throw `err109: W2 ${param.W2} is smaller than W1 ${param.W1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Trapeze: a1 ${ffix(radToDeg(a1))} degree, h1 ${ffix(h1)} mm\n`;
		// step-7 : drawing of the figures
		// facet1
		const ctr1 = contourJ(-param.W2 / 2, 0)
			.addSegStrokeR(param.W2, 0)
			.startJunction('J1', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(-W12, h1)
			.addSegStrokeR(-param.W1, 0)
			.closeSegStroke();
		const fa1 = facet([ctr1]);
		// sheetFold
		const half1 = ['J1', param.W1];
		const half2 = ['J1', param.W1];
		const sFold = sheetFold(
			[fa1],
			{
				J1: { angle: degToRad(param.Jangle), radius: aJr, neutral: aJn, mark: aJm }
			},
			[
				{ x1: 0, y1: 0, a1: 0, l1: param.W1, ante: half1, post: half1 },
				{ x1: 0, y1: 1.5 * param.W1, a1: 0, l1: param.W1, ante: half1, post: half2 }
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
		rGeome.logstr += 'sfTube drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const sfTubeDef: tPageDef = {
	pTitle: 'sfTube',
	pDescription: 'a conic tube made out metal sheet',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { sfTubeDef };
