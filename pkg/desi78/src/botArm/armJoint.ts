// armJoint.ts
// a joint of a robot arm

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
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	//pointCoord,
	//ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';
//import type { tContourJ } from 'sheetfold';
//import {
//	tJDir,
//	tJSide,
//	contourJ,
//	facet,
//	//contourJ2contour,
//	//facet2figure,
//	sheetFold
//} from 'sheetfold';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'armJoint',
	params: [
		//pNumber(name, unit, init, min, max, step)
		//pNumber('W11A', 'mm', 50, 1, 500, 1),
		//pNumber('W11B', 'mm', 50, 1, 500, 1),
		//pNumber('W21A', 'mm', 50, 1, 500, 1),
		//pNumber('W21B', 'mm', 50, 1, 500, 1),
		pNumber('W12A', 'mm', 60, 1, 500, 1),
		pNumber('W12B', 'mm', 60, 1, 500, 1),
		pNumber('W22A', 'mm', 60, 1, 500, 1),
		pNumber('W22B', 'mm', 60, 1, 500, 1),
		pSectionSeparator('Side'),
		pNumber('L11', 'mm', 50, 1, 500, 1),
		pNumber('L12', 'mm', 50, 1, 500, 1),
		pNumber('L21', 'mm', 50, 1, 500, 1),
		pNumber('L22', 'mm', 50, 1, 500, 1),
		pNumber('D1', 'mm', 40, 1, 200, 1),
		pNumber('S1', 'mm', 10, 1, 200, 1),
		pSectionSeparator('Hollow'),
		pNumber('D12', 'mm', 20, 0, 200, 1),
		pNumber('D13A', 'mm', 30, 0, 200, 1),
		pNumber('D13B', 'mm', 30, 0, 200, 1),
		pNumber('D22', 'mm', 20, 0, 200, 1),
		pNumber('D23A', 'mm', 30, 0, 200, 1),
		pNumber('D23B', 'mm', 30, 0, 200, 1),
		pSectionSeparator('Thickness and corners'),
		pNumber('T1', 'mm', 3, 0.5, 10, 0.25),
		pNumber('J1mark', 'mm', 1, 0, 20, 0.1),
		pNumber('J1radius', 'mm', 5, 0, 50, 1),
		pNumber('J1neutral', '%', 50, 0, 100, 1),
		pNumber('T2', 'mm', 3, 0.5, 10, 0.25),
		pNumber('J2mark', 'mm', 1, 0, 20, 0.1),
		pNumber('J2radius', 'mm', 5, 0, 50, 1),
		pNumber('J2neutral', '%', 50, 0, 100, 1)
	],
	paramSvg: {
		W12A: 'armJoint_section.svg',
		W12B: 'armJoint_section.svg',
		W22A: 'armJoint_section.svg',
		W22B: 'armJoint_section.svg',
		L11: 'armJoint_side.svg',
		L12: 'armJoint_side.svg',
		D1: 'armJoint_side.svg',
		S1: 'armJoint_side.svg',
		D12: 'armJoint_side.svg',
		D13A: 'armJoint_side.svg',
		D13B: 'armJoint_top.svg',
		D22: 'armJoint_side.svg',
		D23A: 'armJoint_side.svg',
		D23B: 'armJoint_top.svg',
		T1: 'armJoint_top.svg',
		T2: 'armJoint_top.svg',
		J1mark: 'armEnd_section.svg',
		J1radius: 'armEnd_section.svg',
		J1neutral: 'armEnd_section.svg',
		J2mark: 'armEnd_section.svg',
		J2radius: 'armEnd_section.svg',
		J2neutral: 'armEnd_section.svg'
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
	const figFake = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		//const aJ1n = param.J1neutral / 100;
		//const aJ2n = param.J2neutral / 100;
		//const R1 = param.D1 / 2;
		//const R12 = param.D12 / 2;
		//const R22 = param.D22 / 2;
		//const R13A = param.D13A / 2;
		//const R23A = param.D23A / 2;
		//const R3B = param.D3B / 2;
		//const JRext = param.Jradius + param.T1 * (1 - aJn);
		//const W1A = param.W2A - 2 * JRext;
		//const W1B = param.W2B - 2 * JRext;
		//const aCorner = Math.PI / 2;
		//const W1A2 = W1A / 2;
		//const W1B2 = W1B / 2;
		//const lDiag = Math.sqrt(param.L2 ** 2 + W1A2 ** 2);
		//const a1 = Math.atan2(W1A2, param.L2);
		//const Rext = R1 + param.S1;
		//if (Rext >= lDiag) {
		//	throw `err123: lDiag ${ffix(lDiag)} too small compare to D1 ${param.D1} and S1 ${param.S1}`;
		//}
		//const a2 = Math.acos(Rext / lDiag);
		//const a3 = -Math.PI / 2 + a1 + a2;
		//const p1x = Rext * Math.cos(a3);
		//const p1y = Rext * Math.sin(a3);
		//const R2y = (param.L2 - R1) / 2;
		//// step-5 : checks on the parameter values
		//if (W1A < param.D3A) {
		//	throw `err118: W1A ${W1A} too small compare to D3A ${param.D3A}`;
		//}
		//if (param.L1 < param.D3A) {
		//	throw `err119: param.L1 ${param.L1} too small compare to D3A ${param.D3A}`;
		//}
		//if (W1B < param.D3B) {
		//	throw `err121: W1B ${W1B} too small compare to D3B ${param.D3B}`;
		//}
		//if (param.L1 < param.D3B) {
		//	throw `err122: param.L1 ${param.L1} too small compare to D3B ${param.D3B}`;
		//}
		//if (param.L2 < R1 + 2 * R2) {
		//	throw `err124: L2 ${param.L2} too small compare to D1 ${param.D1} and D2 ${param.D2}`;
		//}
		//// step-6 : any logs
		//rGeome.logstr += `W1A ${ffix(W1A)}, W1B ${ffix(W1B)}\n`;
		// step-7 : drawing of the figures
		figFake.addMainO(ctrRectangle(0, 0, param.W12A, param.W12B));
		// final figure list
		rGeome.fig = {
			faceFake: figFake
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_fake`,
					face: `${designName}_faceFake`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_fake`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'armJoint drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const armJointDef: tPageDef = {
	pTitle: 'armJoint',
	pDescription: 'robotic arm joint',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { armJointDef };
