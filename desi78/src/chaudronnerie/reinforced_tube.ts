// reinforced_tube.ts
// a tube with wall internally reinforced

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
	//designParam,
	//checkGeom,
	//prefixLog,
	point,
	//Point,
	//ShapePoint,
	//vector,
	contour,
	contourCircle,
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

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'reinforced_tube',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1L', 'mm', 1600, 100, 4000, 1),
		pNumber('H1', 'mm', 6000, 10, 20000, 10),
		pNumber('E1', 'mm', 10, 1, 300, 1),
		pSectionSeparator('Wave'),
		pNumber('E2', 'mm', 10, 1, 300, 1),
		pNumber('N2', 'wave', 20, 4, 400, 1),
		pDropdown('W2_method', ['W2_from_RW2', 'W2_direct']),
		pNumber('RW2', '%', 50, 5, 95, 0.1),
		pNumber('W2', 'mm', 80, 1, 800, 1),
		pNumber('S23L', 'mm', 200, 1, 600, 1),
		pDropdown('D2_method', ['D2_from_Rvw', 'D2_direct']),
		pNumber('Rvw', '%', 50, 5, 95, 0.1),
		pNumber('D2', 'mm', 20, 1, 600, 1),
		pDropdown('D3_method', ['D3_from_R32', 'D3_direct']),
		pNumber('R32', '%', 50, 5, 95, 0.1),
		pNumber('D3', 'mm', 20, 1, 600, 1),
		pSectionSeparator('Optional internal cylinder'),
		pCheckbox('internal_cylinder', false),
		pNumber('E4', 'mm', 10, 1, 300, 1)
	],
	paramSvg: {
		D1L: 'reinforced_tube_section.svg',
		H1: 'reinforced_tube_section.svg',
		E1: 'reinforced_tube_section.svg',
		E2: 'reinforced_tube_section.svg',
		N2: 'reinforced_tube_section.svg',
		W2_method: 'reinforced_tube_section.svg',
		RW2: 'reinforced_tube_section.svg',
		W2: 'reinforced_tube_section.svg',
		S23L: 'reinforced_tube_section.svg',
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
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

// externalized functions
function biggestR(iA: number, iL: number): number {
	const CB = (iL * Math.sin(iA)) / Math.sin((3 * Math.PI) / 4 - iA / 2);
	const ct = 1 - Math.cos(Math.PI / 2 + iA);
	const rR = Math.sqrt(CB ** 2 / (2 * ct));
	return rR;
}
function cscPts(
	ix1: number,
	iy1: number,
	ix2: number,
	iy2: number,
	iR1: number,
	iR2: number,
	iCcw: boolean
): [number, number, number, number] {
	//const CB = Math.sqrt(iL1 ** 2 + iL2 ** 2 - 2 * iL1 * iL2 * Math.cos(iA));
	const dx12 = ix2 - ix1;
	const dy12 = iy2 - iy1;
	const CB = Math.sqrt(dx12 ** 2 + dy12 ** 2);
	const aCB = Math.atan2(dy12, dx12);
	if (CB < iR1 + iR2) {
		throw `err995: CB ${ffix(CB)} is too small compare to R1 ${ffix(iR1)} and R2 ${ffix(iR2)}`;
	}
	const FB = CB / (1 + iR2 / iR1);
	const CF = CB - FB;
	const DBF = Math.acos(iR1 / FB);
	const ECF = Math.acos(iR2 / CF);
	const sign = iCcw ? 1 : -1;
	const pB = point(ix1, iy1);
	const pD = pB.translatePolar(aCB - sign * DBF, iR1);
	const pC = point(ix2, iy2);
	const pE = pC.translatePolar(aCB + Math.PI - sign * ECF, iR2);
	return [pD.cx, pD.cy, pE.cx, pE.cy];
}

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figTopExt = figure();
	const figTopWave = figure();
	const figTopInt = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const R1Li = param.D1L / 2 - param.E1;
		const R1Lii = R1Li - param.E2;
		const aN2 = (2 * Math.PI) / param.N2;
		const W2p = 2 * R1Lii * Math.sin((aN2 * param.RW2) / 200);
		const W2 = param.W2_method === 0 ? W2p : param.W2;
		const aW2 = 2 * Math.asin(W2 / (2 * R1Lii));
		const LextW2 = aW2 * R1Li;
		const LintW2 = aW2 * R1Lii;
		const W2bis = 2 * R1Lii * Math.sin(aW2 / 2);
		const aWave = aN2 - aW2;
		const aR2e = aWave * (1 - param.Rvw / 100.0) * 0.5;
		const R2e = param.D2_method === 0 ? biggestR(aR2e, R1Li) : param.D2 / 2 + param.E2;
		const R2i = R2e - param.E2;
		const R3ip = (R2i * param.R32) / (100 - param.R32);
		const R3i = param.D3_method === 0 ? R3ip : param.D3 / 2;
		const R3e = R3i + param.E2;
		const R3c = R1Li - param.S23L + R3e;
		const aR3e = Math.asin(R3e / R3c);
		const WaveCordeExt = aWave * R1Li;
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
		// replace by err995
		//if (WaveCordeExt < 2 * (R2e + R3e)) {
		//	if (param.S23L < 2 * (R2e + R3e)) {
		//		throw `err113: S23L ${param.S23L} is too small compare to D1L ${param.D1L} and N2 ${param.N2}`;
		//	}
		//}
		if (R2i < 0) {
			throw `err143: E2 ${param.E2} is too large compare to R2e ${ffix(R2e)}`;
		}
		// step-6 : any logs
		const cylinderExtCe = Math.PI * param.D1L;
		const cylinderExtCi = 2 * Math.PI * R1Li;
		rGeome.logstr += `External cylinder: D1Le: ${param.D1L} mm, D1Li: ${ffix(2 * R1Li)} mm, corde-ext: ${ffix(cylinderExtCe)} mm, corde-int: ${ffix(cylinderExtCi)} mm, diff: ${ffix(cylinderExtCe - cylinderExtCi)} mm\n`;
		rGeome.logstr += `Period: angle: ${ffix(radToDeg(aN2))} degree, corde-ext: ${ffix(aN2 * R1Li)} mm\n`;
		rGeome.logstr += `W2: angle: ${ffix(radToDeg(aW2))} degree or ${ffix((100 * aW2) / aN2)} %, corde-ext: ${ffix(LextW2)} mm, corde-int: ${ffix(LintW2)} mm, W2bis: ${ffix(W2bis)} mm\n`;
		rGeome.logstr += `Wave: angle: ${ffix(radToDeg(aWave))} degree or ${ffix((100 * aWave) / aN2)} %, corde-ext: ${ffix(WaveCordeExt)} mm\n`;
		rGeome.logstr += `D2: ${ffix(2 * R2i)} mm, R2i: ${ffix(R2i)} mm, R2e: ${ffix(R2e)} mm\n`;
		rGeome.logstr += `D3: ${ffix(2 * R3i)} mm, R3i: ${ffix(R3i)} mm, R3e: ${ffix(R3e)} mm\n`;
		// step-7 : drawing of the figures
		// figTopExt
		figTopExt.addMainOI([
			contourCircle(0, 0, param.D1L / 2),
			contourCircle(0, 0, param.D1L / 2 - param.E1)
		]);
		// figTopWave
		const ctrWi = contour(R1Li - param.E2, 0);
		const ctrWe = contour(R1Li, 0);
		const p0 = point(0, 0);
		for (let i = 0; i < param.N2; i++) {
			const Aoffset = i * aN2;
			const pWi1 = p0.setPolar(Aoffset + aW2 / 2, R1Li - param.E2);
			const pWi2 = p0.setPolar(Aoffset + aW2, R1Li - param.E2);
			const pWe1 = p0.setPolar(Aoffset + aW2 / 2, R1Li);
			const pWe2 = p0.setPolar(Aoffset + aW2, R1Li);
			ctrWi.addPointA(pWi1.cx, pWi1.cy).addPointA(pWi2.cx, pWi2.cy).addSegArc2();
			ctrWe.addPointA(pWe1.cx, pWe1.cy).addPointA(pWe2.cx, pWe2.cy).addSegArc2();
			const p1 = p0.setPolar(Aoffset + aW2, R1Li - R2e);
			const p2 = p0.setPolar(Aoffset + aW2 + aWave / 2, R1Li - param.S23L + R3e);
			const p3 = p0.setPolar(Aoffset + aW2 + aWave, R1Li - R2e);
			//figTopExt.addSecond(contourCircle(p1.cx, p1.cy, R2e));
			//figTopExt.addSecond(contourCircle(p1.cx, p1.cy, R2i));
			//figTopExt.addSecond(contourCircle(p2.cx, p2.cy, R3e));
			//figTopExt.addSecond(contourCircle(p2.cx, p2.cy, R3i));
			//figTopExt.addSecond(contourCircle(p3.cx, p3.cy, R2e));
			//figTopExt.addSecond(contourCircle(p3.cx, p3.cy, R2i));
			const [pAx, pAy, pBx, pBy] = cscPts(p1.cx, p1.cy, p2.cx, p2.cy, R2e, R3i, true);
			const [pDx, pDy, pCx, pCy] = cscPts(p1.cx, p1.cy, p2.cx, p2.cy, R2i, R3e, true);
			//const ctrT1 = contour(pAx, pAy)
			//	.addSegStrokeA(pBx, pBy)
			//	.addSegStrokeA(pCx, pCy)
			//	.addSegStrokeA(pDx, pDy)
			//	.closeSegStroke();
			//figTopExt.addSecond(ctrT1);
			const [pEx, pEy, pFx, pFy] = cscPts(p2.cx, p2.cy, p3.cx, p3.cy, R3i, R2e, false);
			const [pHx, pHy, pGx, pGy] = cscPts(p2.cx, p2.cy, p3.cx, p3.cy, R3e, R2i, false);
			//const ctrT2 = contour(pEx, pEy)
			//	.addSegStrokeA(pFx, pFy)
			//	.addSegStrokeA(pGx, pGy)
			//	.addSegStrokeA(pHx, pHy)
			//	.closeSegStroke();
			//figTopExt.addSecond(ctrT2);
			ctrWi.addPointA(pDx, pDy).addSegArc(R2i, false, true);
			ctrWe.addPointA(pAx, pAy).addSegArc(R2e, false, true);
			ctrWi.addSegStrokeA(pCx, pCy);
			ctrWe.addSegStrokeA(pBx, pBy);
			const pWi3 = p0.setPolar(Aoffset + aW2 + aWave / 2, R1Li - param.S23L);
			const pWe3 = p0.setPolar(Aoffset + aW2 + aWave / 2, R1Li - param.S23L + param.E2);
			ctrWi.addPointA(pWi3.cx, pWi3.cy).addPointA(pHx, pHy).addSegArc2();
			ctrWe.addPointA(pWe3.cx, pWe3.cy).addPointA(pEx, pEy).addSegArc2();
			ctrWi.addSegStrokeA(pGx, pGy);
			ctrWe.addSegStrokeA(pFx, pFy);
			const pWi4 = p0.setPolar(Aoffset + aN2, R1Li - param.E2);
			const pWe4 = p0.setPolar(Aoffset + aN2, R1Li);
			ctrWi.addPointA(pWi4.cx, pWi4.cy).addSegArc(R2i, false, true);
			ctrWe.addPointA(pWe4.cx, pWe4.cy).addSegArc(R2e, false, true);
			// log for af
			if (i === 0) {
				const dx = pGx - pHx;
				const dy = pGy - pHy;
				const aExt = Math.atan2(dy, dx);
				const af = aExt - Aoffset - aW2 - aWave / 2;
				const afDiff = af - aR3e;
				rGeome.logstr += `af: ${ffix(radToDeg(af))} degree, afDiff: ${ffix(radToDeg(afDiff))} degree\n`;
			}
		}
		//figTopExt.addPoints(ctrWi.generatePoints());
		//figTopExt.addPoints(ctrWe.generatePoints());
		const ctrWiLen = ctrWi.getPerimeter();
		const ctrWeLen = ctrWe.getPerimeter();
		rGeome.logstr += `info253: Wave-internal length: ${ffix(ctrWiLen)} mm\n`;
		rGeome.logstr += `info254: Wave-external length: ${ffix(ctrWeLen)} mm\n`;
		rGeome.logstr += `info255: Wave-average length: ${ffix((ctrWeLen + ctrWiLen) / 2)} mm, diff: ${ffix(ctrWeLen - ctrWiLen)} mm\n`;
		figTopWave.addMainOI([ctrWi, ctrWe]);
		// figTopInt
		if (param.internal_cylinder === 1) {
			figTopInt.addMainOI([
				contourCircle(0, 0, R1Li - param.S23L),
				contourCircle(0, 0, R1Li - param.S23L - param.E4)
			]);
		}
		// complete figTopExt, figTopWave and figTopInt
		figTopExt.mergeFigure(figTopInt, true);
		figTopWave.mergeFigure(figTopExt, true);
		figTopInt.mergeFigure(figTopExt, true);
		figTopExt.addSecond(ctrWi);
		figTopExt.addSecond(ctrWe);
		figTopInt.addSecond(ctrWi);
		figTopInt.addSecond(ctrWe);
		// figSide
		figSide.addMainO(ctrRectangle(-R1Li - param.E1, 0, param.E1, param.H1));
		figSide.addMainO(ctrRectangle(R1Li, 0, param.E1, param.H1));
		figSide.addSecond(ctrRectangle(-R1Li, 0, param.S23L, param.H1));
		figSide.addSecond(ctrRectangle(R1Li - param.S23L, 0, param.S23L, param.H1));
		if (param.internal_cylinder === 1) {
			figSide.addMainO(ctrRectangle(-R1Li + param.S23L, 0, param.E4, param.H1));
			figSide.addMainO(ctrRectangle(R1Li - param.S23L - param.E4, 0, param.E4, param.H1));
		}
		// final figure list
		rGeome.fig = {
			faceTopExt: figTopExt,
			faceTopWave: figTopWave,
			faceTopInt: figTopInt,
			faceSide: figSide
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		const optExtrudes: tExtrude[] = [];
		const optVolumeNames: string[] = [];
		if (param.internal_cylinder === 1) {
			const tmpVol: tExtrude = {
				outName: `subpax_${designName}_topInt`,
				face: `${designName}_faceTopInt`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.H1,
				rotate: [0, 0, 0],
				translate: [0, 0, 0]
			};
			optExtrudes.push(tmpVol);
			optVolumeNames.push(`subpax_${designName}_topInt`);
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_topExt`,
					face: `${designName}_faceTopExt`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_topWave`,
					face: `${designName}_faceTopWave`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				...optExtrudes
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_topExt`,
						`subpax_${designName}_topWave`,
						...optVolumeNames
					]
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
const reinforcedTubeDef: tPageDef = {
	pTitle: 'Reinforced tube',
	pDescription: 'A strong tube with less metal',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { reinforcedTubeDef };
