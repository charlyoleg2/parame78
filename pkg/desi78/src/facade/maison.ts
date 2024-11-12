// maison.ts
// an house with a fold

// step-1 : import from geometrix
import type {
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
	partName: 'maison',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('H1', 'm', 12, 3, 50, 0.1),
		pNumber('H2', 'm', 6, 2, 50, 0.1),
		pNumber('H3', 'm', 6, 2, 50, 0.1),
		pNumber('RS', '%', 50, 10, 90, 1),
		pSectionSeparator('Top'),
		pNumber('A1', 'degree', 70, 90, 270, 1),
		pNumber('W1', 'm', 12, 2, 50, 0.1),
		pNumber('W2', 'm', 12, 2, 50, 0.1),
		pNumber('L1', 'm', 16, 2, 50, 0.1),
		pNumber('L2', 'm', 16, 2, 50, 0.1)
	],
	paramSvg: {
		H1: 'maison_side.svg',
		H2: 'maison_side.svg',
		H3: 'maison_side.svg',
		RS: 'maison_side.svg',
		A1: 'maison_top.svg',
		W1: 'maison_top.svg',
		W2: 'maison_top.svg',
		L1: 'maison_top.svg',
		L2: 'maison_top.svg'
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
	const figSide1 = figure();
	const figSide2 = figure();
	const figTop = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		// step-5 : checks on the parameter values
		// step-6 : any logs
		rGeome.logstr += `maison: height ${ffix(param.H1)} m\n`;
		// step-7 : drawing of the figures
		// figSide1
		// figSide2
		// figTop
		figTop.addMainO(ctrRectangle(0, 0, param.L1, param.L2));
		// final figure list
		rGeome.fig = {
			faceSide1: figSide1,
			faceSide2: figSide2,
			faceTop: figTop
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}`,
					face: `${designName}_faceTop`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
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
		rGeome.logstr += 'maison drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const maisonDef: tPageDef = {
	pTitle: 'Maison',
	pDescription: 'An house with a fold',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { maisonDef };
