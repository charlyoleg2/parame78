// armEnd.ts
// the extremity of a robot arm

// step-1 : import from geometrix
import type {
	//Contour,
	tContour,
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
	//degToRad,
	//radToDeg,
	//pointCoord,
	ffix,
	pNumber,
	pCheckbox,
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
	//facet2figure,
	sheetFold
} from 'sheetfold';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'armEnd',
	params: [
		//pNumber(name, unit, init, min, max, step)
		//pNumber('W1A', 'mm', 50, 1, 500, 1),
		//pNumber('W1B', 'mm', 50, 1, 500, 1),
		pNumber('W2A', 'mm', 60, 1, 500, 1),
		pNumber('W2B', 'mm', 60, 1, 500, 1),
		pCheckbox('eqWAB', true),
		pSectionSeparator('Face'),
		pNumber('L1', 'mm', 50, 1, 500, 1),
		pNumber('L2', 'mm', 50, 1, 500, 1),
		pNumber('D1', 'mm', 20, 1, 200, 1),
		pNumber('S1', 'mm', 10, 1, 200, 1),
		pSectionSeparator('Hollow'),
		pNumber('D2', 'mm', 10, 0, 200, 1),
		pNumber('D3A', 'mm', 30, 0, 200, 1),
		pNumber('D3B', 'mm', 30, 0, 200, 1),
		pSectionSeparator('Thickness and corners'),
		pNumber('T1', 'mm', 3, 0.5, 10, 0.25),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1),
		pNumber('Jradius', 'mm', 5, 0, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1)
	],
	paramSvg: {
		W2A: 'armEnd_section.svg',
		W2B: 'armEnd_section.svg',
		eqWAB: 'armEnd_section.svg',
		L1: 'armEnd_face.svg',
		L2: 'armEnd_face.svg',
		D1: 'armEnd_face.svg',
		S1: 'armEnd_face.svg',
		D2: 'armEnd_face.svg',
		D3A: 'armEnd_face.svg',
		D3B: 'armEnd_side.svg',
		T1: 'armEnd_section.svg',
		Jmark: 'armEnd_section.svg',
		Jradius: 'armEnd_section.svg',
		Jneutral: 'armEnd_section.svg'
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
		const R1 = param.D1;
		const R2 = param.D2;
		const R3A = param.D3A / 2;
		let R3B = param.D3B / 2;
		const JRext = param.Jradius + param.T1 * (1 - aJn);
		const W1A = param.W2A - 2 * JRext;
		let W1B = param.W2B - 2 * JRext;
		if (param.eqWAB) {
			R3B = R3A;
			W1B = W1A;
		}
		const aCorner = Math.PI / 2;
		// step-5 : checks on the parameter values
		if (W1A < param.D3A) {
			throw `err118: W1A ${W1A} too small compare to D3A ${param.D3A}`;
		}
		if (W1B < param.D3B) {
			throw `err121: W1B ${W1B} too small compare to D3B ${param.D3B}`;
		}
		if (param.L2 < R1 + 2 * R2) {
			throw `err124: L2 ${param.L2} too small compare to D1 ${param.D1} and D2 ${param.D2}`;
		}
		// step-6 : any logs
		rGeome.logstr += `W1A ${ffix(W1A)}, W1B ${ffix(W1B)}\n`;
		// step-7 : drawing of the figures
		// facets
		// facet fa1
		const ctr1 = contourJ(0, 0)
			.addSegStrokeR(W1A, 0)
			.startJunction('J1', tJDir.eA, tJSide.eABLeft)
			.addSegStrokeR(0, param.L1)
			.addSegStrokeR(-W1A, 0)
			.closeSegStroke();
		const hollow1A: tContour[] = [];
		if (R3A > 0) {
			hollow1A.push(contourCircle(W1A / 2, param.L1 / 2, R3A));
		}
		const fa1 = facet([ctr1, ...hollow1A]);
		// facet fa2
		const ctr2 = contourJ(0, 0)
			.addSegStrokeR(W1B, 0)
			.addSegStrokeR(0, param.L1)
			.addSegStrokeR(-W1B, 0)
			.startJunction('J1', tJDir.eB, tJSide.eABRight)
			.closeSegStroke();
		const hollow1B: tContour[] = [];
		if (R3B > 0) {
			hollow1B.push(contourCircle(W1B / 2, param.L1 / 2, R3B));
		}
		const fa2 = facet([ctr2, ...hollow1B]);
		// sheetFold
		const sFold = sheetFold(
			[fa1, fa2],
			{
				J1: {
					angle: aCorner,
					radius: param.Jradius,
					neutral: aJn,
					mark: param.Jmark
				}
			},
			[{ x1: 0, y1: 0, a1: 0, l1: W1A, ante: [], post: ['J1', W1B] }],
			param.T1,
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
		rGeome.logstr += 'armEnd drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const armEndDef: tPageDef = {
	pTitle: 'armEnd',
	pDescription: 'robotic arm extremity',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { armEndDef };
