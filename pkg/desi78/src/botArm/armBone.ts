// armBone.ts
// bone of a robot arm

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
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	//pointCoord,
	ffix,
	pNumber,
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	initGeom
	//EExtrude,
	//EBVolume
} from 'geometrix';
import type { tContourJ } from 'sheetfold';
import {
	tJDir,
	tJSide,
	contourJ,
	facet,
	//contourJ2contour,
	facet2figure,
	sheetFold
} from 'sheetfold';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'armBone',
	params: [
		//pNumber(name, unit, init, min, max, step)
		//pNumber('W1A', 'mm', 50, 1, 500, 1),
		//pNumber('W1B', 'mm', 50, 1, 500, 1),
		pNumber('W2A', 'mm', 60, 1, 500, 1),
		pNumber('W2B', 'mm', 60, 1, 500, 1),
		pCheckbox('eqWAB', true),
		pDropdown('twist', ['straight', 'twisted']),
		pSectionSeparator('Face'),
		pNumber('L1', 'mm', 50, 1, 500, 1),
		pNumber('L2', 'mm', 50, 1, 500, 1),
		pNumber('D1', 'mm', 40, 1, 200, 1),
		pNumber('S1', 'mm', 10, 1, 200, 1),
		pNumber('L3', 'mm', 50, 1, 500, 1),
		pNumber('D5', 'mm', 40, 1, 200, 1),
		pNumber('S2', 'mm', 10, 1, 200, 1),
		pSectionSeparator('Hollow'),
		pNumber('D2', 'mm', 20, 0, 200, 1),
		pNumber('D4', 'mm', 20, 0, 200, 1),
		pNumber('D3A', 'mm', 30, 0, 200, 1),
		pNumber('D3B', 'mm', 30, 0, 200, 1),
		pSectionSeparator('Thickness and corners'),
		pNumber('T1', 'mm', 3, 0.5, 10, 0.25),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1),
		pNumber('Jradius', 'mm', 5, 0, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1)
	],
	paramSvg: {
		W2A: 'armBone_section.svg',
		W2B: 'armBone_section.svg',
		eqWAB: 'armBone_section.svg',
		twist: 'armBone_twisted.svg',
		L1: 'armBone_leg.svg',
		L2: 'armBone_leg.svg',
		D1: 'armBone_leg.svg',
		S1: 'armBone_leg.svg',
		L3: 'armBone_leg.svg',
		D5: 'armBone_leg.svg',
		S2: 'armBone_leg.svg',
		D2: 'armBone_leg.svg',
		D4: 'armBone_leg.svg',
		D3A: 'armBone_leg.svg',
		D3B: 'armBone_side.svg',
		T1: 'armBone_section.svg',
		Jmark: 'armBone_section.svg',
		Jradius: 'armBone_section.svg',
		Jneutral: 'armBone_section.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function calcPxy(iL2: number, iW1A2: number, iRext: number, tag: string): [number, number] {
	const lDiag = Math.sqrt(iL2 ** 2 + iW1A2 ** 2);
	const a1 = Math.atan2(iW1A2, iL2);
	let a2 = 0;
	const Epsilon = 0.01;
	if (iRext > lDiag + Epsilon) {
		throw `err123: ${tag} lDiag ${ffix(lDiag)} too small compare to iRext ${ffix(iRext)}, iL2 ${ffix(iL2)} and iW1A2 ${ffix(iW1A2)}`;
	} else if (iRext < lDiag - Epsilon) {
		a2 = Math.acos(iRext / lDiag);
	}
	const a3 = -Math.PI / 2 + a1 + a2;
	const rP1x = iRext * Math.cos(a3);
	const rP1y = iRext * Math.sin(a3);
	return [rP1x, rP1y];
}

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figA = figure();
	const figB = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const aJn = param.Jneutral / 100;
		const R1 = param.D1 / 2;
		const R2 = param.D2 / 2;
		const R4 = param.D4 / 2;
		const R5 = param.D5 / 2;
		const R3A = param.D3A / 2;
		let R3B = param.D3B / 2;
		const JRext = param.Jradius + param.T1 * (1 - aJn);
		const W1A = param.W2A - 2 * JRext;
		let W1B = param.W2B - 2 * JRext;
		if (param.eqWAB) {
			R3B = R3A;
			W1B = W1A;
		}
		const W2B = W1B + 2 * JRext;
		const aCorner = Math.PI / 2;
		const W1A2 = W1A / 2;
		const W1B2 = W1B / 2;
		const [p1x, p1y] = calcPxy(param.L2, W1A2, R1 + param.S1, 'L2f');
		const R2y = (param.L2 - R1) / 2;
		const [p5x, p5y] = calcPxy(param.L3, param.twist === 1 ? W1B2 : W1A2, R5 + param.S2, 'L3b');
		const R5y = (param.L3 - R5) / 2;
		const yLength = param.L1 + param.L2 + param.L3 + R1 + param.S1 + R5 + param.S2;
		// step-5 : checks on the parameter values
		if (W1A < param.D3A) {
			throw `err118: W1A ${W1A} too small compare to D3A ${param.D3A}`;
		}
		if (param.L1 < param.D3A) {
			throw `err119: param.L1 ${param.L1} too small compare to D3A ${param.D3A}`;
		}
		if (W1B < param.D3B) {
			throw `err121: W1B ${W1B} too small compare to D3B ${param.D3B}`;
		}
		if (param.L1 < param.D3B) {
			throw `err122: param.L1 ${param.L1} too small compare to D3B ${param.D3B}`;
		}
		if (param.L2 < R1 + 2 * R2) {
			throw `err124: L2 ${param.L2} too small compare to D1 ${param.D1} and D2 ${param.D2}`;
		}
		if (param.L3 < R5 + 2 * R4) {
			throw `err127: L3 ${param.L3} too small compare to D5 ${param.D5} and D4 ${param.D4}`;
		}
		// step-6 : any logs
		rGeome.logstr += `W1A ${ffix(W1A)}, W1B ${ffix(W1B)}\n`;
		rGeome.logstr += `Y-length ${ffix(yLength)}\n`;
		//rGeome.logstr += `W1A2 ${ffix(W1A2)}, W1B2 ${ffix(W1B2)}\n`;
		//rGeome.logstr += `p1x ${ffix(p1x)}, p1y ${ffix(p1y)}\n`;
		// step-7 : drawing of the figures
		// facets
		// sub-contourJ
		function ctrA(jName: string[], iTwist: number): tContourJ {
			const rCtr = contourJ(-W1A2, 0);
			if (iTwist === 1) {
				rCtr.addSegStrokeR(W1A, 0);
			} else {
				rCtr.addSegStrokeAifBig(-p5x, -param.L3 - p5y, 0.1, false)
					.addPointA(0, -param.L3 - R5 - param.S2)
					.addPointA(p5x, -param.L3 - p5y)
					.addSegArc2()
					.addSegStrokeAifBig(W1A2, 0, 0.1, true);
			}
			if (jName.length > 0) {
				rCtr.startJunction(jName[0], tJDir.eA, tJSide.eABLeft);
			}
			rCtr.addSegStrokeR(0, param.L1)
				//.addSegStrokeR(-W1A, 0)
				.addSegStrokeAifBig(p1x, param.L1 + param.L2 + p1y, 0.1, false)
				.addPointA(0, param.L1 + param.L2 + R1 + param.S1)
				.addPointA(-p1x, param.L1 + param.L2 + p1y)
				.addSegArc2()
				.addSegStrokeAifBig(-W1A2, param.L1, 0.1, true);
			if (jName.length > 1) {
				rCtr.startJunction(jName[1], tJDir.eB, tJSide.eABRight);
			}
			rCtr.closeSegStroke();
			return rCtr;
		}
		function ctrB(jName: string[], iTwist: number): tContourJ {
			const rCtr = contourJ(-W1B2, 0);
			if (iTwist === 1) {
				rCtr.addSegStrokeAifBig(-p5x, -param.L3 - p5y, 0.1, false)
					.addPointA(0, -param.L3 - R5 - param.S2)
					.addPointA(p5x, -param.L3 - p5y)
					.addSegArc2()
					.addSegStrokeAifBig(W1B2, 0, 0.1, true);
			} else {
				rCtr.addSegStrokeR(W1B, 0);
			}
			if (jName.length > 0) {
				rCtr.startJunction(jName[0], tJDir.eA, tJSide.eABLeft);
			}
			rCtr.addSegStrokeR(0, param.L1).addSegStrokeR(-W1B, 0);
			if (jName.length > 1) {
				rCtr.startJunction(jName[1], tJDir.eB, tJSide.eABRight);
			}
			rCtr.closeSegStroke();
			return rCtr;
		}
		// hollow
		const hollow1A: tContour[] = [];
		if (R3A > 0) {
			hollow1A.push(contourCircle(0, param.L1 / 2, R3A));
		}
		if (R1 > 0) {
			hollow1A.push(contourCircle(0, param.L1 + param.L2, R1));
		}
		if (R2 > 0) {
			hollow1A.push(contourCircle(0, param.L1 + R2y, R2));
		}
		const hollow1B: tContour[] = [];
		if (R3B > 0) {
			hollow1B.push(contourCircle(0, param.L1 / 2, R3B));
		}
		if (R5 > 0) {
			if (param.twist === 1) {
				hollow1B.push(contourCircle(0, -param.L3, R5));
			} else {
				hollow1A.push(contourCircle(0, -param.L3, R5));
			}
		}
		if (R4 > 0) {
			if (param.twist === 1) {
				hollow1B.push(contourCircle(0, -R5y, R4));
			} else {
				hollow1A.push(contourCircle(0, -R5y, R4));
			}
		}
		// facet fa1
		const ctr1 = ctrA(['J1'], param.twist);
		const fa1 = facet([ctr1, ...hollow1A]);
		// facet fa2
		const ctr2 = ctrB(['J2', 'J1'], param.twist);
		const fa2 = facet([ctr2, ...hollow1B]);
		// facet fa3
		const ctr3 = ctrA(['J3', 'J2'], param.twist);
		const fa3 = facet([ctr3, ...hollow1A]);
		// facet fa4
		const ctr4 = ctrB(['J4', 'J3'], param.twist);
		const fa4 = facet([ctr4, ...hollow1B]);
		// sheetFold
		const sFold = sheetFold(
			[fa1, fa2, fa3, fa4],
			{
				J1: {
					angle: aCorner,
					radius: param.Jradius,
					neutral: aJn,
					mark: param.Jmark
				},
				J2: {
					angle: aCorner,
					radius: param.Jradius,
					neutral: aJn,
					mark: param.Jmark
				},
				J3: {
					angle: aCorner,
					radius: param.Jradius,
					neutral: aJn,
					mark: param.Jmark
				},
				J4: {
					angle: aCorner,
					radius: param.Jradius,
					neutral: aJn,
					mark: param.Jmark
				}
			},
			[
				{
					x1: 0,
					y1: 0,
					a1: 0,
					l1: W1A,
					ante: [],
					post: ['J1', W1B, 'J2', W1A, 'J3', W1B, 'J4']
				}
			],
			param.T1,
			rGeome.partName
		);
		// figA
		figA.mergeFigure(facet2figure(fa1));
		figA.addSecond(ctrRectangle(-param.W2A / 2, 0, (param.W2A - W1A) / 2, param.L1));
		figA.addSecond(ctrRectangle(W1A / 2, 0, (param.W2A - W1A) / 2, param.L1));
		const yLA = param.L3 + R5 + param.S2;
		if (param.twist === 1) {
			figA.addMainO(ctrRectangle(-param.W2A / 2, -yLA, param.T1, yLA + param.L1));
			figA.addMainO(ctrRectangle(param.W2A / 2 - param.T1, -yLA, param.T1, yLA + param.L1));
		}
		// figB
		figB.mergeFigure(facet2figure(fa2));
		figB.addSecond(ctrRectangle(-W2B / 2, 0, (W2B - W1B) / 2, param.L1));
		figB.addSecond(ctrRectangle(W1B / 2, 0, (W2B - W1B) / 2, param.L1));
		const yLA2 = param.twist === 1 ? 0 : yLA;
		const yLB = param.L1 + param.L2 + R1 + param.S1;
		figB.addMainO(ctrRectangle(-W2B / 2, -yLA2, param.T1, yLA2 + yLB));
		figB.addMainO(ctrRectangle(W2B / 2 - param.T1, -yLA2, param.T1, yLA2 + yLB));
		// final figure list
		rGeome.fig = {
			faceA: figA,
			faceB: figB
		};
		const ffObj = sFold.makeFigures(true);
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
		rGeome.logstr += 'armBone drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const armBoneDef: tPageDef = {
	pTitle: 'armBone',
	pDescription: 'bone of robotic arm',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { armBoneDef };
