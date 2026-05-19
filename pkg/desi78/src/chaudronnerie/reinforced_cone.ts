// reinforced_cone.ts
// a cone with wall internally reinforced

// step-1 : import from geometrix
import type {
	//tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tExtrude,
	//tSubInst,
	//tSubDesign,
	tPageDef
} from 'geometrix';
import {
	designParam,
	checkGeom,
	prefixLog,
	//point,
	//Point,
	//ShapePoint,
	//vector,
	//contour,
	//contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';

// design import
import { reinforcedTubeDef } from './reinforced_tube';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'reinforced_cone',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1L', 'mm', 1600, 100, 4000, 1),
		pNumber('D1H', 'mm', 1200, 100, 4000, 1),
		pNumber('H1', 'mm', 4000, 10, 20000, 10),
		pNumber('E1', 'mm', 10, 1, 300, 1),
		pSectionSeparator('Wave'),
		pNumber('E2', 'mm', 10, 1, 300, 1),
		pNumber('N2', 'wave', 20, 4, 400, 1),
		pDropdown('W2_method', ['W2_from_RW2', 'W2_direct'], 1),
		pNumber('RW2', '%', 50, 5, 95, 0.1),
		pNumber('W2', 'mm', 80, 1, 800, 1),
		pNumber('S23L', 'mm', 197, 1, 600, 1),
		pNumber('S23H', 'mm', 200, 1, 600, 1),
		pDropdown('D2_method', ['D2_from_Rvw', 'D2_direct'], 1),
		pNumber('Rvw', '%', 50, 5, 95, 0.1),
		pNumber('D2', 'mm', 30, 1, 600, 1),
		pDropdown('D3_method', ['D3_from_R32', 'D3_direct'], 1),
		pNumber('R32', '%', 50, 5, 95, 0.1),
		pNumber('D3', 'mm', 30, 1, 600, 1),
		pSectionSeparator('Optional internal cylinder'),
		pCheckbox('internal_cylinder', true),
		pNumber('E4', 'mm', 10, 1, 300, 1)
	],
	paramSvg: {
		D1L: 'reinforced_tube_section.svg',
		D1H: 'reinforced_cone_section_vertical.svg',
		H1: 'reinforced_tube_section.svg',
		E1: 'reinforced_tube_section.svg',
		E2: 'reinforced_tube_section.svg',
		N2: 'reinforced_tube_section.svg',
		W2_method: 'reinforced_tube_section.svg',
		RW2: 'reinforced_tube_section.svg',
		W2: 'reinforced_tube_section.svg',
		S23L: 'reinforced_tube_section.svg',
		S23H: 'reinforced_cone_section_vertical.svg',
		D2_method: 'reinforced_tube_section.svg',
		R32: 'reinforced_tube_section.svg',
		D2: 'reinforced_tube_section.svg',
		D3_method: 'reinforced_tube_section.svg',
		Rvw: 'reinforced_tube_section.svg',
		D3: 'reinforced_tube_section.svg',
		internal_cylinder: 'reinforced_tube_section.svg',
		E4: 'reinforced_tube_section.svg'
	},
	sim: {
		tMax: 100,
		tStep: 2.0,
		tUpdate: 500 // every 0.5 second
	}
};

// externalized function
function strToCorde(iStr: string): number {
	const re1 = /info255/;
	const line = iStr.split('\n').reduce((acc, curr) => (re1.test(curr) ? curr : acc), '');
	const rValue = parseFloat(line.replace(/^.*length:/, '').replace(/mm,.*$/, ''));
	return rValue;
}

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figTopWave = figure();
	const figTopWaveH = figure();
	const figTopWaveL = figure();
	const figSideExt = figure();
	const figSideInt = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1L = param.D1L / 2;
		const R1H = param.D1H / 2;
		const R1HL = R1L - R1H;
		const cyl1Len = Math.sqrt(R1HL ** 2 + param.H1 ** 2);
		const cyl1A = Math.atan2(R1HL, param.H1);
		const E1h = param.E1 / Math.cos(cyl1A);
		const R4L = R1L - E1h - param.S23L;
		const R4H = R1H - E1h - param.S23H;
		const R4HL = R4L - R4H;
		const cyl4Len = Math.sqrt(R4HL ** 2 + param.H1 ** 2);
		const cyl4A = Math.atan2(R4HL, param.H1);
		const E4h = param.E4 / Math.cos(cyl4A);
		const R1t = (R1H * t) / 100.0 + (R1L * (100 - t)) / 100.0;
		const S23t = (param.S23H * t) / 100.0 + (param.S23L * (100 - t)) / 100.0;
		// step-5 : checks on the parameter values
		if (R4L - E4h < 0) {
			throw `err118: D1L ${param.D1L} is too small compare to S23L ${param.S23L}`;
		}
		if (R4H - E4h < 0) {
			throw `err121: D1H ${param.D1H} is too small compare to S23H ${param.S23H}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Cylinder-1 (Ext): R1H: ${ffix(R1H)} mm, D1H: ${ffix(2 * R1H)} mm\n`;
		rGeome.logstr += `Cylinder-1 (Ext): R1L: ${ffix(R1L)} mm, D1L: ${ffix(2 * R1L)} mm\n`;
		rGeome.logstr += `Cylinder-1 (Ext): angle: ${ffix(radToDeg(cyl1A))} degree, length: ${ffix(cyl1Len)} mm\n`;
		if (param.internal_cylinder === 1) {
			rGeome.logstr += `Cylinder-4 (Int): R4H: ${ffix(R4H)} mm, D4H: ${ffix(2 * R4H)} mm\n`;
			rGeome.logstr += `Cylinder-4 (Int): R4L: ${ffix(R4L)} mm, D4L: ${ffix(2 * R4L)} mm\n`;
			rGeome.logstr += `Cylinder-4 (Int): angle: ${ffix(radToDeg(cyl4A))} degree, length: ${ffix(cyl4Len)} mm\n`;
		}
		rGeome.logstr += `Section horizontal: R1t: ${ffix(R1t)} mm, S23t: ${ffix(S23t)} mm\n`;
		// step-7 : drawing of the figures
		// sub-desingn
		const reinTubeParam = designParam(reinforcedTubeDef.pDef, '');
		reinTubeParam.setVal('D1L', 2 * R1t);
		reinTubeParam.setVal('H1', param.H1);
		reinTubeParam.setVal('E1', param.E1);
		reinTubeParam.setVal('E2', param.E2);
		reinTubeParam.setVal('N2', param.N2);
		reinTubeParam.setVal('W2_method', param.W2_method);
		reinTubeParam.setVal('RW2', param.RW2);
		reinTubeParam.setVal('W2', param.W2);
		reinTubeParam.setVal('S23L', S23t);
		reinTubeParam.setVal('D2_method', param.D2_method);
		reinTubeParam.setVal('R32', param.R32);
		reinTubeParam.setVal('D2', param.D2);
		reinTubeParam.setVal('D3_method', param.D3_method);
		reinTubeParam.setVal('Rvw', param.Rvw);
		reinTubeParam.setVal('D3', param.D3);
		reinTubeParam.setVal('internal_cylinder', param.internal_cylinder);
		reinTubeParam.setVal('E4', param.E4);
		const reinTubeGeom = reinforcedTubeDef.pGeom(
			0,
			reinTubeParam.getParamVal(),
			reinTubeParam.getSuffix()
		);
		checkGeom(reinTubeGeom);
		const cordeLenT = strToCorde(reinTubeGeom.logstr);
		rGeome.logstr += prefixLog(reinTubeGeom.logstr, reinTubeParam.getPartNameSuffix());
		// figTopWave
		figTopWave.mergeFigure(reinTubeGeom.fig.faceTopWave);
		// figSideExt
		figSideExt.addMainO(
			ctrRectangle(R1L - param.E1, 0, param.E1, cyl1Len).rotate(R1L, 0, cyl1A)
		);
		figSideExt.addSecond(ctrRectangle(-R1L, 0, param.E1, cyl1Len).rotate(-R1L, 0, -cyl1A));
		if (param.internal_cylinder === 1) {
			figSideExt.addSecond(
				ctrRectangle(R4L - param.E4, 0, param.E4, cyl4Len).rotate(R4L, 0, cyl4A)
			);
			figSideExt.addSecond(ctrRectangle(-R4L, 0, param.E4, cyl4Len).rotate(-R4L, 0, -cyl4A));
		}
		// figSideInt
		figSideInt.mergeFigure(figSideExt, true);
		if (param.internal_cylinder === 1) {
			figSideInt.addMainO(
				ctrRectangle(R4L - param.E4, 0, param.E4, cyl4Len).rotate(R4L, 0, cyl4A)
			);
		}
		// extra: more logs
		reinTubeParam.setVal('D1L', param.D1L);
		reinTubeParam.setVal('S23L', param.S23L);
		const reinTubeGeomL = reinforcedTubeDef.pGeom(0, reinTubeParam.getParamVal(), '');
		checkGeom(reinTubeGeomL);
		const cordeLenL = strToCorde(reinTubeGeomL.logstr);
		rGeome.logstr += `wave-low-corde length: ${ffix(cordeLenL)} mm\n`;
		reinTubeParam.setVal('D1L', param.D1H);
		reinTubeParam.setVal('S23L', param.S23H);
		const reinTubeGeomH = reinforcedTubeDef.pGeom(0, reinTubeParam.getParamVal(), '');
		checkGeom(reinTubeGeomH);
		const cordeLenH = strToCorde(reinTubeGeomH.logstr);
		rGeome.logstr += `wave-high-corde length: ${ffix(cordeLenH)} mm\n`;
		rGeome.logstr += `wave-corde low-high-diff: ${ffix(cordeLenL - cordeLenH)} mm\n`;
		const cordeLenExpected = (cordeLenH * t) / 100.0 + (cordeLenL * (100 - t)) / 100.0;
		rGeome.logstr += `wave-corde at t: ${ffix(t)} %, expected length: ${ffix(cordeLenExpected)} mm\n`;
		rGeome.logstr += `wave-corde-t length: ${ffix(cordeLenT)} mm, diff: ${ffix(cordeLenT - cordeLenExpected)} mm\n`;
		// figTopWaveH
		figTopWaveH.mergeFigure(reinTubeGeomH.fig.faceTopWave);
		// figTopWaveL
		figTopWaveL.mergeFigure(reinTubeGeomL.fig.faceTopWave);
		// final figure list
		rGeome.fig = {
			faceTopWave: figTopWave,
			faceSideExt: figSideExt,
			faceSideInt: figSideInt,
			faceTopWaveH: figTopWaveH,
			faceTopWaveL: figTopWaveL
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		const optExtrudes: tExtrude[] = [];
		const optVolumeNames: string[] = [];
		if (param.internal_cylinder === 1) {
			const tmpVol: tExtrude = {
				outName: `subpax_${designName}_SideInt`,
				face: `${designName}_faceSideInt`,
				extrudeMethod: EExtrude.eRotate,
				rotate: [0, 0, 0],
				translate: [0, 0, 0]
			};
			optExtrudes.push(tmpVol);
			optVolumeNames.push(`subpax_${designName}_SideInt`);
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_SideExt`,
					face: `${designName}_faceSideExt`,
					extrudeMethod: EExtrude.eRotate,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				...optExtrudes
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_SideExt`, ...optVolumeNames]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'reinforced_cone drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const reinforcedConeDef: tPageDef = {
	pTitle: 'Reinforced cone',
	pDescription: 'A strong cone with less metal',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { reinforcedConeDef };
