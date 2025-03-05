// armJoint.ts
// a joint of a robot arm

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
	partName: 'armJoint',
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
		pNumber('E12', 'mm', 1, 0, 10, 0.1)
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
		E12: 'armJoint_section.svg'
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
		const W22B = param.W22A - 2 * param.T1 - 2 * param.E12;
		const W21B = W22B - 2 * J2Rext;
		const L1total = param.L11 + param.L12 + param.D1 / 2 + param.S1;
		const L2total = param.L21 + param.L22 + param.D1 / 2 + param.S1;
		const L12total = param.L11 + param.L12 + param.L21 + param.L22;
		const jointAngleDeg = timeToAngle(t);
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
		const armEnd1Param = designParam(armEndDef.pDef);
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
		// figures
		figSide.mergeFigure(armAxisGeom.fig.faceAxis);
		//figSide.mergeFigure(armAxisGeom.fig.faceAxis.translate(0, rakePosY));

		// final figure list
		rGeome.fig = {
			faceSide: figSide
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			inherits: [
				{
					outName: `inpax_${designName}_end1`,
					subdesign: 'pax_armEnd',
					subgeom: armEnd1Geom,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `inpax_${designName}_axis`,
					subdesign: 'pax_armAxis',
					subgeom: armAxisGeom,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			extrudes: [],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`inpax_${designName}_end1`, `inpax_${designName}_axis`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		const subEnd1: tSubInst = {
			partName: armEnd1Param.getPartName(),
			dparam: armEnd1Param.getDesignParamList(),
			orientation: [0, 0, 0],
			position: [0, 0, 0]
		};
		const subAxis: tSubInst = {
			partName: armAxisParam.getPartName(),
			dparam: armAxisParam.getDesignParamList(),
			orientation: [0, 0, 0],
			position: [0, 0, 0]
		};
		rGeome.sub = {
			end_1: subEnd1,
			axis_1: subAxis
		};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'armJoint drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const armJointDef: tPageDef = {
	pTitle: 'armJoint',
	pDescription: 'robotic arm joint',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { armJointDef };
