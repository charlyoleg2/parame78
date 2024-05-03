// reinforced_tube.ts
// a tube with wall internally reinforced

// step-1 : import from geometrix
import type {
	//tContour,
	tParamDef,
	tParamVal,
	tGeom,
	//tExtrude,
	//tSubInst,
	//tSubDesign,
	tPageDef
} from 'geometrix';
import {
	//designParam,
	//checkGeom,
	//prefixLog,
	//point,
	//Point,
	//ShapePoint,
	//vector,
	//contour,
	contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	radToDeg,
	ffix,
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
	partName: 'reinforced_tube',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1L', 'mm', 1600, 100, 4000, 1),
		pNumber('H1', 'mm', 6000, 10, 20000, 10),
		pNumber('E1', 'mm', 20, 1, 300, 1),
		pSectionSeparator('Reinforcement'),
		pNumber('E2', 'mm', 20, 1, 300, 1),
		pNumber('N2', 'wave', 20, 4, 400, 1),
		pNumber('W22', 'mm', 80, 1, 600, 1),
		pDropdown('wave_method', ['S23L_R32', 'D3_R32']),
		pNumber('S23L', 'mm', 200, 1, 600, 1),
		pNumber('R32', '%', 50, 10, 90, 0.1),
		pNumber('D2', 'mm', 20, 1, 600, 1),
		pNumber('D3', 'mm', 20, 1, 600, 1),
		pNumber('af', 'degree', 0, -45, 45, 1)
	],
	paramSvg: {
		D1L: 'reinforced_tube_section.svg',
		H1: 'reinforced_tube_section.svg',
		E1: 'reinforced_tube_section.svg',
		E2: 'reinforced_tube_section_detail.svg',
		N2: 'reinforced_tube_section.svg',
		W22: 'reinforced_tube_section.svg',
		wave_method: 'reinforced_tube_section.svg',
		S23L: 'reinforced_tube_section.svg',
		R32: 'reinforced_tube_section.svg',
		D2: 'reinforced_tube_section.svg',
		D3: 'reinforced_tube_section.svg',
		af: 'reinforced_tube_section.svg'
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
	const figTopExt = figure();
	const figTopInt = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1Li = param.D1L / 2 - param.E1;
		const aW22 = 2 * Math.asin(param.W22 / (2 * R1Li));
		const LextW22 = (aW22 * param.D1L) / 2;
		const LintW22 = aW22 * R1Li;
		const aN2 = (2 * Math.PI) / param.N2;
		const aWave = aN2 - 2 * aW22;
		const D2e = R1Li * aWave * 0.5; // approximate arbitrary value
		const R2e = D2e / 2;
		const R2i = R2e - param.E2;
		const R3i = (R2i * param.R32) / (100 - param.R32);
		const R3e = R3i + param.E2;
		const WaveCordeInt = aWave * R1Li;
		// step-5 : checks on the parameter values
		if (param.S23L < param.E2) {
			throw `err095: S23L ${param.S23L} is too small compare to E2 ${param.E2}`;
		}
		if (R1Li - param.S23L < 0) {
			throw `err098: D1L ${param.D1L} is too small compare to E1 ${param.E1} or E2 ${param.E2}`;
		}
		if (aWave < 0) {
			throw `err105: N2 ${param.N2} is too large compare to D1L ${param.D1L} and E1 ${param.E1}`;
		}
		if (WaveCordeInt < 2 * (R2e + R3e)) {
			if (param.S23L < 2 * (R2e + R3e)) {
				throw `err113: S23L ${param.S23L} is too small compare to D1L ${param.D1L} and N2 ${param.N2}`;
			}
		}
		// step-6 : any logs
		rGeome.logstr += `reinforced_tube internal-external diameter: D1Li: ${ffix(2 * R1Li)} mm\n`;
		rGeome.logstr += `W22: angle: ${ffix(radToDeg(aW22))} degree, corde-ext: ${ffix(LextW22)} mm, corde-int: ${ffix(LintW22)} mm\n`;
		rGeome.logstr += `W2: angle: ${ffix(radToDeg(2 * aW22))} degree, corde-ext: ${ffix(2 * LextW22)} mm, corde-int: ${ffix(2 * LintW22)} mm\n`;
		rGeome.logstr += `Wave: angle: ${ffix(radToDeg(aWave))} degree, corde-int: ${ffix(WaveCordeInt)} mm\n`;
		rGeome.logstr += `D2: ${ffix(2 * R2i)} mm, R2i: ${ffix(R2i)} mm, R2e: ${ffix(R2e)} mm\n`;
		rGeome.logstr += `D3: ${ffix(2 * R3i)} mm, R3i: ${ffix(R3i)} mm, R3e: ${ffix(R3e)} mm\n`;
		// step-7 : drawing of the figures
		// figTopExt
		figTopExt.addMain(contourCircle(0, 0, param.D1L / 2));
		figTopExt.addMain(contourCircle(0, 0, param.D1L / 2 - param.E1));
		// figTopInt
		figTopInt.addSecond(contourCircle(0, 0, param.D1L / 2));
		figTopInt.addSecond(contourCircle(0, 0, param.D1L / 2 - param.E1));
		// figSide
		figSide.addMain(ctrRectangle(-R1Li - param.E1, 0, param.E1, param.H1));
		figSide.addMain(ctrRectangle(R1Li, 0, param.E1, param.H1));
		// final figure list
		rGeome.fig = {
			faceTopExt: figTopExt,
			faceTopInt: figTopInt,
			faceSide: figSide
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_topExt`,
					face: `${designName}_faceTopExt`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_topExt`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'reinforced_tube drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const ReinforcedTubeDef: tPageDef = {
	pTitle: 'Reinforced tube',
	pDescription: 'A strong tube with less metal',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { ReinforcedTubeDef };
