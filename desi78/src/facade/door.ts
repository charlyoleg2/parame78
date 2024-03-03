// door.ts
// a door design with an hyperbolic arc

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
	//radToDeg,
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
	partName: 'door',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('H1', 'mm', 500, 100, 4000, 10),
		pNumber('H2', 'mm', 1600, 100, 4000, 10),
		pNumber('H3', 'mm', 200, 10, 500, 10),
		pNumber('L1', 'mm', 1200, 400, 4000, 10),
		pNumber('L2', 'mm', 200, 50, 500, 10),
		pNumber('R1', 'mm', 200, 50, 500, 10),
		pNumber('R2', 'mm', 200, 50, 500, 10),
		pNumber('W1', 'mm', 200, 50, 500, 10)
	],
	paramSvg: {
		H1: 'door_face.svg',
		H2: 'door_face.svg',
		H3: 'door_face.svg',
		L1: 'door_face.svg',
		L2: 'door_face.svg',
		R1: 'door_face.svg',
		R2: 'door_face.svg',
		W1: 'door_face.svg'
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
	const figDoor = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Lg = param.L1 + 2 * param.L2;
		const xmid = Lg / 2;
		const Hi = param.H1 + param.H2;
		const He = param.H2 + param.H3;
		const Hg = param.H1 + He;
		// step-5 : checks on the parameter values
		// step-6 : any logs
		rGeome.logstr += `door: height-int ${ffix(Hi / 1000)}  height-ext ${ffix(Hg / 1000)}  width-ext ${ffix(Lg / 1000)} m\n`;
		// step-7 : drawing of the figures
		// figDoor
		const ctrDoor = contour(0, 0)
			.addSegStrokeA(param.L2, 0)
			.addSegStrokeA(param.L2, param.H1)
			.addCornerRounded(param.R1)
			.addSegStrokeA(xmid, Hi)
			.addSegStrokeA(param.L2 + param.L1, param.H1)
			.addCornerRounded(param.R1)
			.addSegStrokeA(param.L2 + param.L1, 0)
			.addSegStrokeA(2 * param.L2 + param.L1, 0)
			.addSegStrokeA(2 * param.L2 + param.L1, param.H1)
			.addCornerRounded(param.R2)
			.addSegStrokeA(xmid, Hg)
			.addSegStrokeA(0, param.H1)
			.addCornerRounded(param.R2)
			.closeSegStroke();
		figDoor.addMain(ctrDoor);
		// final figure list
		rGeome.fig = {
			faceDoor: figDoor
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}`,
					face: `${designName}_faceDoor`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1,
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
		rGeome.logstr += 'door drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const doorDef: tPageDef = {
	pTitle: 'Door',
	pDescription: 'A door with hyperbolic arc',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { doorDef };
