// armChain.ts
// a chain of a armBones, i.e. a robot arm

// step-1 : import from geometrix
import type {
	//Contour,
	//tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	//tExtrude,
	tPageDef,
	tSubInst
	//tSubDesign
} from 'geometrix';
import {
	designParam,
	checkGeom,
	prefixLog,
	//point,
	//Point,
	//ShapePoint,
	//line,
	//vector,
	//contour,
	//contourCircle,
	//ctrRectangle,
	figure,
	degToRad,
	//radToDeg,
	//pointCoord,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	transform2d,
	transform3d,
	//EExtrude,
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
import { armAxisDef } from './armAxis';
import { armEndDef } from './armEnd';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'armChain',
	params: [
		//pNumber(name, unit, init, min, max, step)
		//pNumber('W11A', 'mm', 50, 1, 500, 1),
		//pNumber('W11B', 'mm', 50, 1, 500, 1),
		//pNumber('W21A', 'mm', 50, 1, 500, 1),
		//pNumber('W21B', 'mm', 50, 1, 500, 1),
		pNumber('W12A', 'mm', 60, 1, 500, 1),
		pNumber('W22A', 'mm', 60, 1, 500, 1),
		pNumber('W12B', 'mm', 60, 1, 500, 1),
		//pNumber('W22B', 'mm', 60, 1, 500, 1),
		pSectionSeparator('Side'),
		pNumber('L11', 'mm', 50, 1, 500, 1),
		pNumber('L12', 'mm', 50, 1, 500, 1),
		pNumber('L21', 'mm', 50, 1, 500, 1),
		pNumber('L22', 'mm', 50, 1, 500, 1),
		pNumber('D1', 'mm', 40, 1, 200, 1),
		pNumber('S1', 'mm', 10, 1, 200, 1),
		pSectionSeparator('Axis'),
		pNumber('Taxis', 'mm', 3, 0.5, 10, 0.25),
		pNumber('D2axis', 'mm', 10, 0, 200, 1),
		pNumber('D3axis', 'mm', 20, 0, 200, 1),
		pSectionSeparator('Hollow'),
		pNumber('D12', 'mm', 20, 0, 200, 1),
		pNumber('D13A', 'mm', 30, 0, 200, 1),
		pNumber('D13B', 'mm', 30, 0, 200, 1),
		pNumber('D22', 'mm', 20, 0, 200, 1),
		pNumber('D23A', 'mm', 30, 0, 200, 1),
		pNumber('D23B', 'mm', 30, 0, 200, 1),
		pSectionSeparator('Thickness and corners'),
		pNumber('T1', 'mm', 3, 0.5, 10, 0.25),
		pNumber('J1mark', 'mm', 1, 0, 20, 0.1),
		pNumber('J1radius', 'mm', 5, 0, 50, 1),
		pNumber('J1neutral', '%', 50, 0, 100, 1),
		pNumber('T2', 'mm', 3, 0.5, 10, 0.25),
		pNumber('J2mark', 'mm', 1, 0, 20, 0.1),
		pNumber('J2radius', 'mm', 5, 0, 50, 1),
		pNumber('J2neutral', '%', 50, 0, 100, 1),
		pNumber('E12', 'mm', 1, 0, 10, 0.1),
		pSectionSeparator('Joint angle'),
		pNumber('JointA', 'degree', 0, -90, 90, 1)
	],
	paramSvg: {
		W12A: 'armJoint_section.svg',
		W22A: 'armJoint_section.svg',
		W12B: 'armJoint_section.svg',
		//W22B: 'armJoint_section.svg',
		L11: 'armJoint_side.svg',
		L12: 'armJoint_side.svg',
		D1: 'armJoint_side.svg',
		S1: 'armJoint_side.svg',
		Taxis: 'armJoint_side.svg',
		D2axis: 'armJoint_side.svg',
		D3axis: 'armJoint_side.svg',
		D12: 'armJoint_side.svg',
		D13A: 'armJoint_side.svg',
		D13B: 'armJoint_top.svg',
		D22: 'armJoint_side.svg',
		D23A: 'armJoint_side.svg',
		D23B: 'armJoint_top.svg',
		T1: 'armJoint_top.svg',
		T2: 'armJoint_top.svg',
		J1mark: 'armJoint_section.svg',
		J1radius: 'armJoint_section.svg',
		J1neutral: 'armJoint_section.svg',
		J2mark: 'armJoint_section.svg',
		J2radius: 'armJoint_section.svg',
		J2neutral: 'armJoint_section.svg',
		E12: 'armJoint_section.svg',
		JointA: 'armJoint_side.svg'
	},
	sim: {
		tMax: 360,
		tStep: 1,
		tUpdate: 500 // every 0.5 second
	}
};

function timeToAngle(iTime: number): number {
	let rAngle = iTime;
	if (iTime > 90) {
		if (iTime < 270) {
			rAngle = 180 - iTime;
		} else {
			rAngle = iTime - 360;
		}
	}
	return rAngle;
}

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figSide = figure();
	const figTop = figure();
	const figSection = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const aJ1n = param.J1neutral / 100;
		const aJ2n = param.J2neutral / 100;
		const J1Rext = param.J1radius + param.T1 * (1 - aJ1n);
		const J2Rext = param.J2radius + param.T2 * (1 - aJ2n);
		const W11A = param.W12A - 2 * J1Rext;
		const W11B = param.W12B - 2 * J1Rext;
		const W21A = param.W22A - 2 * J2Rext;
		const W22B = param.W12B - 2 * param.T1 - 2 * param.E12;
		const W21B = W22B - 2 * J2Rext;
		const L1total = param.L11 + param.L12 + param.D1 / 2 + param.S1;
		const L2total = param.L21 + param.L22 + param.D1 / 2 + param.S1;
		const L12total = param.L11 + param.L12 + param.L21 + param.L22;
		const jointAngleDeg = timeToAngle(param.JointA + t);
		const jointAngle = degToRad(jointAngleDeg);
		// step-5 : checks on the parameter values
		if (W11A <= 0) {
			throw `err150: W11A ${W11A} is negative because of J1Rext ${ffix(J1Rext)}`;
		}
		if (W11B <= 0) {
			throw `err153: W11B ${W11B} is negative because of J1Rext ${ffix(J1Rext)}`;
		}
		if (W21A <= 0) {
			throw `err156: W21A ${W21A} is negative because of J2Rext ${ffix(J2Rext)}`;
		}
		if (W21B <= 0) {
			throw `err159: W21B ${W21B} is negative because of J2Rext ${ffix(J2Rext)}`;
		}
		// step-6 : any logs
		rGeome.logstr += `armEnd-1 W12A ${ffix(param.W12A)}, W12B ${ffix(param.W12B)}, L1total ${ffix(L1total)}\n`;
		rGeome.logstr += `armEnd-2 W22A ${ffix(param.W22A)}, W22B ${ffix(W22B)}, L2total ${ffix(L2total)}\n`;
		rGeome.logstr += `L12total ${ffix(L12total)} mm\n`;
		rGeome.logstr += `jointAngle ${ffix(jointAngleDeg)} degree  ${ffix(jointAngle)} rad\n`;
		// step-7 : drawing of the figures
		// sub-designs
		// sub-armAxis
		const armAxisParam = designParam(armAxisDef.pDef);
		armAxisParam.setVal('D1', param.D1);
		armAxisParam.setVal('T1', param.Taxis);
		armAxisParam.setVal('L1', param.W12B);
		armAxisParam.setVal('D2', param.D2axis);
		armAxisParam.setVal('D3', param.D3axis);
		const armAxisGeom = armAxisDef.pGeom(
			0,
			armAxisParam.getParamVal(),
			armAxisParam.getSuffix()
		);
		checkGeom(armAxisGeom);
		rGeome.logstr += prefixLog(armAxisGeom.logstr, armAxisParam.getPartNameSuffix());
		// sub-armEnd1
		const armEnd1Param = designParam(armEndDef.pDef, '1');
		armEnd1Param.setVal('W2A', param.W12A);
		armEnd1Param.setVal('W2B', param.W12B);
		armEnd1Param.setVal('eqWAB', 0);
		armEnd1Param.setVal('L1', param.L11);
		armEnd1Param.setVal('L2', param.L12);
		armEnd1Param.setVal('D1', param.D1);
		armEnd1Param.setVal('S1', param.S1);
		armEnd1Param.setVal('D2', param.D12);
		armEnd1Param.setVal('D3A', param.D13A);
		armEnd1Param.setVal('D3B', param.D13B);
		armEnd1Param.setVal('T1', param.T1);
		armEnd1Param.setVal('Jmark', param.J1mark);
		armEnd1Param.setVal('Jradius', param.J1radius);
		armEnd1Param.setVal('Jneutral', param.J1neutral);
		const armEnd1Geom = armEndDef.pGeom(
			0,
			armEnd1Param.getParamVal(),
			armEnd1Param.getSuffix()
		);
		checkGeom(armEnd1Geom);
		rGeome.logstr += prefixLog(armEnd1Geom.logstr, armEnd1Param.getPartNameSuffix());
		// sub-armEnd2
		const armEnd2Param = designParam(armEndDef.pDef, '2');
		armEnd2Param.setVal('W2A', param.W22A);
		armEnd2Param.setVal('W2B', W22B);
		armEnd2Param.setVal('eqWAB', 0);
		armEnd2Param.setVal('L1', param.L21);
		armEnd2Param.setVal('L2', param.L22);
		armEnd2Param.setVal('D1', param.D1);
		armEnd2Param.setVal('S1', param.S1);
		armEnd2Param.setVal('D2', param.D22);
		armEnd2Param.setVal('D3A', param.D23A);
		armEnd2Param.setVal('D3B', param.D23B);
		armEnd2Param.setVal('T1', param.T2);
		armEnd2Param.setVal('Jmark', param.J2mark);
		armEnd2Param.setVal('Jradius', param.J2radius);
		armEnd2Param.setVal('Jneutral', param.J2neutral);
		const armEnd2Geom = armEndDef.pGeom(
			0,
			armEnd2Param.getParamVal(),
			armEnd2Param.getSuffix()
		);
		checkGeom(armEnd2Geom);
		rGeome.logstr += prefixLog(armEnd2Geom.logstr, armEnd2Param.getPartNameSuffix());
		// figures
		// figSide
		const axisT2d = transform2d()
			.addRotation(jointAngle + Math.PI / 2)
			.addTranslation(0, param.L11 + param.L12);
		const axisTa = axisT2d.getRotation();
		const [axisTx, axisTy] = axisT2d.getTranslation();
		const end2T2d = transform2d()
			.addRotation(Math.PI)
			.addTranslation(0, param.L21 + param.L22)
			.addRotation(jointAngle)
			.addTranslation(0, param.L11 + param.L12);
		const end2Ta = end2T2d.getRotation();
		const [end2Tx, end2Ty] = end2T2d.getTranslation();
		//figSide.mergeFigure(armEnd1Geom.fig.SFG_f00);
		figSide.mergeFigure(armEnd1Geom.fig.faceSide);
		figSide.mergeFigure(
			armAxisGeom.fig.faceAxis.rotate(0, 0, axisTa).translate(axisTx, axisTy)
		);
		//figSide.mergeFigure(armEnd2Geom.fig.SFG_f00.rotate(0, 0, end2Ta).translate(end2Tx, end2Ty));
		figSide.mergeFigure(
			armEnd2Geom.fig.faceSide.rotate(0, 0, end2Ta).translate(end2Tx, end2Ty)
		);
		// figTop
		const end2Ty2 = param.L11 + param.L12 + param.L21 + param.L22;
		figTop.mergeFigure(armEnd1Geom.fig.faceTop);
		figTop.mergeFigure(armEnd2Geom.fig.faceTop.rotate(0, 0, Math.PI).translate(0, end2Ty2));
		figTop.mergeFigure(armAxisGeom.fig.faceHoleS.translate(0, param.L11 + param.L12));
		// figSection
		figSection.mergeFigure(armAxisGeom.fig.faceHoleS.rotate(0, 0, Math.PI / 2));
		figSection.mergeFigure(
			armEnd1Geom.fig.SFG_profiles.translate(-param.W12A / 2 + J1Rext, -param.W12B / 2)
		);
		figSection.mergeFigure(
			armEnd2Geom.fig.SFG_profiles.translate(-param.W22A / 2 + J2Rext, -W22B / 2)
		);
		// final figure list
		rGeome.fig = {
			faceSide: figSide,
			faceTop: figTop,
			faceSection: figSection
		};
		// step-8 : recipes of the 3D construction
		const end1T3d = transform3d();
		const end2T3d = transform3d()
			.addRotation(0, 0, Math.PI)
			.addTranslation(0, param.L21 + param.L22, 0)
			.addRotation(0, 0, jointAngle)
			.addTranslation(0, param.L11 + param.L12, param.T1 + param.E12);
		const axisT3d = transform3d()
			.addRotation(0, 0, jointAngle + Math.PI / 2)
			.addTranslation(0, param.L11 + param.L12, 0);
		const designName = rGeome.partName;
		rGeome.vol = {
			inherits: [
				{
					outName: `inpax_${designName}_end1`,
					subdesign: 'pax_armEnd1',
					subgeom: armEnd1Geom,
					rotate: end1T3d.getRotation(),
					translate: end1T3d.getTranslation()
				},
				{
					outName: `inpax_${designName}_end2`,
					subdesign: 'pax_armEnd2',
					subgeom: armEnd2Geom,
					rotate: end2T3d.getRotation(),
					translate: end2T3d.getTranslation()
				},
				{
					outName: `inpax_${designName}_axis`,
					subdesign: 'pax_armAxis',
					subgeom: armAxisGeom,
					rotate: axisT3d.getRotation(),
					translate: axisT3d.getTranslation()
				}
			],
			extrudes: [],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`inpax_${designName}_end1`,
						`inpax_${designName}_end2`,
						`inpax_${designName}_axis`
					]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		const subEnd1: tSubInst = {
			partName: armEnd1Param.getPartName(),
			dparam: armEnd1Param.getDesignParamList(),
			orientation: end1T3d.getRotation(),
			position: end1T3d.getTranslation()
		};
		const subEnd2: tSubInst = {
			partName: armEnd2Param.getPartName(),
			dparam: armEnd2Param.getDesignParamList(),
			orientation: end2T3d.getRotation(),
			position: end2T3d.getTranslation()
		};
		const subAxis: tSubInst = {
			partName: armAxisParam.getPartName(),
			dparam: armAxisParam.getDesignParamList(),
			orientation: axisT3d.getRotation(),
			position: axisT3d.getTranslation()
		};
		rGeome.sub = {
			armEnd_1: subEnd1,
			armEnd_2: subEnd2,
			armAxis_1: subAxis
		};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'armChain drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const armChainDef: tPageDef = {
	pTitle: 'armChain',
	pDescription: 'robotic arm composed of a chain or armBones',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { armChainDef };
