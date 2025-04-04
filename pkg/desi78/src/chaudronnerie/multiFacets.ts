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
	contourCircle,
	ctrRectangle,
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
import type { Facet, tJuncs } from 'sheetfold';
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
	partName: 'multiFacets',
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
		pNumber('V1', 'mm', 20, 1, 200, 1),
		pNumber('V2', 'mm', 15, 1, 200, 1),
		pNumber('V3', 'mm', 30, 1, 200, 1),
		pNumber('V4', 'mm', 80, 1, 200, 1),
		pSectionSeparator('Thickness and fold'),
		pNumber('Th', 'mm', 10, 1, 20, 1),
		pNumber('Jangle', 'degree', 45, -120, 120, 0.1),
		pNumber('JradiusF', 'mm', 20, 1, 50, 1),
		pNumber('JradiusI', 'mm', 10, 1, 50, 1),
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
		JradiusF: 'multiFacets_overview.svg',
		JradiusI: 'multiFacets_overview.svg',
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
		const aJrF = param.JradiusF;
		const aJrI = param.JradiusI;
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
		const W16 = param.W1 / 6;
		const W426 = (param.W4 + param.W2) / 6;
		const W16b = 4 * W16 - 2 * param.E1;
		const V412 = (param.V4 - param.V1) / 2;
		const V18 = param.V1 / 8;
		const V416 = param.V4 / 16;
		// step-5 : checks on the parameter values
		if (aJrF < aJn * param.Th) {
			throw `err107: JradiusF ${aJrF} is too small compare to Th ${param.Th} and Jneutral ${param.Jneutral}`;
		}
		if (aJrI < aJn * param.Th) {
			throw `err107: JradiusI ${aJrI} is too small compare to Th ${param.Th} and Jneutral ${param.Jneutral}`;
		}
		if (aW12b < 0.001) {
			throw `err132: aW12b ${ffix(aW12b)} is negative or quasi-negative`;
		}
		if (V412 < 0.1) {
			throw `err147: V4 ${param.V4} is too small compare to V1 ${param.V1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `multiFacets: N1 ${param.N1}\n`;
		// step-7 : drawing of the figures
		// facet faC central disc
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
			jointFootList[Jfoot] = { angle: -aJa, radius: aJrF, neutral: aJn, mark: aJm };
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
		const faC = facet([ctr1, ctr2]);
		// facet faF1 foot
		const faF: Facet[] = [];
		const jointFoot2List: tJuncs = {};
		for (let idx = 0; idx < param.N1; idx++) {
			const Jfoot1 = `Jf${idx}1`;
			const Jfoot2 = `Jf${idx}2`;
			const Jfoot3 = `Jf${idx}3`;
			const Jfoot4 = `Jf${idx}4`;
			const Jfoot6 = `Jf${idx}6`;
			const Jfoot8 = `Jf${idx}8`;
			const footCtr3 = contourJ(0, 0)
				.startJunction(Jfoot1, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.W1, 0)
				.addSegStrokeR(0, param.W4)
				.startJunction(Jfoot2, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(0, param.W2)
				.addSegStrokeR(-param.W1, 0)
				.startJunction(Jfoot3, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(0, -param.W2)
				.closeSegStroke();
			const footCtr3i = contourJ(W16, W426)
				.addSegStrokeR(4 * W16, 0)
				.addSegStrokeR(0, 4 * W426)
				.addSegStrokeR(-param.E1, 0)
				.startJunction(Jfoot4, tJDir.eA, tJSide.eABRight)
				.addSegStrokeR(-W16b, 0)
				.addSegStrokeR(-param.E1, 0)
				.closeSegStroke();
			const footCtr5 = contourJ(0, 0)
				.addSegStrokeR(W16b, 0)
				.addSegStrokeR(0, 2 * W426)
				.startJunction(Jfoot4, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-W16b, 0)
				.closeSegStroke();
			const footCtr6 = contourJ(0, 0)
				.startJunction(Jfoot2, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.W2, 0)
				.addSegStrokeR(0, param.W3)
				.startJunction(Jfoot6, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-param.W2, 0)
				.closeSegStroke();
			const footCtr7 = contourJ(0, 0)
				.startJunction(Jfoot6, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.W2, 0)
				.addSegStrokeR(0, param.W3)
				.addSegStrokeR(-param.W2, 0)
				.closeSegStroke();
			const footCtr8 = contourJ(0, 0)
				.startJunction(Jfoot3, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.W2, 0)
				.addSegStrokeR(0, param.W3)
				.startJunction(Jfoot8, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-param.W2, 0)
				.closeSegStroke();
			const footCtr9 = contourJ(0, 0)
				.startJunction(Jfoot8, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.W2, 0)
				.addSegStrokeR(0, param.W3)
				.addSegStrokeR(-param.W2, 0)
				.closeSegStroke();
			jointFoot2List[Jfoot2] = { angle: -aJa, radius: aJrF, neutral: aJn, mark: aJm };
			jointFoot2List[Jfoot3] = { angle: -aJa, radius: aJrF, neutral: aJn, mark: aJm };
			jointFoot2List[Jfoot4] = { angle: 2 * aJa, radius: aJrF, neutral: aJn, mark: aJm };
			jointFoot2List[Jfoot6] = { angle: aJa, radius: aJrF, neutral: aJn, mark: aJm };
			jointFoot2List[Jfoot8] = { angle: aJa, radius: aJrF, neutral: aJn, mark: aJm };
			const rIn5 = (Math.min(W16b / 2, W426) * 2) / 3;
			const rIn7 = (Math.min(param.W2 / 2, param.W3) * 2) / 3;
			faF.push(facet([footCtr3, footCtr3i]));
			faF.push(facet([footCtr5, contourCircle(W16b / 2, W426, rIn5)]));
			faF.push(facet([footCtr6]));
			faF.push(facet([footCtr7, contourCircle(param.W2 / 2, param.W3 / 2, rIn7)]));
			faF.push(facet([footCtr8]));
			faF.push(facet([footCtr9, contourCircle(param.W2 / 2, param.W3 / 2, rIn7)]));
		}
		// facet faI intern
		const faI: Facet[] = [];
		const jointInternList: tJuncs = {};
		for (let idx = 0; idx < 2; idx++) {
			const Jintern1 = `Ji${idx + 1}1`;
			const Jintern2 = `Ji${idx + 1}2`;
			const Jintern3 = `Ji${idx + 1}3`;
			const Jintern4 = `Ji${idx + 1}4`;
			const Jintern5 = `Ji${idx + 1}5`;
			const Jintern6 = `Ji${idx + 1}6`;
			const Jintern7 = `Ji${idx + 1}7`;
			const internCtr1 = contourJ(0, 0)
				.startJunction(Jintern1, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(param.V1, 0)
				.addSegStrokeR(0, param.V2)
				.startJunction(Jintern2, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-param.V1, 0)
				.closeSegStroke();
			const internCtr2 = contourJ(0, 0)
				.startJunction(Jintern2, tJDir.eA, tJSide.eABRight)
				.addSegStrokeR(-param.V1, 0)
				.addSegStrokeR(-param.V3, param.V3)
				.startJunction(Jintern3, tJDir.eB, tJSide.eABLeft)
				.addSegStrokeR(param.V1, 0)
				.closeSegStroke();
			const internCtr3 = contourJ(0, 0)
				.startJunction(Jintern3, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.V1, 0)
				.addSegStrokeR(0, param.V4)
				.startJunction(Jintern4, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-param.V1, 0)
				.addSegStrokeR(0, -V412)
				.startJunction(Jintern5, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(0, -param.V1)
				.closeSegStroke();
			const internCtr3i = contourJ(V18, V416)
				.addSegStrokeR(V18, 0)
				.startJunction(Jintern6, tJDir.eA, tJSide.eABRight)
				.addSegStrokeR(4 * V18, 0)
				.addSegStrokeR(V18, 0)
				.addSegStrokeR(0, 14 * V416)
				.addSegStrokeR(-V18, 0)
				.startJunction(Jintern7, tJDir.eA, tJSide.eABRight)
				.addSegStrokeR(-4 * V18, 0)
				.addSegStrokeR(-V18, 0)
				.closeSegStroke();
			const internCtr4 = contourJ(0, 0)
				.startJunction(Jintern4, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.V1, 0)
				.addSegStrokeR(0, param.V2)
				.addSegStrokeR(-param.V1, 0)
				.closeSegStroke();
			const internCtr4i = ctrRectangle(
				param.V1 / 6,
				param.V2 / 6,
				(param.V1 * 2) / 3,
				(param.V2 * 2) / 3
			);
			const internCtr5 = contourJ(0, 0)
				.startJunction(Jintern5, tJDir.eB, tJSide.eABRight)
				.addSegStrokeR(param.V1, 0)
				.addSegStrokeR(0, param.V2)
				.addSegStrokeR(-param.V1, 0)
				.closeSegStroke();
			const internCtr6 = contourJ(0, 0)
				.startJunction(Jintern6, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(4 * V18, 0)
				.addSegStrokeR(0, 4 * V416)
				.addSegStrokeR(-4 * V18, 0)
				.closeSegStroke();
			const internCtr7 = contourJ(0, 0)
				.startJunction(Jintern7, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(4 * V18, 0)
				.addSegStrokeR(0, 4 * V416)
				.addSegStrokeR(-4 * V18, 0)
				.closeSegStroke();
			const rIn67 = (Math.min(2 * V18, 2 * V416) * 2) / 3;
			jointInternList[Jintern1] = { angle: 2 * aJa, radius: aJrI, neutral: aJn, mark: aJm };
			jointInternList[Jintern2] = { angle: -aJa, radius: aJrI, neutral: aJn, mark: aJm };
			jointInternList[Jintern3] = { angle: -aJa, radius: aJrI, neutral: aJn, mark: aJm };
			jointInternList[Jintern4] = { angle: 2 * aJa, radius: aJrI, neutral: aJn, mark: aJm };
			jointInternList[Jintern5] = { angle: 2 * aJa, radius: aJrI, neutral: aJn, mark: aJm };
			jointInternList[Jintern6] = { angle: 2 * aJa, radius: aJrI, neutral: aJn, mark: aJm };
			jointInternList[Jintern7] = { angle: 2 * aJa, radius: aJrI, neutral: aJn, mark: aJm };
			faI.push(facet([internCtr1]));
			faI.push(facet([internCtr2]));
			faI.push(facet([internCtr3, internCtr3i]));
			faI.push(facet([internCtr4, internCtr4i]));
			faI.push(facet([internCtr5]));
			faI.push(facet([internCtr6, contourCircle(2 * V18, 2 * V416, rIn67)]));
			faI.push(facet([internCtr7, contourCircle(2 * V18, 2 * V416, rIn67)]));
		}
		// sheetFold
		const sFold = sheetFold(
			[faC, ...faF, ...faI],
			{
				...jointFootList,
				...jointFoot2List,
				...jointInternList
			},
			[
				{
					x1: 0,
					y1: 0,
					a1: 0,
					l1: param.E2,
					ante: ['Ji11', param.V2, 'Ji12', param.V3, 'Ji13', param.V4, 'Ji14', param.V2],
					post: ['Jf11', param.W4 + param.W2, 'Jf12', param.W3, 'Jf16', param.W3]
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
