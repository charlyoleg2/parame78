// doubleArcs.ts
// solve the problem of double-arcs with the constraints of 3 tangents

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
	point,
	//Point,
	//ShapePoint,
	line,
	vector,
	contour,
	//contourCircle,
	//ctrRectangle,
	figure,
	degToRad,
	radToDeg,
	pointCoord,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';
//import { triAPiPi, triAArA, triALArLL, triLALrL, triALLrL, triALLrLAA, triLLLrA, triLLLrAAA } from 'triangule';
//import { triAArA, triALArLL, triLALrL, triALLrLAA, triLLLrA, triLLLrAAA } from 'triangule';
import { triALArLL, triAArA } from 'triangule';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'doubleArcs',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('lAB', 'mm', 100, 1, 200, 1),
		pNumber('a', 'degree', 60, -180, 180, 1),
		pNumber('b', 'degree', -45, -180, 180, 1),
		pNumber('c', 'degree', 20, -180, 180, 1),
		pSectionSeparator('Thickness'),
		pNumber('T1', 'mm', 5, 1, 20, 1)
	],
	paramSvg: {
		lAB: 'doubleArcs_problem.svg',
		a: 'doubleArcs_problem.svg',
		b: 'doubleArcs_problem.svg',
		c: 'doubleArcs_solution.svg',
		T1: 'doubleArcs_solution.svg'
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
	const fig1 = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const aT = degToRad(param.a);
		const bT = degToRad(param.b);
		const cT = degToRad(param.c);
		const au = (aT + cT) / 2;
		const av = (bT + cT) / 2;
		const [tr1lBC, tr1lAC, str1] = triALArLL(Math.abs(au), param.lAB, Math.abs(av));
		const [tr1aC, str2] = triAArA(Math.abs(au), Math.abs(av));
		const sAB = Math.sign(aT * bT);
		const vLen = param.lAB / 4;
		const pi2 = Math.PI / 2;
		const [Cx, Cy] = pointCoord(0, 0, au, tr1lAC);
		rGeome.logstr += str1 + str2;
		// step-5 : checks on the parameter values
		if (sAB >= 0) {
			throw `err091: sign of a ${ffix(param.a)} and b ${ffix(param.b)} must differ!`;
		}
		// step-6 : any logs
		rGeome.logstr += `Inputs: aT ${ffix(radToDeg(aT))}, lAB ${ffix(param.lAB)}, bT ${ffix(radToDeg(bT))}\n`;
		rGeome.logstr += `triangle-ACB: au ${ffix(radToDeg(au))}, aC ${ffix(radToDeg(tr1aC))}, av ${ffix(radToDeg(av))}\n`;
		rGeome.logstr += `triangle-ACB: lAC ${ffix(tr1lAC)}, lBC ${ffix(tr1lBC)}\n`;
		// step-7 : drawing of the figures
		// fig1
		const ctr1 = contour(0, 0)
			.addPointRP(au, tr1lAC)
			.addSegArc3(aT, true)
			.addPointA(param.lAB, 0)
			.addSegArc3(Math.PI + bT, false)
			.closeSegStroke();
		fig1.addMainO(ctr1);
		fig1.addVector(vector(aT, vLen, point(0, 0)));
		fig1.addVector(vector(bT, vLen, point(param.lAB, 0)));
		fig1.addVector(vector(cT, vLen, point(Cx, Cy)));
		fig1.addLine(line(0, 0, aT + pi2));
		fig1.addLine(line(Cx, Cy, cT + pi2));
		fig1.addLine(line(param.lAB, 0, bT + pi2));
		// final figure list
		rGeome.fig = {
			face1: fig1
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_fig1`,
					face: `${designName}_face1`,
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
					inList: [`subpax_${designName}_fig1`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'doubleArcs drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const doubleArcsDef: tPageDef = {
	pTitle: 'doubleArcs',
	pDescription: 'solve the problem of double arcs with tangent constraints',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { doubleArcsDef };
