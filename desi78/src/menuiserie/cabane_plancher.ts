// cabane_plancher.ts
// le plancher de la cabane des enfants

// step-1 : import from geometrix
import type {
	tContour,
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
	ctrRectangle,
	figure,
	degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	transform3d,
	EExtrude,
	EBVolume
} from 'geometrix';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'cabane_plancher',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('N1', 'planches', 8, 2, 100, 1),
		pNumber('N2', 'planches', 13, 2, 100, 1),
		pNumber('W1', 'mm', 200, 20, 800, 1),
		pNumber('W2', 'mm', 200, 20, 800, 1),
		pSectionSeparator('Pilotis face'),
		pNumber('H1', 'mm', 400, 10, 2000, 10),
		pNumber('H2', 'mm', 150, 10, 400, 1),
		pNumber('H3', 'mm', 150, 10, 400, 1),
		pNumber('W3', 'mm', 150, 10, 400, 1),
		pNumber('a1', 'degree', 80, 20, 90, 1),
		pNumber('W4', 'mm', 150, 10, 400, 1),
		pNumber('W5', 'mm', 135, 10, 400, 1),
		pNumber('E1', 'mm', 200, 0, 1000, 10),
		pSectionSeparator('Pilotis side'),
		pNumber('T1', 'mm', 20, 1, 300, 1),
		pNumber('ES1', 'mm', 0.2, 0, 2, 0.1),
		pNumber('ES2', 'mm', 0.2, 0, 2, 0.1),
		pNumber('S1', 'mm', 200, 0, 1000, 10),
		pNumber('S2', 'mm', 100, 10, 400, 10)
	],
	paramSvg: {
		N1: 'cabane_plancher_top.svg',
		N2: 'cabane_plancher_bottom.svg',
		W1: 'cabane_plancher_top.svg',
		W2: 'cabane_plancher_bottom.svg',
		H1: 'cabane_plancher_face.svg',
		H2: 'cabane_plancher_face.svg',
		H3: 'cabane_plancher_face.svg',
		W3: 'cabane_plancher_face.svg',
		a1: 'cabane_plancher_face.svg',
		W4: 'cabane_plancher_face.svg',
		W5: 'cabane_plancher_face.svg',
		E1: 'cabane_plancher_face.svg',
		T1: 'cabane_plancher_face.svg',
		ES1: 'cabane_plancher_top.svg',
		ES2: 'cabane_plancher_bottom.svg',
		S1: 'cabane_plancher_side.svg',
		S2: 'cabane_plancher_side.svg'
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
	const figPlancherTop = figure();
	const figPlancherBottom = figure();
	const figFaceBeam = figure();
	const figFaceLeg = figure();
	const figFaceButtress = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const paramA = param.N1 * param.W1 + (param.N1 - 1) * param.ES1;
		const paramB = param.N2 * param.W2 + (param.N2 - 1) * param.ES2;
		const goldenRatio = 1.618;
		const ratioBA = paramB / paramA;
		const faceMid = paramA / 2;
		const a1 = degToRad(param.a1);
		const paramW5b = param.W4 - param.W5;
		const paramH3b = paramW5b * Math.tan(a1);
		const paramH3c = param.H3 / Math.tan(a1);
		const legFootPrint = param.W3 / Math.cos(Math.PI / 2 - a1);
		const legFootLength = param.W3 * Math.tan(Math.PI / 2 - a1);
		const legShift = param.H1 / Math.tan(a1);
		const buttressW2 = faceMid - param.E1 - param.W5 - paramH3c - legFootPrint;
		const paramH2b = param.H2 / Math.tan(a1);
		// step-5 : checks on the parameter values
		if (paramW5b < 0) {
			throw `err108: W5 ${param.W5} is too large compare to W4 ${param.W4}`;
		}
		if (paramH3b > param.H3) {
			throw `err111: H3 ${param.H3} is too small compare to a1 ${param.a1} or W5b ${paramW5b}`;
		}
		if (buttressW2 < 0) {
			throw `err119: N1 ${param.N1} or W1 ${param.W1} are too small compare to E1 ${param.E1}, W5 ${param.W5}, H3 ${param.H3} or W3 ${param.W3}`;
		}
		// step-6 : any logs
		rGeome.logstr += `cabane-plancher-size: A: ${ffix(paramA)} mm, B: ${ffix(paramB)} mm, surface: ${ffix(paramA * paramB * 10 ** -6)} m2\n`;
		rGeome.logstr += `Comparison with the golden-ratio: B/A: ${ffix(ratioBA)}   ${ffix((100 * ratioBA) / goldenRatio)} %\n`;
		rGeome.logstr += `beam-bevel: W5b: ${ffix(paramW5b)} mm, H3b: ${ffix(paramH3b)} mm\n`;
		rGeome.logstr += `buttress-length: ${ffix(2 * (buttressW2 + paramH2b))} mm\n`;
		rGeome.logstr += `leg-length: ${ffix(param.H1 / Math.sin(a1) + legFootLength)} mm\n`;
		// step-7 : drawing of the figures
		// figPlancherTop
		for (let i = 0; i < param.N1; i++) {
			figPlancherTop.addMain(ctrRectangle(0, i * (param.W1 + param.ES1), paramB, param.W1));
		}
		for (let i = 0; i < param.N2; i++) {
			figPlancherTop.addSecond(ctrRectangle(i * (param.W2 + param.ES2), 0, param.W2, paramA));
		}
		// figPlancherBottom
		for (let i = 0; i < param.N1; i++) {
			figPlancherBottom.addSecond(
				ctrRectangle(0, i * (param.W1 + param.ES1), paramB, param.W1)
			);
		}
		for (let i = 0; i < param.N2; i++) {
			figPlancherBottom.addMain(
				ctrRectangle(i * (param.W2 + param.ES2), 0, param.W2, paramA)
			);
		}
		// figFaceBeam
		for (let i = 0; i < param.N1; i++) {
			figFaceBeam.addSecond(
				ctrRectangle(i * (param.W1 + param.ES1), param.H1 + param.T1, param.W1, param.T1)
			);
		}
		figFaceBeam.addSecond(ctrRectangle(0, param.H1, paramA, param.T1));
		figFaceLeg.mergeFigure(figFaceBeam); // inherit plancher decoration
		figFaceButtress.mergeFigure(figFaceBeam); // inherit plancher decoration
		const ctrBeam = function (side: number): tContour {
			const rCtr = contour(faceMid + side * (faceMid - param.E1), param.H1)
				.addSegStrokeR(-side * param.W4, 0)
				.addSegStrokeR(0, -param.H3 + paramH3b)
				.addSegStrokeR(side * paramW5b, -paramH3b)
				.addSegStrokeR(side * param.W5, 0)
				.closeSegStroke();
			return rCtr;
		};
		figFaceBeam.addMain(ctrBeam(-1));
		figFaceBeam.addMain(ctrBeam(1));
		const ctrLeg = function (side: number): tContour {
			const rCtr = contour(faceMid + side * buttressW2, param.H1)
				.addSegStrokeR(side * legFootPrint, 0)
				.addSegStrokeR(side * legShift, -param.H1)
				.addSegStrokeR(-side * legFootPrint, 0)
				.closeSegStroke();
			return rCtr;
		};
		figFaceBeam.addSecond(ctrLeg(-1));
		figFaceBeam.addSecond(ctrLeg(1));
		const ctrButtress = contour(faceMid - buttressW2, param.H1)
			.addSegStrokeR(2 * buttressW2, 0)
			.addSegStrokeR(paramH2b, -param.H2)
			.addSegStrokeR(-2 * (buttressW2 + paramH2b), 0)
			.closeSegStroke();
		figFaceBeam.addSecond(ctrButtress);
		// figFaceLeg
		figFaceLeg.addSecond(ctrBeam(-1));
		figFaceLeg.addSecond(ctrBeam(1));
		figFaceLeg.addMain(ctrLeg(-1));
		figFaceLeg.addMain(ctrLeg(1));
		figFaceLeg.addSecond(ctrButtress);
		// figFaceButtress
		figFaceButtress.addSecond(ctrBeam(-1));
		figFaceButtress.addSecond(ctrBeam(1));
		figFaceButtress.addSecond(ctrLeg(-1));
		figFaceButtress.addSecond(ctrLeg(1));
		figFaceButtress.addMain(ctrButtress);
		// figSide
		figSide.addSecond(ctrRectangle(0, param.H1 + param.T1, paramB, param.T1));
		for (let i = 0; i < param.N2; i++) {
			figSide.addSecond(
				ctrRectangle(i * (param.W2 + param.ES2), param.H1, param.W2, param.T1)
			);
		}
		figSide.addSecond(ctrRectangle(0, param.H1 - param.H3, paramB, param.H2));
		figSide.addMain(ctrRectangle(param.S1, 0, param.S2, param.H1));
		figSide.addMain(ctrRectangle(paramB - param.S1 - param.S2, 0, param.S2, param.H1));
		// final figure list
		rGeome.fig = {
			facePlancherTop: figPlancherTop,
			facePlancherBottom: figPlancherBottom,
			faceBeam: figFaceBeam,
			faceLeg: figFaceLeg,
			faceButtress: figFaceButtress,
			faceSide: figSide
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		const tmBeam = transform3d(); // helper for calculating the rotation and translation of the beams
		tmBeam.addRotation(Math.PI / 2, 0, 0);
		tmBeam.addTranslation(0, paramB, 0);
		tmBeam.addRotation(0, 0, -Math.PI / 2);
		tmBeam.addTranslation(0, paramA, 0);
		const tmLeg1 = transform3d();
		tmLeg1.addRotation(Math.PI / 2, 0, 0);
		tmLeg1.addTranslation(0, param.S2 + param.S1, 0);
		tmLeg1.addRotation(0, 0, -Math.PI / 2);
		tmLeg1.addTranslation(0, paramA, 0);
		const tmLeg2 = transform3d();
		tmLeg2.addRotation(Math.PI / 2, 0, 0);
		tmLeg2.addTranslation(0, paramB - param.S1, 0);
		tmLeg2.addRotation(0, 0, -Math.PI / 2);
		tmLeg2.addTranslation(0, paramA, 0);
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_plancherTop`,
					face: `${designName}_facePlancherTop`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, param.H1 + param.T1]
				},
				{
					outName: `subpax_${designName}_plancherBottom`,
					face: `${designName}_facePlancherBottom`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [0, 0, 0],
					translate: [0, 0, param.H1]
				},
				{
					outName: `subpax_${designName}_beam`,
					face: `${designName}_faceBeam`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: paramB,
					rotate: tmBeam.getRotation(),
					translate: tmBeam.getTranslation()
				},
				{
					outName: `subpax_${designName}_leg1`,
					face: `${designName}_faceLeg`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.S2,
					rotate: tmLeg1.getRotation(),
					translate: tmLeg1.getTranslation()
				},
				{
					outName: `subpax_${designName}_leg2`,
					face: `${designName}_faceLeg`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.S2,
					rotate: tmLeg2.getRotation(),
					translate: tmLeg2.getTranslation()
				},
				{
					outName: `subpax_${designName}_buttress1`,
					face: `${designName}_faceButtress`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.S2,
					rotate: tmLeg1.getRotation(),
					translate: tmLeg1.getTranslation()
				},
				{
					outName: `subpax_${designName}_buttress2`,
					face: `${designName}_faceButtress`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.S2,
					rotate: tmLeg2.getRotation(),
					translate: tmLeg2.getTranslation()
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_plancherTop`,
						`subpax_${designName}_plancherBottom`,
						`subpax_${designName}_beam`,
						`subpax_${designName}_leg1`,
						`subpax_${designName}_leg2`,
						`subpax_${designName}_buttress1`,
						`subpax_${designName}_buttress2`
					]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'cabane_plancher drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const cabanePlancherDef: tPageDef = {
	pTitle: 'Plancher de Cabane',
	pDescription: 'Le plancher de la cabane des enfants',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { cabanePlancherDef };
