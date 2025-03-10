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
	pCheckbox,
	pDropdown,
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
import { armEndDef } from './armEnd';
//import { armBoneDef } from './armBone';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'armChain',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('jointNb', 'joints', 1, 1, 10, 1),
		pDropdown('twist', ['straight', 'twisted']),
		pNumber('D1hand', 'mm', 10, 1, 200, 1),
		pNumber('progressionA', '%', 100, 100, 200, 1),
		pNumber('progressionB', 'mm', 1, 0, 100, 0.1),
		pSectionSeparator('Hand'),
		//pNumber('W1A', 'mm', 50, 1, 500, 1),
		//pNumber('W1B', 'mm', 50, 1, 500, 1),
		pNumber('W2Ahand', 'mm', 60, 1, 500, 1),
		pNumber('W2Bhand', 'mm', 60, 1, 500, 1),
		pCheckbox('eqWAB', true),
		pNumber('S1hand', 'mm', 10, 1, 200, 1),
		pSectionSeparator('Middle'),
		pNumber('L1', 'mm', 50, 1, 500, 1),
		pSectionSeparator('Thickness and corners'),
		pNumber('T1', 'mm', 3, 0.5, 10, 0.25),
		pNumber('Jmark', 'mm', 1, 0, 20, 0.1),
		pNumber('Jradius', 'mm', 5, 0, 50, 1),
		pNumber('Jneutral', '%', 50, 0, 100, 1),
		pNumber('E12', 'mm', 1, 0, 10, 0.1),
		pSectionSeparator('Joint angle'),
		pNumber('JointA', 'degree', 0, -90, 90, 1)
	],
	paramSvg: {
		jointNb: 'armChain_overview.svg',
		twist: 'armChain_overview.svg',
		D1hand: 'armChain_overview.svg',
		progressionA: 'armChain_overview.svg',
		progressionB: 'armChain_overview.svg',
		W2Ahand: 'armChain_initSection.svg',
		W2Bhand: 'armChain_initSection.svg',
		S1hand: 'armChain_overview.svg',
		L1: 'armChain_overview.svg',
		T1: 'armChain_initSection.svg',
		Jmark: 'armChain_initSection.svg',
		Jradius: 'armChain_initSection.svg',
		Jneutral: 'armChain_initSection.svg',
		E12: 'armChain_initSection.svg',
		JointA: 'armChain_overview.svg'
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
function calcD3(iL1: number, iW1: number, iS1: number): number {
	const rD3 = Math.min(iL1 - iS1, iW1); // Math.min(iL1 - 2 * iS1, iW1);
	if (rD3 < 0) {
		throw `err124: rD3 ${rD3} is negative because of L1 ${iL1}, iW1 ${iW1} and iS1 ${iS1}`;
	}
	return rD3;
}
function calcL2b(iR1: number, iS1: number, iW1: number): number {
	let rL2b = iR1;
	const R1S1 = iR1 + iS1;
	const W1Limit = Math.sqrt(R1S1 ** 2 - iR1 ** 2);
	if (iW1 < W1Limit) {
		rL2b = Math.sqrt(R1S1 ** 2 - iW1 ** 2);
	}
	return rL2b;
}

interface tBJSize {
	W1A2: number;
	W1B2: number;
	R1: number;
	S1: number;
	L1: number;
	L2b: number;
	L2f: number;
	D3A: number;
	D3B: number;
}

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figA = figure();
	const figB = figure();
	const figSection = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const aJn = param.Jneutral / 100;
		const JRext = param.Jradius + param.T1 * (1 - aJn);
		const W1A = param.W2Ahand - 2 * JRext;
		let W1B = param.W2Bhand - 2 * JRext;
		if (param.eqWAB) {
			W1B = W1A;
		}
		const jointAngleDeg = timeToAngle(param.JointA + t);
		const jointAngle = degToRad(jointAngleDeg);
		const BJsize: tBJSize[] = [
			{
				W1A2: W1A / 2,
				W1B2: W1B / 2,
				R1: param.D1hand / 2,
				S1: param.S1hand,
				L1: param.L1,
				L2b: calcL2b(param.D1hand / 2, param.S1hand, W1A / 2),
				L2f: 0,
				D3A: calcD3(param.L1, W1A, param.S1hand),
				D3B: calcD3(param.L1, W1B, param.S1hand)
			}
		];
		const progA = param.progressionA / 100;
		for (let idx = 1; idx < param.jointNb + 1; idx++) {
			const zW1A2 = BJsize[idx - 1].W1A2 * progA + param.progressionB;
			//const zW1B2 = BJsize[idx - 1].W1B2 * progA + param.progressionB;
			const zW1B2 = BJsize[idx - 1].W1B2 + param.T1 + param.E12;
			const zR1 = BJsize[idx - 1].R1 * progA + param.progressionB;
			const zS1 = BJsize[idx - 1].S1 * progA + param.progressionB;
			const zL1 = param.L1;
			const zL2f = Math.max(
				BJsize[idx - 1].W1A2 + JRext,
				BJsize[idx - 1].R1 + BJsize[idx - 1].S1
			);
			const zD3A = calcD3(zL1, zW1A2 * 2, BJsize[idx - 1].S1);
			const zD3B = calcD3(zL1, zW1B2 * 2, BJsize[idx - 1].S1);
			const nBJsize = {
				W1A2: zW1A2,
				W1B2: zW1B2,
				R1: zR1,
				S1: zS1,
				L1: zL1,
				L2b: calcL2b(zR1, zS1, zW1A2),
				L2f: zL2f,
				D3A: zD3A,
				D3B: zD3B
			};
			BJsize.push(nBJsize);
		}
		// step-5 : checks on the parameter values
		if (W1A <= 0) {
			throw `err150: W1A ${W1A} is negative because of JRext ${ffix(JRext)}`;
		}
		if (W1B <= 0) {
			throw `err153: W1B ${W1B} is negative because of JRext ${ffix(JRext)}`;
		}
		// step-6 : any logs
		rGeome.logstr += `hand armEnd W2Ahand ${ffix(param.W2Ahand)}, W2Bhand ${ffix(param.W2Bhand)}\n`;
		rGeome.logstr += `jointAngle ${ffix(jointAngleDeg)} degree  ${ffix(jointAngle)} rad\n`;
		// step-7 : drawing of the figures
		// sub-designs
		// sub-armEnd1 shoulder
		const armEnd1Param = designParam(armEndDef.pDef, '1');
		armEnd1Param.setVal('W2A', (BJsize[param.jointNb].W1A2 + JRext) * 2);
		armEnd1Param.setVal('W2B', (BJsize[param.jointNb].W1B2 + JRext) * 2);
		armEnd1Param.setVal('eqWAB', 0);
		armEnd1Param.setVal('L1', BJsize[param.jointNb].L1);
		armEnd1Param.setVal('L2', BJsize[param.jointNb].L2f);
		armEnd1Param.setVal('D1', BJsize[param.jointNb - 1].R1 * 2);
		armEnd1Param.setVal('S1', BJsize[param.jointNb - 1].S1);
		armEnd1Param.setVal('D2', 0);
		armEnd1Param.setVal('D3A', BJsize[param.jointNb].D3A);
		armEnd1Param.setVal('D3B', BJsize[param.jointNb].D3B);
		armEnd1Param.setVal('T1', param.T1);
		armEnd1Param.setVal('Jmark', param.Jmark);
		armEnd1Param.setVal('Jradius', param.Jradius);
		armEnd1Param.setVal('Jneutral', param.Jneutral);
		const armEnd1Geom = armEndDef.pGeom(
			0,
			armEnd1Param.getParamVal(),
			armEnd1Param.getSuffix()
		);
		checkGeom(armEnd1Geom);
		rGeome.logstr += prefixLog(armEnd1Geom.logstr, armEnd1Param.getPartNameSuffix());
		// sub-armEnd2 hand
		const armEnd2Param = designParam(armEndDef.pDef, '2');
		armEnd2Param.setVal('W2A', (BJsize[0].W1A2 + JRext) * 2);
		armEnd2Param.setVal('W2B', (BJsize[0].W1B2 + JRext) * 2);
		armEnd2Param.setVal('eqWAB', 0);
		armEnd2Param.setVal('L1', BJsize[0].L1);
		armEnd2Param.setVal('L2', BJsize[0].L2b);
		armEnd2Param.setVal('D1', BJsize[0].R1 * 2);
		armEnd2Param.setVal('S1', BJsize[0].S1);
		armEnd2Param.setVal('D2', 0);
		armEnd2Param.setVal('D3A', BJsize[0].D3A);
		armEnd2Param.setVal('D3B', BJsize[0].D3B);
		armEnd2Param.setVal('T1', param.T1);
		armEnd2Param.setVal('Jmark', param.Jmark);
		armEnd2Param.setVal('Jradius', param.Jradius);
		armEnd2Param.setVal('Jneutral', param.Jneutral);
		const armEnd2Geom = armEndDef.pGeom(
			0,
			armEnd2Param.getParamVal(),
			armEnd2Param.getSuffix()
		);
		checkGeom(armEnd2Geom);
		rGeome.logstr += prefixLog(armEnd2Geom.logstr, armEnd2Param.getPartNameSuffix());
		// figures
		// figA
		const trY1 = param.L1 + BJsize[0].L2b;
		const trY2 = param.L1 + BJsize[1].L2f;
		const end2T2d = transform2d()
			.addRotation(Math.PI)
			.addTranslation(0, trY1)
			.addRotation(jointAngle)
			.addTranslation(0, trY2);
		const end2Ta = end2T2d.getRotation();
		const [end2Tx, end2Ty] = end2T2d.getTranslation();
		//figA.mergeFigure(armEnd1Geom.fig.SFG_f00);
		figA.mergeFigure(armEnd1Geom.fig.faceSide);
		//figA.mergeFigure(armEnd2Geom.fig.SFG_f00.rotate(0, 0, end2Ta).translate(end2Tx, end2Ty));
		figA.mergeFigure(armEnd2Geom.fig.faceSide.rotate(0, 0, end2Ta).translate(end2Tx, end2Ty));
		// figB
		const end2Ty2 = trY1 + trY2;
		figB.mergeFigure(armEnd1Geom.fig.faceTop);
		figB.mergeFigure(armEnd2Geom.fig.faceTop.rotate(0, 0, Math.PI).translate(0, end2Ty2));
		// figSection
		figSection.mergeFigure(
			armEnd1Geom.fig.SFG_profiles.translate(
				-BJsize[param.jointNb].W1A2,
				-BJsize[param.jointNb].W1B2 - JRext
			)
		);
		figSection.mergeFigure(
			armEnd2Geom.fig.SFG_profiles.translate(-BJsize[0].W1A2, -BJsize[0].W1B2 - JRext)
		);
		// final figure list
		rGeome.fig = {
			faceA: figA,
			faceB: figB,
			faceSection: figSection
		};
		// step-8 : recipes of the 3D construction
		const end1T3d = transform3d();
		const end2T3d = transform3d()
			.addRotation(0, 0, Math.PI)
			.addTranslation(0, param.L1, 0)
			.addRotation(0, 0, jointAngle)
			.addTranslation(0, param.L1, param.T1 + param.E12);
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
				}
			],
			extrudes: [],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`inpax_${designName}_end1`, `inpax_${designName}_end2`]
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
		rGeome.sub = {
			armEnd_1: subEnd1,
			armEnd_2: subEnd2
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
