// rail.ts
// a rail from train

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
	//point,
	//Point,
	//ShapePoint,
	//vector,
	contour,
	//contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'rail',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 200, 2, 400, 1),
		pNumber('W2', 'mm', 10, 0.5, 40, 0.5),
		pNumber('W3', 'mm', 100, 1, 200, 1),
		pSectionSeparator('Heights'),
		pNumber('H1', 'mm', 6, 1, 30, 1),
		pNumber('H2', 'mm', 10, 1, 50, 1),
		pNumber('H3', 'mm', 100, 1, 500, 1),
		pNumber('H4', 'mm', 10, 1, 50, 1),
		pNumber('H5', 'mm', 30, 1, 100, 1),
		pNumber('H6', 'mm', 10, 1, 100, 1),
		pSectionSeparator('Corners'),
		pNumber('R1', 'mm', 3, 0, 30, 1),
		pSectionSeparator('Depth'),
		pNumber('L1', 'mm', 100, 1, 1000, 1)
	],
	paramSvg: {
		W1: 'rail_profile.svg',
		W2: 'rail_profile.svg',
		W3: 'rail_profile.svg',
		H1: 'rail_profile.svg',
		H2: 'rail_profile.svg',
		H3: 'rail_profile.svg',
		H4: 'rail_profile.svg',
		H5: 'rail_profile.svg',
		H6: 'rail_profile.svg',
		R1: 'rail_profile.svg',
		L1: 'rail_profile.svg'
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
	const figRail = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const W1h = param.W1 / 2;
		const W2h = param.W2 / 2;
		const W3h = param.W3 / 2;
		const H16 = param.H1 + param.H2 + param.H3 + param.H4 + param.H5 + param.H6;
		// step-5 : checks on the parameter values
		if (param.W2 >= param.W1) {
			throw `err210: W2 ${param.W2} is larger than W1 ${param.W1}`;
		}
		if (param.W2 >= param.W3) {
			throw `err213: W2 ${param.W2} is larger than W3 ${param.W3}`;
		}
		// step-6 : any logs
		rGeome.logstr += `total height: ${ffix(H16)} mm\n`;
		// step-7 : drawing of the figures
		// figRail
		const ctrRail = contour(W1h, 0)
			.addCornerRounded(param.R1)
			.addSegStrokeR(0, param.H1)
			.addCornerRounded(param.R1)
			.addSegStrokeR(W2h - W1h, param.H2)
			.addCornerRounded(param.R1)
			.addSegStrokeR(0, param.H3)
			.addCornerRounded(param.R1)
			.addSegStrokeR(W3h - W2h, param.H4)
			.addCornerRounded(param.R1)
			.addSegStrokeR(0, param.H5)
			.addCornerRounded(param.R1)
			.addPointA(0, H16)
			.addPointA(-W3h, H16 - param.H6)
			.addSegArc2()
			.addCornerRounded(param.R1)
			.addSegStrokeR(0, -param.H5)
			.addCornerRounded(param.R1)
			.addSegStrokeR(W3h - W2h, -param.H4)
			.addCornerRounded(param.R1)
			.addSegStrokeR(0, -param.H3)
			.addCornerRounded(param.R1)
			.addSegStrokeR(W2h - W1h, -param.H2)
			.addCornerRounded(param.R1)
			.addSegStrokeR(0, -param.H1)
			.addCornerRounded(param.R1)
			.closeSegStroke();
		figRail.addMainO(ctrRail);
		// final figure list
		rGeome.fig = {
			faceRail: figRail
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}`,
					face: `${designName}_faceRail`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'rail drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const railDef: tPageDef = {
	pTitle: 'rail',
	pDescription: 'A rail for train',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { railDef };
