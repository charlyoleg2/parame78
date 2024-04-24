// cabane.ts
// une cabane pour les enfants

// step-1 : import from geometrix
import type {
	tContour,
	tParamDef,
	tParamVal,
	tGeom,
	//tExtrude,
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
	contour,
	//contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';

// design import
import { cabanePlancherDef } from './cabane_plancher';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'cabane',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('W1', 'mm', 1600, 100, 4000, 1),
		pNumber('W2', 'mm', 2600, 100, 4000, 1),
		pNumber('H1', 'mm', 400, 10, 2000, 10),
		pNumber('T1', 'mm', 20, 1, 300, 1),
		pSectionSeparator('Face'),
		pNumber('RCz', 'mm', 2000, 100, 4000, 1),
		pNumber('RCx', 'mm', 0, -2000, 2000, 1),
		pNumber('RLz', 'mm', 1200, 100, 4000, 1),
		pNumber('RLx', 'mm', 400, 100, 2000, 1),
		pNumber('RLe', 'mm', 200, 0, 2000, 1),
		pNumber('RRz', 'mm', 900, 100, 4000, 1),
		pNumber('RRx', 'mm', 200, 100, 2000, 1),
		pNumber('RRe', 'mm', 100, 0, 2000, 1),
		pSectionSeparator('Roof top'),
		pNumber('RCyf', 'mm', 500, 0, 2000, 1),
		pNumber('RCyb', 'mm', 300, 0, 2000, 1),
		pNumber('RLyf', 'mm', 400, 0, 2000, 1),
		pNumber('RLyb', 'mm', 200, 0, 2000, 1),
		pNumber('RRyf', 'mm', 300, 0, 2000, 1),
		pNumber('RRyb', 'mm', 100, 0, 2000, 1),
		pNumber('RoR', 'mm', 300, 0, 500, 1),
		pSectionSeparator('Door'),
		pNumber('DPL', 'mm', -100, -2000, 2000, 1),
		pNumber('DW', 'mm', 600, 100, 3000, 1),
		pNumber('DLz', 'mm', 900, 100, 4000, 1),
		pNumber('DLx', 'mm', 200, 100, 1000, 1),
		pNumber('DCz', 'mm', 1500, 100, 4000, 1),
		pNumber('DCx', 'mm', 300, 100, 1000, 1),
		pNumber('DRz', 'mm', 700, 100, 4000, 1),
		pNumber('DRx', 'mm', 200, 100, 1000, 1),
		pNumber('DR', 'mm', 200, 0, 500, 1),
		pSectionSeparator('Window'),
		pNumber('Fz1', 'mm', 700, 0, 3000, 1),
		pNumber('Fz2', 'mm', 700, 10, 3000, 1),
		pNumber('FSx', 'mm', 100, -1000, 1000, 1),
		pNumber('FWL', 'mm', 500, 10, 1000, 1),
		pNumber('FWH', 'mm', 700, 10, 1000, 1),
		pNumber('FPLx', 'mm', -700, -3000, 3000, 1),
		pNumber('FR', 'mm', 100, 0, 500, 1)
	],
	paramSvg: {
		W1: 'cabane_face.svg',
		W2: 'cabane_side.svg',
		H1: 'cabane_face.svg',
		T1: 'cabane_face.svg',
		RCz: 'cabane_face.svg',
		RCx: 'cabane_face.svg',
		RLz: 'cabane_face.svg',
		RLx: 'cabane_face.svg',
		RLe: 'cabane_face.svg',
		RRz: 'cabane_face.svg',
		RRx: 'cabane_face.svg',
		RRe: 'cabane_face.svg',
		RCyf: 'cabane_side.svg',
		RCyb: 'cabane_side.svg',
		RLyf: 'cabane_side.svg',
		RLyb: 'cabane_side.svg',
		RRyf: 'cabane_side.svg',
		RRyb: 'cabane_side.svg',
		RoR: 'cabane_side.svg',
		DPL: 'cabane_face.svg',
		DW: 'cabane_face.svg',
		DLz: 'cabane_face.svg',
		DLx: 'cabane_face.svg',
		DCz: 'cabane_face.svg',
		DCx: 'cabane_face.svg',
		DRz: 'cabane_face.svg',
		DRx: 'cabane_face.svg',
		DR: 'cabane_face.svg',
		Fz1: 'cabane_face.svg',
		Fz2: 'cabane_face.svg',
		FSx: 'cabane_face.svg',
		FWL: 'cabane_face.svg',
		FWH: 'cabane_face.svg',
		FPLx: 'cabane_face.svg',
		FR: 'cabane_face.svg'
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
	const figTop = figure();
	const figFaceFront = figure();
	const figFaceBack = figure();
	const figFaceRoof = figure();
	const figFaceSide = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const cpl_N1 = 8;
		const cpl_N2 = 13;
		const cpl_ES = 0.2;
		const cpl_W1 = (param.W1 - (cpl_N1 - 1) * cpl_ES) / cpl_N1;
		const cpl_W2 = (param.W2 - (cpl_N2 - 1) * cpl_ES) / cpl_N2;
		const paramA = cpl_N1 * cpl_W1 + (cpl_N1 - 1) * cpl_ES;
		const paramB = cpl_N2 * cpl_W2 + (cpl_N2 - 1) * cpl_ES;
		const goldenRatio = 1.618;
		const ratioBA = paramB / paramA;
		const cpl_W = param.W1 / 20;
		const wall_z0 = param.H1 + 2 * param.T1;
		const door_x0 = param.W1 / 2 + param.DPL;
		const roofLA = Math.atan2(param.RCz - param.RLz, param.W1 / 2 + param.RCx + param.RLx);
		const roofRA = Math.atan2(param.RCz - param.RRz, param.W1 / 2 - param.RCx + param.RRx);
		const dRLx = param.T1 * Math.cos(roofLA - Math.PI / 2);
		const dRLz = -param.T1 * Math.sin(roofLA - Math.PI / 2);
		const dRRx = param.T1 * Math.cos(roofRA - Math.PI / 2);
		const dRRz = -param.T1 * Math.sin(roofRA - Math.PI / 2);
		const dRCzL = param.T1 / Math.sin(Math.PI / 2 - roofLA);
		const dRCzR = param.T1 / Math.sin(Math.PI / 2 - roofRA);
		const dRILx = param.RLe - dRLx;
		const dRILz = dRILx * Math.tan(roofLA);
		const dRIRx = param.RRe - dRRx;
		const dRIRz = dRIRx * Math.tan(roofRA);
		const RILx = -param.RLx + param.RLe;
		const RILz = wall_z0 + param.RLz - dRLz + dRILz;
		const RIRx = param.W1 + param.RRx - param.RRe;
		const RIRz = wall_z0 + param.RRz - dRRz + dRIRz;
		//rGeome.logstr += `dbg164: ${RILx}, ${RILz}, ${RIRx}, ${RIRz}\n`;
		const wallLA = Math.atan2(RILz - wall_z0, -RILx);
		const wallRA = Math.atan2(RIRz - wall_z0, RIRx - param.W1);
		const dFWLxL = param.T1 / Math.sin(wallLA);
		const dFWLxR = param.T1 / Math.sin(wallRA);
		const dFWHWL = param.T1 / Math.cos(roofLA - Math.PI / 2 + wallLA);
		const dFWHWR = param.T1 / Math.cos(roofRA - Math.PI / 2 + wallRA);
		const dFWHxL = dFWHWL * Math.cos(roofLA);
		const dFWHzL = dFWHWL * Math.sin(roofLA);
		const dFWHxR = dFWHWR * Math.cos(roofRA);
		const dFWHzR = dFWHWR * Math.sin(roofRA);
		//rGeome.logstr += `dbg183: ${dFWLxL}, ${dFWHzL}, ${dFWHWL}, ${dFWHWR}\n`;
		const win_x0 = param.W1 / 2 + param.FPLx;
		// step-5 : checks on the parameter values
		// step-6 : any logs
		rGeome.logstr += `cabane-plancher-size: A: ${ffix(paramA)} m, B: ${ffix(paramB)} m, surface: ${ffix(paramA * paramB)} m2\n`;
		rGeome.logstr += `Comparison with the golden-ratio: B/A: ${ffix(ratioBA)}   ${ffix((100 * ratioBA) / goldenRatio)} %\n`;
		rGeome.logstr += `roof angles: left: ${ffix(radToDeg(roofLA))} degree, right: ${ffix(radToDeg(roofRA))} degree\n`;
		rGeome.logstr += `side-wall angles: left: ${ffix(radToDeg(wallLA))} degree, right: ${ffix(radToDeg(wallRA))} degree\n`;
		// step-7 : drawing of the figures
		// sub-desingn
		const plancherParam = designParam(cabanePlancherDef.pDef, '');
		plancherParam.setVal('N1', cpl_N1);
		plancherParam.setVal('W1', cpl_W1);
		plancherParam.setVal('N2', cpl_N2);
		plancherParam.setVal('W2', cpl_W2);
		plancherParam.setVal('H1', param.H1);
		plancherParam.setVal('H2', cpl_W);
		plancherParam.setVal('H3', cpl_W);
		plancherParam.setVal('W3', cpl_W);
		plancherParam.setVal('a1', 80);
		plancherParam.setVal('W4', cpl_W);
		plancherParam.setVal('W5', cpl_W - 1);
		plancherParam.setVal('E1', cpl_W);
		plancherParam.setVal('T1', param.T1);
		plancherParam.setVal('ES1', cpl_ES);
		plancherParam.setVal('ES2', cpl_ES);
		plancherParam.setVal('S1', 2 * cpl_W);
		plancherParam.setVal('S2', cpl_W);
		const plancherGeom = cabanePlancherDef.pGeom(
			0,
			plancherParam.getParamVal(),
			plancherParam.getSuffix()
		);
		checkGeom(plancherGeom);
		rGeome.logstr += prefixLog(plancherGeom.logstr, plancherParam.getPartNameSuffix());
		// figTop
		figTop.mergeFigure(plancherGeom.fig.facePlancherTop, true);
		const ctrRoof = contour(-param.RLyb, -param.RLx)
			.addCornerRounded(param.RoR)
			.addSegStrokeA(param.W2 + param.RLyf, -param.RLx)
			.addCornerRounded(param.RoR)
			.addSegStrokeA(param.W2 + param.RCyf, param.W1 / 2 + param.RCx)
			.addCornerRounded(param.RoR)
			.addSegStrokeA(param.W2 + param.RRyf, param.W1 + param.RRx)
			.addCornerRounded(param.RoR)
			.addSegStrokeA(-param.RRyb, param.W1 + param.RRx)
			.addCornerRounded(param.RoR)
			.addSegStrokeA(-param.RCyb, param.W1 / 2 + param.RCx)
			.addCornerRounded(param.RoR)
			.closeSegStroke();
		figTop.addMain(ctrRoof);
		const ctrRoofSub = ctrRectangle(
			0,
			-param.RLx + param.RLe,
			param.W2,
			param.W1 + param.RLx + param.RRx - param.RLe - param.RRe
		);
		const ctrRoofSubInt = ctrRectangle(
			param.T1,
			-param.RLx + param.RLe + param.T1,
			param.W2 - 2 * param.T1,
			param.W1 + param.RLx + param.RRx - param.RLe - param.RRe - 2 * param.T1
		);
		figTop.addSecond(ctrRoofSub);
		figTop.addSecond(ctrRoofSubInt);
		// figFaceFront
		figFaceFront.mergeFigure(plancherGeom.fig.faceBeam, true);
		const ctrWallFace = function (door: boolean): tContour {
			const rCtr = contour(0, wall_z0);
			if (door) {
				rCtr.addSegStrokeA(door_x0, wall_z0)
					.addSegStrokeA(door_x0 - param.DLx, wall_z0 + param.DLz)
					.addCornerRounded(param.DR)
					.addSegStrokeA(door_x0 + param.DCx, wall_z0 + param.DCz)
					.addCornerRounded(param.DR)
					.addSegStrokeA(door_x0 + param.DW + param.DRx, wall_z0 + param.DRz)
					.addCornerRounded(param.DR)
					.addSegStrokeA(door_x0 + param.DW, wall_z0);
			}
			rCtr.addSegStrokeA(param.W1, wall_z0)
				.addSegStrokeA(RIRx, RIRz)
				.addSegStrokeA(param.W1 / 2 + param.RCx, wall_z0 + param.RCz - dRCzR);
			if (dRCzL !== dRCzR) {
				rCtr.addSegStrokeA(param.W1 / 2 + param.RCx, wall_z0 + param.RCz - dRCzL);
			}
			rCtr.addSegStrokeA(RILx, RILz).closeSegStroke();
			return rCtr;
		};
		const ctrFaceF = ctrWallFace(true);
		const ctrFaceB = ctrWallFace(false);
		const ctrFaceRoof = contour(param.W1 / 2 + param.RCx, wall_z0 + param.RCz)
			.addSegStrokeA(-param.RLx, wall_z0 + param.RLz)
			.addSegStrokeA(-param.RLx + dRLx, wall_z0 + param.RLz - dRLz)
			.addSegStrokeA(param.W1 / 2 + param.RCx, wall_z0 + param.RCz - dRCzL);
		if (dRCzL !== dRCzR) {
			ctrFaceRoof.addSegStrokeA(param.W1 / 2 + param.RCx, wall_z0 + param.RCz - dRCzR);
		}
		ctrFaceRoof
			.addSegStrokeA(param.W1 + param.RRx - dRRx, wall_z0 + param.RRz - dRRz)
			.addSegStrokeA(param.W1 + param.RRx, wall_z0 + param.RRz)
			.closeSegStroke();
		const ctrFaceWindow = contour(win_x0, wall_z0 + param.Fz1)
			.addCornerRounded(param.FR)
			.addSegStrokeA(win_x0 + param.FWL, wall_z0 + param.Fz1)
			.addCornerRounded(param.FR)
			.addSegStrokeA(win_x0 + param.FSx + param.FWH, wall_z0 + param.Fz1 + param.Fz2)
			.addCornerRounded(param.FR)
			.addSegStrokeA(win_x0 + param.FSx, wall_z0 + param.Fz1 + param.Fz2)
			.addCornerRounded(param.FR)
			.closeSegStroke();
		const ctrFaceL = contour(0, wall_z0)
			.addSegStrokeA(dFWLxL, wall_z0)
			.addSegStrokeA(RILx + dFWHxL, RILz + dFWHzL)
			.addSegStrokeA(RILx, RILz)
			.closeSegStroke();
		const ctrFaceR = contour(param.W1, wall_z0)
			.addSegStrokeA(RIRx, RIRz)
			.addSegStrokeA(RIRx - dFWHxR, RIRz + dFWHzR)
			.addSegStrokeA(param.W1 - dFWLxR, wall_z0)
			.closeSegStroke();
		figFaceFront.addMain(ctrFaceF);
		figFaceFront.addSecond(ctrFaceWindow);
		figFaceFront.addSecond(ctrFaceRoof);
		figFaceFront.addSecond(ctrFaceL);
		figFaceFront.addSecond(ctrFaceR);
		// figFaceBack
		figFaceBack.mergeFigure(plancherGeom.fig.faceBeam, true);
		figFaceBack.addMain(ctrFaceB);
		figFaceBack.addMain(ctrFaceWindow);
		figFaceBack.addSecond(ctrFaceRoof);
		figFaceBack.addSecond(ctrFaceL);
		figFaceBack.addSecond(ctrFaceR);
		// figFaceRoof
		figFaceRoof.mergeFigure(plancherGeom.fig.faceBeam, true);
		figFaceRoof.addSecond(ctrFaceF);
		figFaceRoof.addSecond(ctrFaceWindow);
		figFaceRoof.addMain(ctrFaceRoof);
		figFaceRoof.addSecond(ctrFaceL);
		figFaceRoof.addSecond(ctrFaceR);
		// figFaceSide
		figFaceSide.mergeFigure(plancherGeom.fig.faceBeam, true);
		figFaceSide.addSecond(ctrFaceF);
		figFaceSide.addSecond(ctrFaceWindow);
		figFaceSide.addSecond(ctrFaceRoof);
		figFaceSide.addMain(ctrFaceL);
		figFaceSide.addMain(ctrFaceR);
		// figSide
		figSide.mergeFigure(plancherGeom.fig.faceSide, true);
		const ctrSideCB = contour(0, wall_z0)
			.addSegStrokeA(param.T1, wall_z0)
			.addSegStrokeA(param.T1, wall_z0 + param.RCz - dRCzL)
			.addSegStrokeA(0, wall_z0 + param.RCz - dRCzL)
			.closeSegStroke();
		const ctrSideCF = contour(param.W2 - param.T1, wall_z0)
			.addSegStrokeA(param.W2, wall_z0)
			.addSegStrokeA(param.W2, wall_z0 + param.RCz - dRCzL)
			.addSegStrokeA(param.W2 - param.T1, wall_z0 + param.RCz - dRCzL)
			.closeSegStroke();
		const ctrSideL = contour(0, wall_z0)
			.addSegStrokeA(param.W2, wall_z0)
			.addSegStrokeA(param.W2, RILz)
			.addSegStrokeA(0, RILz)
			.closeSegStroke();
		const ctrSideR = contour(0, wall_z0)
			.addSegStrokeA(param.W2, wall_z0)
			.addSegStrokeA(param.W2, RIRz)
			.addSegStrokeA(0, RIRz)
			.closeSegStroke();
		const ctrSideRoofL = contour(-param.RCyb, wall_z0 + param.RCz)
			.addSegStrokeA(-param.RLyb, wall_z0 + param.RLz)
			.addSegStrokeA(param.W2 + param.RLyf, wall_z0 + param.RLz)
			.addSegStrokeA(param.W2 + param.RCyf, wall_z0 + param.RCz)
			.closeSegStroke();
		const ctrSideRoofR = contour(-param.RCyb, wall_z0 + param.RCz)
			.addSegStrokeA(-param.RRyb, wall_z0 + param.RRz)
			.addSegStrokeA(param.W2 + param.RRyf, wall_z0 + param.RRz)
			.addSegStrokeA(param.W2 + param.RCyf, wall_z0 + param.RCz)
			.closeSegStroke();
		figSide.addSecond(ctrSideCF);
		figSide.addSecond(ctrSideCB);
		figSide.addSecond(ctrSideR);
		figSide.addSecond(ctrSideRoofR);
		figSide.addMain(ctrSideL);
		figSide.addMain(ctrSideRoofL);
		// final figure list
		rGeome.fig = {
			faceTop: figTop,
			faceFaceFront: figFaceFront,
			faceFaceBack: figFaceBack,
			faceFaceRoof: figFaceRoof,
			faceFaceSide: figFaceSide,
			faceSide: figSide
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			inherits: [
				{
					outName: `inpax_${designName}_plancher`,
					subdesign: 'pax_cabane_plancher',
					subgeom: plancherGeom,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			extrudes: [
				{
					outName: `subpax_${designName}_roof`,
					face: `${designName}_faceFaceRoof`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W2,
					rotate: [Math.PI / 2, 0, Math.PI / 2],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_Wfront`,
					face: `${designName}_faceFaceFront`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [Math.PI / 2, 0, Math.PI / 2],
					translate: [param.W2 - param.T1, 0, 0]
				},
				{
					outName: `subpax_${designName}_Wback`,
					face: `${designName}_faceFaceBack`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.T1,
					rotate: [Math.PI / 2, 0, Math.PI / 2],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_Wside`,
					face: `${designName}_faceFaceSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W2,
					rotate: [Math.PI / 2, 0, Math.PI / 2],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`inpax_${designName}_plancher`,
						`subpax_${designName}_roof`,
						`subpax_${designName}_Wfront`,
						`subpax_${designName}_Wback`,
						`subpax_${designName}_Wside`
					]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {
			thePlancher: {
				partName: plancherParam.getPartName(),
				dparam: plancherParam.getDesignParamList(),
				orientation: [0, 0, 0],
				position: [0, 0, 567]
			}
		};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'cabane drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const cabaneDef: tPageDef = {
	pTitle: 'Cabane',
	pDescription: 'La cabane des enfants',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { cabaneDef };
