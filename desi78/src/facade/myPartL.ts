// myPartL.ts
// a Maltese-cross to illustrate the usage of the generic UI-app desiXY-ui and the generic CLI-app desiXY-cli

// step-1 : import from geometrix
import type {
	//tContour,
	tParamDef,
	tParamVal,
	tGeom,
	//tExtrude,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	contour,
	//contourCircle,
	figure,
	//degToRad,
	radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	partName: 'myPartL',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 10, 1, 200, 1),
		pNumber('D2', 'mm', 30, 10, 200, 1),
		pNumber('D3', 'mm', 60, 10, 200, 1),
		pNumber('L1', 'mm', 40, 10, 200, 1)
	],
	paramSvg: {
		D1: 'door_face.svg',
		D2: 'door_face.svg',
		D3: 'door_face.svg',
		L1: 'door_face.svg'
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
	const fig1 = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1 = param.D1 / 2;
		const R2 = param.D2 / 2;
		const R3 = param.D3 / 2;
		const L12 = param.L1 / 2;
		const aL12 = Math.asin(L12 / param.D3);
		// step-5 : checks on the parameter values
		if (param.D1 > param.D3) {
			throw `err291: D1 ${param.D1} is too large compare to D3 ${param.D3}`;
		}
		if (param.D2 > param.D3) {
			throw `err292: D2 ${param.D2} is too large compare to D3 ${param.D3}`;
		}
		if (aL12 > Math.PI / 4) {
			throw `err295: L1 ${param.L1} is too large compare to D3 ${param.D3}`;
		}
		// step-6 : any logs
		rGeome.logstr += `myPartL: aL12 ${ffix(radToDeg(aL12))} degree\n`;
		// step-7 : drawing of the figures
		// fig1
		const ctrCross = contour(R2, 0);
		for (let i = 0; i < 4; i++) {
			const aOffset = (i * Math.PI) / 2;
			ctrCross
				.addSegStrokeAP(aOffset + aL12, R3)
				.addSegStrokeAP(aOffset + Math.PI / 4, R1)
				.addSegStrokeAP(aOffset + Math.PI / 2 - aL12, R3)
				.addSegStrokeAP(aOffset + Math.PI / 2, R2);
		}
		//ctrCross.closeSegStroke();
		fig1.addMain(ctrCross);
		// final figure list
		rGeome.fig = {
			face1: fig1
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}`,
					face: `${designName}_face1`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 1,
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
		rGeome.logstr += 'myPartL drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const myPartLDef: tPageDef = {
	pTitle: 'My Part-L',
	pDescription:
		'A simple design for illustration the usage of the generic apps (desiXY-cli and desiXY-ui)',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { myPartLDef };
