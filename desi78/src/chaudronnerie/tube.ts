// tube.ts
// a reinforced tube

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
	//designParam,
	//checkGeom,
	//prefixLog,
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

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'tube',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1L', 'mm', 1600, 100, 4000, 1),
		pNumber('H1', 'mm', 6000, 10, 2000, 10),
		pNumber('E1', 'mm', 20, 1, 300, 1),
		pSectionSeparator('Reinforcement'),
		pNumber('E2', 'mm', 20, 1, 300, 1),
		pNumber('N2', 'wave', 20, 4, 400, 1),
		pNumber('R23', '%', 50, 10, 90, 0.1),
		pNumber('S23L', 'mm', 0, 0, 200, 1)
	],
	paramSvg: {
		D1L: 'tube_section.svg',
		H1: 'tube_section.svg',
		E1: 'tube_section.svg',
		E2: 'tube_section_detail.svg',
		N2: 'tube_section.svg',
		R23: 'tube_section.svg',
		S23L: 'tube_section.svg'
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
		const roofMaxB = Math.max(param.RCyb, param.RRyb, param.RLyb);
		const roofMaxF = Math.max(param.RCyf, param.RRyf, param.RLyf);
		const roofMaxL = roofMaxB + roofMaxF + param.W2;
		// step-5 : checks on the parameter values
		// step-6 : any logs
		rGeome.logstr += `cabane-plancher-size: A: ${ffix(paramA)} m, B: ${ffix(paramB)} m, surface: ${ffix(paramA * paramB)} m2\n`;
		rGeome.logstr += `Comparison with the golden-ratio: B/A: ${ffix(ratioBA)}   ${ffix((100 * ratioBA) / goldenRatio)} %\n`;
		rGeome.logstr += `roof angles: left: ${ffix(radToDeg(roofLA))} degree, right: ${ffix(radToDeg(roofRA))} degree\n`;
		rGeome.logstr += `side-wall angles: left: ${ffix(radToDeg(wallLA))} degree, right: ${ffix(radToDeg(wallRA))} degree\n`;
		rGeome.logstr += `roof: length-max: ${ffix(roofMaxL)} mm, back-max: ${ffix(roofMaxB)} mm, front-max: ${ffix(roofMaxF)} mm\n`;
		// step-7 : drawing of the figures
		// figTop
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
		figFaceBack.addMain(ctrFaceB);
		figFaceBack.addMain(ctrFaceWindow);
		figFaceBack.addSecond(ctrFaceRoof);
		figFaceBack.addSecond(ctrFaceL);
		figFaceBack.addSecond(ctrFaceR);
		// figFaceRoof
		figFaceRoof.addSecond(ctrFaceF);
		figFaceRoof.addSecond(ctrFaceWindow);
		figFaceRoof.addMain(ctrFaceRoof);
		figFaceRoof.addSecond(ctrFaceL);
		figFaceRoof.addSecond(ctrFaceR);
		// figFaceSide
		figFaceSide.addSecond(ctrFaceF);
		figFaceSide.addSecond(ctrFaceWindow);
		figFaceSide.addSecond(ctrFaceRoof);
		figFaceSide.addMain(ctrFaceL);
		figFaceSide.addMain(ctrFaceR);
		// figSide
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
			extrudes: [
				{
					outName: `subpax_${designName}_roofTop`,
					face: `${designName}_faceTop`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: wall_z0 + param.RCz,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_roofMax`,
					face: `${designName}_faceFaceRoof`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: roofMaxL,
					rotate: [Math.PI / 2, 0, Math.PI / 2],
					translate: [-roofMaxB, 0, 0]
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
					outName: `ipax_${designName}_roof`,
					boolMethod: EBVolume.eIntersection,
					inList: [`subpax_${designName}_roofMax`, `subpax_${designName}_roofTop`]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`inpax_${designName}_plancher`,
						`ipax_${designName}_roof`,
						`subpax_${designName}_Wfront`,
						`subpax_${designName}_Wback`,
						`subpax_${designName}_Wside`
					]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'reinforced tube drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const tubeDef: tPageDef = {
	pTitle: 'Reinforced tube',
	pDescription: 'A strong tube with less metal',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { tubeDef };
