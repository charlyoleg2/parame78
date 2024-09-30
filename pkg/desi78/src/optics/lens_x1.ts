// lens_x1.ts
// a single spherical lens

// step-1 : import from geometrix
import type {
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
	point,
	Point,
	ShapePoint,
	vector,
	contour,
	//contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
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
	partName: 'lens_x1',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 40, 1, 500, 1),
		pNumber('E1', 'mm', 6, 0.5, 200, 0.5),
		pSectionSeparator('Dioptre left'),
		pNumber('Dl', 'mm', 30, 1, 500, 1),
		pNumber('Rl', 'mm', 100, 1, 5000, 0.1),
		pDropdown('TypeL', ['convex', 'planar', 'concave']),
		pSectionSeparator('Dioptre right'),
		pNumber('Dr', 'mm', 30, 1, 500, 1),
		pNumber('Rr', 'mm', 100, 1, 5000, 0.1),
		pDropdown('TypeR', ['convex', 'planar', 'concave']),
		pSectionSeparator('index of refraction'),
		pNumber('ni', 'no-unit', 1.6, 1, 3, 0.01),
		pNumber('ne', 'no-unit', 1.0, 1, 3, 0.01)
	],
	paramSvg: {
		D1: 'lens_profile.svg',
		E1: 'lens_profile.svg',
		Dl: 'lens_profile.svg',
		Rl: 'lens_profile.svg',
		TypeL: 'lens_profile.svg',
		Dr: 'lens_profile.svg',
		Rr: 'lens_profile.svg',
		TypeR: 'lens_profile.svg',
		ni: 'lens_profile.svg',
		ne: 'lens_profile.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

// sub-functions
function chainette(xmid: number, a: number, b: number, c: number, x: number): Point {
	const xx = xmid + a * x;
	const yy = c + b * Math.cosh(x);
	const rP = point(xx, yy, ShapePoint.eTri1);
	return rP;
}

function chainetted(a: number, b: number, x: number): number {
	const deriv = (b * Math.sinh(x)) / a;
	const ra = Math.atan2(deriv, 1);
	return ra;
}

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figDoor = figure();
	const figTop = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Lg = param.L1 + 2 * param.L2;
		const xmid = Lg / 2;
		const Hi = param.H1 + param.H2;
		const He = param.H2 + param.H3;
		const Hg = param.H1 + He;
		// cosinus hyperbolic
		// d[c+b*cosh(x/a)] = b/a*sinh(a*x)
		const a1 = param.L1 / 2;
		const a2 = Lg / 2;
		const b1 = -param.H2 / (Math.cosh(1) - Math.cosh(0));
		const b2 = -He / (Math.cosh(1) - Math.cosh(0));
		const c1 = param.H1 - b1 * Math.cosh(1);
		const c2 = param.H1 - b2 * Math.cosh(1);
		// step-5 : checks on the parameter values
		// step-6 : any logs
		rGeome.logstr += `door: height-int ${ffix(Hi / 1000)}  height-ext ${ffix(Hg / 1000)}  width-ext ${ffix(Lg / 1000)} m\n`;
		rGeome.logstr += `internal cosh a1 ${ffix(a1)}  b1 ${ffix(b1)}  c1 ${ffix(c1)}\n`;
		rGeome.logstr += `external cosh a2 ${ffix(a2)}  b2 ${ffix(b2)}  c2 ${ffix(c2)}\n`;
		// step-7 : drawing of the figures
		// figDoor
		const pnb = 10;
		for (let i = 0; i < pnb; i++) {
			figDoor.addPoint(chainette(xmid, a1, b1, c1, -1 + i / pnb));
			figDoor.addPoint(chainette(xmid, a2, b2, c2, -1 + i / pnb));
		}
		const p1 = chainette(xmid, a1, b1, c1, -1);
		const p2 = chainette(xmid, a1, b1, c1, -0.5);
		const p3 = chainette(xmid, a1, b1, c1, 0);
		const p4 = chainette(xmid, a1, b1, c1, 0.5);
		const p5 = chainette(xmid, a1, b1, c1, 1);
		const p6 = chainette(xmid, a2, b2, c2, -1);
		const p7 = chainette(xmid, a2, b2, c2, -0.5);
		const p8 = chainette(xmid, a2, b2, c2, 0);
		const p9 = chainette(xmid, a2, b2, c2, 0.5);
		const p10 = chainette(xmid, a2, b2, c2, 1);
		figDoor.addPoint(p1);
		figDoor.addPoint(p2);
		figDoor.addPoint(p3);
		figDoor.addPoint(p4);
		figDoor.addPoint(p5);
		figDoor.addPoint(p6);
		figDoor.addPoint(p7);
		figDoor.addPoint(p8);
		figDoor.addPoint(p9);
		figDoor.addPoint(p10);
		const p1a = chainetted(a1, b1, -1);
		const p2a = chainetted(a1, b1, -0.5);
		const p6a = chainetted(a2, b2, -1);
		const p7a = chainetted(a2, b2, -0.5);
		figDoor.addVector(vector(p1a, param.L2, p1));
		figDoor.addVector(vector(p2a, param.L2, p2));
		figDoor.addVector(vector(p6a, param.L2, p6));
		figDoor.addVector(vector(p7a, param.L2, p7));
		const ctrDoor = contour(0, 0)
			.addSegStrokeA(param.L2, 0)
			.addSegStrokeA(param.L2, param.H1)
			.addCornerRounded(param.R1)
			//.addSegStrokeA(p2.cx, p2.cy)
			.addPointA(p2.cx, p2.cy)
			.addSeg2Arcs(p1a, Math.PI + p2a)
			//.addSegStrokeA(xmid, Hi)
			.addPointA(xmid, Hi)
			.addSeg2Arcs(p2a, Math.PI)
			//.addSegStrokeA(p4.cx, p4.cy)
			.addPointA(p4.cx, p4.cy)
			.addSeg2Arcs(0, Math.PI - p2a)
			//.addSegStrokeA(param.L2 + param.L1, param.H1)
			.addPointA(param.L2 + param.L1, param.H1)
			.addSeg2Arcs(-p2a, Math.PI - p1a)
			.addCornerRounded(param.R1)
			.addSegStrokeA(param.L2 + param.L1, 0)
			.addSegStrokeA(2 * param.L2 + param.L1, 0)
			.addSegStrokeA(2 * param.L2 + param.L1, param.H1)
			.addCornerRounded(param.R2)
			//.addSegStrokeA(p9.cx, p9.cy)
			.addPointA(p9.cx, p9.cy)
			.addSeg2Arcs(Math.PI - p6a, -p7a)
			//.addSegStrokeA(xmid, Hg)
			.addPointA(xmid, Hg)
			.addSeg2Arcs(Math.PI - p7a, 0)
			//.addSegStrokeA(p7.cx, p7.cy)
			.addPointA(p7.cx, p7.cy)
			.addSeg2Arcs(Math.PI, p7a)
			//.addSegStrokeA(0, param.H1)
			.addPointA(0, param.H1)
			.addSeg2Arcs(Math.PI + p7a, p6a)
			.addCornerRounded(param.R2)
			.closeSegStroke();
		figDoor.addMainO(ctrDoor);
		// figTop
		figTop.addMainO(ctrRectangle(-param.L2 - param.L1 / 2, 0, param.L2, param.W1));
		figTop.addMainO(ctrRectangle(param.L1 / 2, 0, param.L2, param.W1));
		figTop.addSecond(ctrRectangle(-param.L1 / 2, 0, param.L1, param.W1));
		// figSide
		figSide.addMainO(ctrRectangle(0, 0, param.W1, param.H1 + param.H2 + param.H3));
		figSide.addSecond(ctrRectangle(0, 0, param.W1, param.H1 + param.H2));
		// final figure list
		rGeome.fig = {
			faceDoor: figDoor,
			faceTop: figTop,
			faceSide: figSide
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
		rGeome.logstr += 'lens_x1 drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const lensX1Def: tPageDef = {
	pTitle: 'Lens_x1',
	pDescription: 'A single spherical lens',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { lensX1Def };
