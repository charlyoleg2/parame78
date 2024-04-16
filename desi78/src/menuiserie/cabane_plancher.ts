// cabane_plancher.ts
// le plancher de la cabane des enfants

// step-1 : import from geometrix
import type {
	//tContour,
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
	//contour,
	//contourCircle,
	ctrRectangle,
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
		pNumber('W5', 'mm', 100, 10, 400, 1),
		pNumber('E1', 'mm', 200, 0, 1000, 10),
		pSectionSeparator('Pilotis side'),
		pNumber('T1', 'mm', 20, 1, 300, 1),
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
	const figPlancherFace = figure();
	const figPlancherSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const paramA = param.N1 * param.W1;
		const paramB = param.N2 * param.W2;
		const goldenRatio = 1.618;
		const ratioBA = paramB / paramA;
		// step-5 : checks on the parameter values
		// step-6 : any logs
		rGeome.logstr += `cabane-plancher-size: A: ${ffix(paramA)} m, B: ${ffix(paramB)} m, surface: ${ffix(paramA * paramB)} m2\n`;
		rGeome.logstr += `Comparison with the golden-ratio: B/A: ${ffix(ratioBA)}   ${ffix((100 * ratioBA) / goldenRatio)} %\n`;
		// step-7 : drawing of the figures
		// figPlancherTop
		for (let i = 0; i < param.N1; i++) {
			figPlancherTop.addMain(ctrRectangle(0, i * param.W1, paramB, param.W1));
		}
		for (let i = 0; i < param.N2; i++) {
			figPlancherTop.addSecond(ctrRectangle(i * param.W2, 0, param.W2, paramA));
		}
		// figPlancherBottom
		for (let i = 0; i < param.N1; i++) {
			figPlancherBottom.addSecond(ctrRectangle(0, i * param.W1, paramB, param.W1));
		}
		for (let i = 0; i < param.N2; i++) {
			figPlancherBottom.addMain(ctrRectangle(i * param.W2, 0, param.W2, paramA));
		}
		// figPlancherFace
		// figPlancherSide
		// final figure list
		rGeome.fig = {
			facePlancherTop: figPlancherTop,
			facePlancherBottom: figPlancherBottom,
			facePlancherFace: figPlancherFace,
			facePlancherSide: figPlancherSide
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}`,
					face: `${designName}_facePlancherTop`,
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
					inList: [`subpax_${designName}`]
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
