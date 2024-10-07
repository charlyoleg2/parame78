// pulley.ts
// three spherical lens

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
	//line,
	//vector,
	//contour,
	contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	//ffix,
	pNumber,
	//pCheckbox,
	pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'pulley',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('zn', 'peg', 100, 9, 300, 1),
		pNumber('pim', 'mm', 2, 0.5, 20, 0.05),
		pNumber('pil', 'mm', 0.4, 0.1, 20, 0.05),
		pSectionSeparator('Profile details'),
		pNumber('bw', 'mm', 0.45, 0.1, 3, 0.01),
		pNumber('nw', 'mm', 0.4, 0.1, 3, 0.01),
		pDropdown('addendum', ['stroke', 'arc']),
		pNumber('ha', 'degree', 5, -20, 20, 1),
		pSectionSeparator('Inner hollow'),
		pNumber('rw', 'mm', 2, 0.5, 10, 0.1),
		pSectionSeparator('Rim'),
		pNumber('rimPlus', 'mm', 1.5, -2, 4, 0.5),
		pSectionSeparator('Widths'),
		pNumber('wheelW', 'mm', 7, 1, 10, 0.1),
		pNumber('rimW', 'mm', 1.2, 0.5, 5, 0.1)
	],
	paramSvg: {
		zn: 'pulley_peg.svg',
		pim: 'pulley_peg.svg',
		pil: 'pulley_peg.svg',
		bw: 'pulley_peg.svg',
		nw: 'pulley_peg.svg',
		ha: 'pulley_peg.svg',
		rw: 'pulley_peg.svg',
		rimPlus: 'pulley_rim.svg',
		wheelW: 'pulley_rim.svg',
		rimW: 'pulley_rim.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

//const c_simOne = 0;
//const c_simTwo = 1;
//const c_simParallel = 2;
//const c_simObject = 3;

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figPulleyRim = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		// step-5 : checks on the parameter values
		// step-6 : any logs
		rGeome.logstr += `R1\n`;
		// step-7 : drawing of the figures
		// figPulleyRim
		figPulleyRim.addMainO(contourCircle(0, 0, 10));
		// final figure list
		rGeome.fig = {
			facePulleyRim: figPulleyRim
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_lens1`,
					face: `${designName}_faceLens1`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_lens2`,
					face: `${designName}_faceLens2`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, param.l2Px]
				},
				{
					outName: `subpax_${designName}_lens3`,
					face: `${designName}_faceLens3`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, param.l3Px]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_lens1`,
						`subpax_${designName}_lens2`,
						`subpax_${designName}_lens3`
					]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'pulley drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const pulleyDef: tPageDef = {
	pTitle: 'Pulley',
	pDescription: 'A pulley for belt with peg',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { pulleyDef };
