// demoTriangule.ts
// demonstration of the Triangule library

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
	contour,
	contourCircle,
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
import { triAArA, triALArLL, triLALrL, triALLrLAA, triLLLrA, triLLLrAAA } from 'triangule';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'demoTriangule',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('lAB', 'mm', 60, 0, 200, 1),
		pNumber('lBC', 'mm', 40, 0, 200, 1),
		pNumber('lAC', 'mm', 35, 0, 200, 1),
		pNumber('aCAB', 'degree', 35, -180, 180, 1),
		pNumber('aABC', 'degree', 45, -180, 180, 1),
		//pNumber('aBCA', 'degree', 100, -180, 180, 1),
		pSectionSeparator('Start'),
		pNumber('Ax', 'mm', 50, -1000, 1000, 1),
		pNumber('Ay', 'mm', 50, -1000, 1000, 1),
		pNumber('aAB', 'degree', 10, -190, 190, 1),
		pSectionSeparator('Thickness'),
		pNumber('T1', 'mm', 5, 1, 20, 1)
	],
	paramSvg: {
		lAB: 'demoTriangule_overview.svg',
		lBC: 'demoTriangule_triangle.svg',
		lAC: 'demoTriangule_triangle.svg',
		aCAB: 'demoTriangule_anglePotentialError.svg',
		aABC: 'demoTriangule_strokeAngle.svg',
		//aBCA: 'demoTriangule_anglePotentialError.svg',
		Ax: 'demoTriangule_start.svg',
		Ay: 'demoTriangule_start.svg',
		aAB: 'demoTriangule_start.svg',
		T1: 'demoTriangule_triangle.svg'
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
	const figTriangles = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const a0A = degToRad(param.aAB);
		const aA = degToRad(param.aCAB);
		const aB = degToRad(param.aABC);
		//const aC = degToRad(param.aBCA);
		const [tr1lBC, tr1lCA, str2] = triALArLL(aA, param.lAB, aB);
		const [tr1aC, str3] = triAArA(aA, aB);
		const [tr2lBC, str4] = triLALrL(param.lAC, aA, param.lAB);
		const [tmptr2aC, str5] = triLLLrA(param.lAC, param.lAB, tr2lBC);
		const tr2aC = Math.sign(aA) * tmptr2aC;
		const [tr2aB, str6] = triAArA(aA, tr2aC);
		rGeome.logstr += str2 + str3 + str4 + str5 + str6;
		//const [tr3lAC1, tr3lAC2] = triALLrL(aA, param.lAB, param.lBC);
		//const tr3aA1 = tr3lAC1 > 0 ? aA : triAPiPi(aA - Math.PI);
		//const tr3aA2 = tr3lAC2 > 0 ? aA : triAPiPi(aA - Math.PI);
		//const tr3aB1 = Math.sign(tr3aA1) * triLLLrA(param.lBC, Math.abs(tr3lAC1), param.lAB);
		//const tr3aB2 = Math.sign(tr3aA2) * triLLLrA(param.lBC, Math.abs(tr3lAC2), param.lAB);
		const tr3 = triALLrLAA(aA, param.lAB, param.lBC);
		const [tr3lAC1, tr3aA1, tr3aB1] = tr3.slice(0, 3) as [number, number, number];
		const [tr3lAC2, tr3aA2, tr3aB2] = tr3.slice(3, 6) as [number, number, number];
		rGeome.logstr += tr3[6];
		const [tr3aC1, str7] = triAArA(tr3aA1, tr3aB1);
		const [tr3aC2, str8] = triAArA(tr3aA2, tr3aB2);
		const [tr4aA, tr4aB, tr4aC, str9] = triLLLrAAA(param.lAB, param.lBC, param.lAC);
		rGeome.logstr += str7 + str8 + str9;
		const step = 300;
		// step-5 : checks on the parameter values
		if (param.lAB < 0) {
			throw `err639: lAB ${ffix(param.lAB)} is negative`;
		}
		// step-6 : any logs
		rGeome.logstr += `triangle-1: aA ${ffix(radToDeg(aA))}, lAB ${ffix(param.lAB)}, aB ${ffix(radToDeg(aB))}\n`;
		rGeome.logstr += `triangle-1: lBC ${ffix(tr1lBC)} aC ${ffix(radToDeg(tr1aC))}, lCA ${ffix(tr1lCA)}\n`;
		rGeome.logstr += `triangle-2: lAC ${ffix(param.lAC)}, aA ${ffix(radToDeg(aA))}, lAB ${ffix(param.lAB)}\n`;
		rGeome.logstr += `triangle-2: aB ${ffix(radToDeg(tr2aB))}, lBC ${ffix(tr2lBC)}, aC ${ffix(radToDeg(tr2aC))}\n`;
		rGeome.logstr += `triangle-3: aA ${ffix(radToDeg(aA))}, lAB ${ffix(param.lAB)}, lBC ${ffix(param.lBC)}\n`;
		rGeome.logstr += `triangle-31: lAC1 ${ffix(tr3lAC1)} aB1 ${ffix(radToDeg(tr3aB1))}, aC1 ${ffix(radToDeg(tr3aC1))}\n`;
		rGeome.logstr += `triangle-32: lAC2 ${ffix(tr3lAC2)} aB2 ${ffix(radToDeg(tr3aB2))}, aC2 ${ffix(radToDeg(tr3aC2))}\n`;
		rGeome.logstr += `triangle-4: lAB ${ffix(param.lAB)}, lBC ${ffix(param.lBC)}, lAC ${ffix(param.lAC)}\n`;
		rGeome.logstr += `triangle-4: aA ${ffix(radToDeg(tr4aA))}, aB ${ffix(radToDeg(tr4aB))}, aC ${ffix(radToDeg(tr4aC))}\n`;
		// step-7 : drawing of the figures
		// figTriangles
		const ctr1 = contour(param.Ax, param.Ay)
			.addSegStrokeRP(a0A, param.lAB)
			.addSegStrokeRP(a0A + Math.PI + aB, tr1lBC)
			.closeSegStroke();
		figTriangles.addMainO(ctr1);
		const [tr1Cx, tr1Cy] = pointCoord(param.Ax, param.Ay, a0A - aA, tr1lCA);
		figTriangles.addSecond(contourCircle(tr1Cx, tr1Cy, tr1lCA));
		figTriangles.addSecond(contourCircle(tr1Cx, tr1Cy, tr1lBC));
		const ctr2 = contour(param.Ax + step, param.Ay)
			.addSegStrokeRP(a0A, param.lAB)
			.addSegStrokeRP(a0A + Math.PI + tr2aB, tr2lBC)
			.closeSegStroke();
		figTriangles.addMainO(ctr2);
		figTriangles.addSecond(contourCircle(param.Ax + step, param.Ay, param.lAC));
		const ctr31 = contour(param.Ax + step, param.Ay - step)
			.addSegStrokeRP(a0A, param.lAB)
			.addSegStrokeRP(a0A + Math.PI + tr3aB1, param.lBC)
			.closeSegStroke();
		figTriangles.addMainO(ctr31);
		const ctr32 = contour(param.Ax + step, param.Ay - step)
			.addSegStrokeRP(a0A, param.lAB)
			.addSegStrokeRP(a0A + Math.PI + tr3aB2, param.lBC)
			.closeSegStroke();
		figTriangles.addSecond(ctr32);
		const [tr3Bx, tr3By] = pointCoord(param.Ax + step, param.Ay - step, a0A, param.lAB);
		figTriangles.addSecond(contourCircle(tr3Bx, tr3By, param.lBC));
		const ctr4 = contour(param.Ax, param.Ay - step)
			.addSegStrokeRP(a0A, param.lAB)
			.addSegStrokeRP(a0A + Math.PI + tr4aB, param.lBC)
			.closeSegStroke();
		figTriangles.addMainO(ctr4);
		const ctr4b = contour(param.Ax, param.Ay - step)
			.addSegStrokeRP(a0A, param.lAB)
			.addSegStrokeRP(a0A + Math.PI - tr4aB, param.lBC)
			.closeSegStroke();
		figTriangles.addSecond(ctr4b);
		figTriangles.addSecond(contourCircle(param.Ax, param.Ay - step, param.lAC));
		// final figure list
		rGeome.fig = {
			faceTriangles: figTriangles
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_triangles`,
					face: `${designName}_faceTriangles`,
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
					inList: [`subpax_${designName}_triangles`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'demoTriangule drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const demoTrianguleDef: tPageDef = {
	pTitle: 'demoTriangule',
	pDescription: 'demonstrate the Triangule library',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { demoTrianguleDef };
