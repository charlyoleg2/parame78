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
	//degToRad,
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
import { triLALrL, triLLLrA } from 'triangule';
import type { Facet, tJuncs, tHalfProfile } from 'sheetfold';
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
		pNumber('H1', 'mm', 2000, 100, 10000, 1),
		pNumber('D1', 'mm', 200, 1, 2000, 1),
		pNumber('D2', 'mm', 500, 1, 5000, 1),
		//pNumber('Jangle', 'degree', 120, 60, 180, 0.1),
		pNumber('N1', 'facet', 6, 3, 200, 1),
		pSectionSeparator('Thickness and fold'),
		pNumber('Th', 'mm', 10, 1, 20, 1),
		pNumber('Jradius', 'mm', 20, 1, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1)
	],
	paramSvg: {
		H1: 'sfTube_top.svg',
		D1: 'sfTube_top.svg',
		D2: 'sfTube_top.svg',
		//Jangle: 'sfTube_pattern.svg',
		N1: 'sfTube_pattern.svg',
		Th: 'sfTube_top.svg',
		Jradius: 'sfTube_pattern.svg',
		Jneutral: 'sfTube_top.svg',
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
		//const aJa = degToRad(param.Jangle);
		const CAB = (2 * Math.PI) / param.N1;
		const CAB2 = Math.PI - CAB;
		const R1 = param.D1 / 2;
		const R2 = param.D2 / 2;
		if (R2 < R1) {
			throw `err109: D2 ${param.D2} is smaller than D1 ${param.D1}`;
		}
		const aTilt1 = Math.atan2(param.H1, R2 - R1);
		const aTilt2 = Math.atan2(param.H1, (R2 - R1) * Math.cos(CAB / 2));
		const W1 = R1 * 2 * Math.sin(CAB / 2);
		const W2 = R2 * 2 * Math.sin(CAB / 2);
		const W12 = (W2 - W1) / 2;
		const L1 = param.H1 / Math.sin(aTilt1);
		const CAD = Math.acos(W12 / L1);
		const CD = W2 * Math.sin(CAD);
		const [BC, str1] = triLALrL(W2, CAB2, W2);
		const [CDB, str2] = triLLLrA(CD, BC, CD);
		const a1 = CAD;
		const aJa = Math.PI - CDB;
		const GF = aJr / Math.tan(aJa / 2);
		const GA = GF / Math.sin(a1);
		const TW2 = W2 - 2 * GA;
		const TW1 = W1 - 2 * GA;
		const T1 = Math.sqrt(L1 ** 2 - W12 ** 2);
		// step-5 : checks on the parameter values
		if (aJr < aJn * param.Th) {
			throw `err107: Jradius ${aJr} is too small compare to Th ${param.Th} and Jneutral ${param.Jneutral}`;
		}
		if (TW1 < 0.01) {
			throw `err126: TW1 ${ffix(TW1)} is negative or too close to zero`;
		}
		// step-6 : any logs
		rGeome.logstr += str1 + str2;
		rGeome.logstr += `Cone tilt: Tilt1 ${ffix(radToDeg(aTilt1))} degree, Tilt2 ${ffix(radToDeg(aTilt2))} degree\n`;
		rGeome.logstr += `Polygone: N1 ${param.N1}, W1 ${ffix(W1)}, W2 ${ffix(W2)} mm, CAB2 ${ffix(radToDeg(CAB2))} degree\n`;
		rGeome.logstr += `Trapeze: a1 ${ffix(radToDeg(a1))} degree, T1 ${ffix(T1)}, TW1 ${ffix(TW1)}, TW2 ${ffix(TW2)} mm\n`;
		rGeome.logstr += `Joint: L1 ${ffix(L1)} mm, Jangle ${ffix(radToDeg(aJa))} degree, JW ${ffix(aJa * aJr)} mm\n`;
		// step-7 : drawing of the figures
		// facet-loop
		const facetList: Facet[] = [];
		const jointList: tJuncs = {};
		const half1: tHalfProfile = [];
		const half2: tHalfProfile = [];
		for (let idx = 0; idx < param.N1; idx++) {
			const Jpost = `J${idx + 1}`;
			const Jpre = `J${idx}`;
			const ctr1 = contourJ(-W2 / 2, 0)
				.addSegStrokeR(W2, 0)
				.startJunction(Jpost, tJDir.eA, tJSide.eABLeft)
				.addSegStrokeR(-W12, T1)
				.addSegStrokeR(-W1, 0);
			if (idx > 0) {
				ctr1.startJunction(Jpre, tJDir.eB, tJSide.eABRight);
			}
			ctr1.closeSegStroke();
			const fa1 = facet([ctr1]);
			facetList.push(fa1);
			jointList[Jpost] = { angle: aJa, radius: aJr, neutral: aJn, mark: aJm };
			if (idx > 0) {
				half1.push(Jpost);
				half1.push(TW1);
				half2.push(Jpost);
				half2.push(TW2);
			}
		}
		// sheetFold
		const sFold = sheetFold(
			facetList,
			jointList,
			[
				{ x1: 0, y1: 0, a1: 0, l1: TW1, ante: [], post: half1 },
				{ x1: 0, y1: 4 * TW2, a1: 0, l1: TW2, ante: [], post: half2 }
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
