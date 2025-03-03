// armAxis.ts
// the axis of a robot arm joint

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
	contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	//pointCoord,
	ffix,
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
	partName: 'armAxis',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 20, 1, 200, 1),
		pNumber('T1', 'mm', 3, 0.5, 10, 0.25),
		pNumber('L1', 'mm', 50, 1, 500, 1),
		pSectionSeparator('Hollow'),
		pNumber('D2', 'mm', 10, 0, 200, 1),
		pNumber('D3', 'mm', 20, 0, 200, 1)
	],
	paramSvg: {
		D1: 'armAxis_section.svg',
		T1: 'armAxis_section.svg',
		L1: 'armAxis_length.svg',
		D2: 'armAxis_length.svg',
		D3: 'armAxis_section.svg'
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
	const figAxis = figure();
	const figHoleS = figure();
	const figHoleL = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const R1b = R1 - param.T1;
		const R2 = param.D2 / 2;
		const R3 = param.D3 / 2;
		// step-5 : checks on the parameter values
		if (R1b <= 0) {
			throw `err102: T1 ${param.T1} too large compare to D1 ${param.D1}`;
		}
		if (param.D1 < param.D2) {
			throw `err105: D1 ${param.D1} too small compare to D2 ${param.D2}`;
		}
		if (param.L1 < param.D3) {
			throw `err108: param.L1 ${param.L1} too small compare to D3 ${param.D3}`;
		}
		if (param.D1 < R3) {
			throw `err111: D1 ${param.D1} too small compare to D3 ${param.D3}`;
		}
		// step-6 : any logs
		rGeome.logstr += `D1 ${ffix(param.D1)}, R1 ${ffix(R1)}\n`;
		rGeome.logstr += `D1b ${ffix(2 * R1b)}, R1b ${ffix(R1b)}\n`;
		// step-7 : drawing of the figures
		// figAxis
		figAxis.addMainOI([contourCircle(0, 0, R1), contourCircle(0, 0, R1b)]);
		figAxis.addSecond(ctrRectangle(1, -R2, 2 * R1, 2 * R2));
		figAxis.addSecond(ctrRectangle(-R1 - R3, -param.D1, 2 * R3, 2 * param.D1));
		// figHoleS
		figHoleS.addMainO(contourCircle(0, 0, R2));
		figHoleS.addSecond(ctrRectangle(-param.L1 / 2, -R1, param.L1, 2 * R1));
		figHoleS.addSecond(ctrRectangle(-param.L1 / 2, -R1b, param.L1, 2 * R1b));
		// figHoleL
		figHoleL.addMainO(contourCircle(0, 0, R3));
		figHoleL.addSecond(ctrRectangle(-param.L1 / 2, 0, param.L1, 2 * R1));
		figHoleL.addSecond(ctrRectangle(-param.L1 / 2, param.T1, param.L1, 2 * R1b));
		// final figure list
		rGeome.fig = {
			faceAxis: figAxis,
			faceHoleS: figHoleS,
			faceHoleL: figHoleL
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_Axis`,
					face: `${designName}_faceAxis`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_HoleS`,
					face: `${designName}_faceHoleS`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 2 * param.D1,
					rotate: [0, Math.PI / 2, 0],
					translate: [0, 0, param.L1 / 2]
				},
				{
					outName: `subpax_${designName}_HoleL`,
					face: `${designName}_faceHoleL`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 2 * param.D1,
					rotate: [-Math.PI / 2, 0, 0],
					translate: [-R1, -param.D1, param.L1 / 2]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eSubstraction,
					inList: [
						`subpax_${designName}_Axis`,
						`subpax_${designName}_HoleS`,
						`subpax_${designName}_HoleL`
					]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'armAxis drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const armAxisDef: tPageDef = {
	pTitle: 'armAxis',
	pDescription: 'axis of robotic arm joint',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { armAxisDef };
