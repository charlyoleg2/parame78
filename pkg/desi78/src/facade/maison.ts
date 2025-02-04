// maison.ts
// an house with a fold

// step-1 : import from geometrix
import type {
	tContour,
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
	//point,
	//Point,
	//ShapePoint,
	//vector,
	contour,
	//contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	pDropdown,
	pSectionSeparator,
	initGeom,
	transform3d,
	EExtrude,
	EBVolume
} from 'geometrix';
//import { triAArA, triALArLL, triLALrL, triALLrLAA, triLLLrA, triLLLrAAA } from 'triangule';
import { triLALrL, triLLLrA, triALArLL } from 'triangule';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'maison',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('H1', 'm', 12, 3, 50, 0.1),
		pNumber('H2', 'm', 6, 2, 50, 0.1),
		pNumber('H3', 'm', 6, 2, 50, 0.1),
		pNumber('RS', '%', 50, 10, 90, 1),
		pSectionSeparator('TopView'),
		pNumber('A1', 'degree', 135, 90, 180, 1),
		pNumber('W1', 'm', 12, 2, 50, 0.1),
		pNumber('W2', 'm', 12, 2, 50, 0.1),
		pNumber('L1', 'm', 16, 2, 50, 0.1),
		pNumber('L2', 'm', 16, 2, 50, 0.1),
		pSectionSeparator('Roof border'),
		pNumber('WF1', 'm', 0.4, 0, 1.5, 0.1),
		pNumber('WBL', '%', 3.0, 0, 20, 0.01),
		pNumber('WBH', '%', 5.0, 0, 20, 0.01),
		pNumber('AB1', 'degree', 15, 0, 80, 1),
		pNumber('WBE', 'm', 0.3, 0.05, 1, 0.01),
		pNumber('WBR', '%', 50, 0, 100, 1),
		pSectionSeparator('Chimney'),
		pDropdown('ChiNb', ['5', '4', '3', '2', '1', '0']),
		pNumber('ChiOffset', 'm', 1.5, 0, 5, 0.1),
		pNumber('ChiH', 'm', 1.5, 0, 3, 0.1),
		pNumber('ChiW', 'm', 1.5, 0.3, 3, 0.1),
		pNumber('ChiT', 'm', 0.6, 0.3, 3, 0.1)
	],
	paramSvg: {
		H1: 'maison_side.svg',
		H2: 'maison_side.svg',
		H3: 'maison_side.svg',
		RS: 'maison_side.svg',
		A1: 'maison_top.svg',
		W1: 'maison_top.svg',
		W2: 'maison_top.svg',
		L1: 'maison_top.svg',
		L2: 'maison_top.svg',
		WF1: 'maison_roofBorder.svg',
		WBL: 'maison_roofBorder.svg',
		WBH: 'maison_roofBorder.svg',
		AB1: 'maison_roofBorder.svg',
		WBE: 'maison_roofBorder.svg',
		WBR: 'maison_roofBorder.svg',
		ChiNb: 'maison_chimney_nb.svg',
		ChiOffset: 'maison_chimney_nb.svg',
		ChiH: 'maison_chimney.svg',
		ChiW: 'maison_chimney.svg',
		ChiT: 'maison_chimney.svg'
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
	const figSide1 = figure();
	const figSide2 = figure();
	const figTop1 = figure();
	const figTop2 = figure();
	const figChimney = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const s1top = (param.W1 * param.RS) / 100.0;
		const s2top = (param.W2 * param.RS) / 100.0;
		const aA1 = degToRad(param.A1);
		const aEBC = Math.PI - aA1;
		const [lCE, tl1] = triLALrL(param.W1, aEBC, param.W2);
		const [aCEB, tl2] = triLLLrA(lCE, param.W1, param.W2);
		const [aBCE, tl3] = triLLLrA(param.W1, param.W2, lCE);
		const aECD = Math.PI / 2 - aBCE; // check if >= 0
		const aDEC = Math.PI / 2 - aCEB; // check if >= 0
		// some pre-checks
		if (aECD < 0) {
			throw `err785: aEBC ${ffix(radToDeg(aEBC))} degree is negative`;
		}
		if (aDEC < 0) {
			throw `err786: aDEC ${ffix(radToDeg(aDEC))} degree is negative`;
		}
		// below will check if aEBC + aDEC + aA1 = Pi
		// further calculations of step-4
		const [lDE, lDC, tl4] = triALArLL(aECD, lCE, aDEC);
		const aA3 = Math.atan2(lDC, param.W1);
		const aA2 = Math.atan2(lDE, param.W2);
		const lBD = Math.sqrt(param.W1 ** 2 + lDC ** 2);
		const lExt1 = param.L1 + lDC;
		const lExt2 = param.L2 + lDE;
		//const lExt1f = param.L1 + lDC * (1 - param.RS / 100.0);
		//const lExt2f = (lDE * param.RS) / 100.0;
		const aAExt = aA1 - Math.PI;
		const WBL1 = (param.W1 * param.WBL) / 100.0;
		const WBH1 = (param.W1 * param.WBH) / 100.0;
		const WBL2 = (param.W2 * param.WBL) / 100.0;
		const WBH2 = (param.W2 * param.WBH) / 100.0;
		const WBEstroke = param.WBR < 1 ? true : false;
		const WBER = (param.WBE * param.WBR) / 200.0;
		const aAB1 = degToRad(param.AB1);
		const WBH1H = WBH1 * Math.tan(aAB1);
		const r12 = param.W2 / param.W1;
		const WF2 = param.WF1 * r12;
		const WBL1b = WBL1 + param.WBE * 2;
		const WBL2b = WBL2 + param.WBE * r12 * 2;
		const L1d = WBL1b * Math.tan(aA3);
		const L1i = param.L1 - L1d;
		const L1e = lExt1 + L1d;
		const L2d = WBL2b * Math.tan(aA2);
		//const L2i = param.L2 - L2d;
		const L2e = lExt2 + L2d;
		const H23min = Math.min(param.H2, param.H3);
		const ChiHeight = param.H1 + param.ChiH - H23min;
		const ChiNb = 5 - param.ChiNb;
		// step-5 : checks on the parameter values
		if (param.H1 < param.H2 || param.H1 < param.H3) {
			throw `err885: H1 ${ffix(param.H1)} is too small compare to H2 ${ffix(param.H2)} or H3 ${ffix(param.H3)}`;
		}
		const sumA = aECD + aDEC + aA1;
		if (Math.abs(sumA - Math.PI) > 0.001) {
			throw `err786: sum of aDEC, aDEC and aA1 is not 1880 degree: ${ffix(radToDeg(aDEC))}, aDEC ${ffix(radToDeg(aDEC))}, aA1 ${ffix(radToDeg(aA1))}, sum ${ffix(radToDeg(sumA))}`;
		}
		// step-6 : any logs
		rGeome.logstr += `maison: height ${ffix(param.H1)} m\n`;
		rGeome.logstr += `maison: aA3: ${ffix(radToDeg(aA3))}, aA2: ${ffix(radToDeg(aA2))} degree\n`;
		rGeome.logstr += `fold lBD: ${ffix(lBD)} m\n`;
		rGeome.logstr += `Roof border: low-1: ${ffix(WBL1)} low-2: ${ffix(WBL2)} high-1: ${ffix(WBH1)} high-2: ${ffix(WBH2)}\n`;
		rGeome.logstr += `Roof top: WF1: ${ffix(param.WF1)} WF2: ${ffix(WF2)} m  ratio12: ${ffix(r12)}\n`;
		//rGeome.logstr += `dbg326:\n${tl1}\n${tl2}\n${tl3}\n${tl4}\n`;
		rGeome.logstr += `triangule: ${tl1}${tl2}${tl3}${tl4}\n`;
		// step-7 : drawing of the figures
		// figSide1
		function ctrSide(
			aW: number,
			aWBL: number,
			aWBH: number,
			aSTop: number,
			aWF: number
		): tContour {
			const rCtr = contour(0, 0)
				.addSegStrokeA(aW, 0)
				.addSegStrokeA(aW, param.H2)
				.addSegStrokeA(aW + aWBL, param.H2);
			if (WBEstroke) {
				rCtr.addSegStrokeA(aW + aWBL, param.H2 + param.WBE);
			} else {
				rCtr.addPointA(aW + aWBL + WBER, param.H2 + param.WBE / 2)
					.addPointA(aW + aWBL, param.H2 + param.WBE)
					.addSegArc2();
			}
			rCtr.addSegStrokeA(aW + aWBL - aWBH, param.H2 + param.WBE + WBH1H)
				.addSegStrokeA(aSTop + aWF / 2, param.H1)
				.addSegStrokeA(aSTop - aWF / 2, param.H1)
				.addSegStrokeA(-aWBL + aWBH, param.H3 + param.WBE + WBH1H)
				.addSegStrokeA(-aWBL, param.H3 + param.WBE);
			if (WBEstroke) {
				rCtr.addSegStrokeA(-aWBL, param.H3);
			} else {
				rCtr.addPointA(-aWBL - WBER, param.H3 + param.WBE / 2)
					.addPointA(-aWBL, param.H3)
					.addSegArc2();
			}
			rCtr.addSegStrokeA(0, param.H3).closeSegStroke();
			return rCtr;
		}
		const ctrSide1 = ctrSide(param.W1, WBL1, WBH1, s1top, param.WF1);
		const ctrSide2 = ctrSide(param.W2, WBL2, WBH2, s2top, WF2);
		const ctrChimenySide = ctrRectangle(s1top - param.ChiW / 2, H23min, param.ChiW, ChiHeight);
		figSide1.addMainO(ctrSide1);
		figSide1.addSecond(ctrSide2.translate(s1top - s2top, 0));
		if (ChiNb > 0) {
			figSide1.addSecond(ctrChimenySide);
		}
		// figSide2
		figSide2.addMainO(ctrSide2);
		figSide2.addSecond(ctrSide1.translate(s2top - s1top, 0));
		if (ChiNb > 0) {
			figSide2.addSecond(ctrChimenySide);
		}
		// figTop1
		const ctrRoof1 = contour(-WBL1b, 0)
			.addSegStrokeA(param.W1 + WBL1b, 0)
			.addSegStrokeA(param.W1 + WBL1b, L1i)
			.addSegStrokeA(-WBL1b, L1e)
			.closeSegStroke();
		const ctrRoofWall1 = contour(0, 0)
			.addSegStrokeA(param.W1, 0)
			.addSegStrokeA(param.W1, param.L1)
			.addSegStrokeA(0, lExt1)
			.closeSegStroke();
		function ctrFaitiere(
			aW: number,
			aWBL: number,
			aWBH: number,
			aSTop: number,
			aWF: number,
			aS: number,
			aL: number
		): tContour {
			const rCtr = contour(0, aL)
				.addSegStrokeA(0, aS)
				.addSegStrokeA(-aWBL, aS)
				.addSegStrokeA(-aWBL, aL)
				.addSegStrokeA(-aWBL + aWBH, aL)
				.addSegStrokeA(-aWBL + aWBH, aS)
				.addSegStrokeA(aSTop - aWF / 2, aS)
				.addSegStrokeA(aSTop - aWF / 2, aL)
				.addSegStrokeA(aSTop, aL)
				.addSegStrokeA(aSTop, aS)
				.addSegStrokeA(aSTop + aWF / 2, aS)
				.addSegStrokeA(aSTop + aWF / 2, aL)
				.addSegStrokeA(aW + aWBL - aWBH, aL)
				.addSegStrokeA(aW + aWBL - aWBH, aS)
				.addSegStrokeA(aW + aWBL, aS)
				.addSegStrokeA(aW + aWBL, aL)
				.addSegStrokeA(aW, aL)
				.addSegStrokeA(aW, aS);
			return rCtr;
		}
		const ctrFaitiere1 = ctrFaitiere(param.W1, WBL1, WBH1, s1top, param.WF1, 0, lExt1);
		const ctrRoof2 = contour(-WBL2b, -L2d)
			.addSegStrokeA(param.W2 + WBL2b, lDE + L2d)
			.addSegStrokeA(param.W2 + WBL2b, lExt2)
			.addSegStrokeA(-WBL2b, lExt2)
			.closeSegStroke();
		const ctrRoofWall2 = contour(0, 0)
			.addSegStrokeA(param.W2, lDE)
			.addSegStrokeA(param.W2, lExt2)
			.addSegStrokeA(0, lExt2)
			.closeSegStroke();
		const ctrFaitiere2 = ctrFaitiere(param.W2, WBL2, WBH2, s2top, WF2, 0, lExt2);
		figTop1.addMainO(ctrRoof1);
		figTop1.addDynamics(ctrRoofWall1);
		figTop1.addSecond(ctrFaitiere1);
		figTop1.addSecond(ctrRoof2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		figTop1.addDynamics(ctrRoofWall2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		figTop1.addSecond(ctrFaitiere2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		// figTop2
		figTop2.addMainO(ctrRoof2);
		figTop2.addDynamics(ctrRoofWall2);
		figTop2.addSecond(ctrFaitiere2);
		figTop2.addSecond(ctrRoof1.translate(0, -lExt1).rotate(0, 0, -aAExt));
		figTop2.addDynamics(ctrRoofWall1.translate(0, -lExt1).rotate(0, 0, -aAExt));
		figTop2.addSecond(ctrFaitiere1.translate(0, -lExt1).rotate(0, 0, -aAExt));
		// figChimney
		const ctrChiTopList: tContour[] = [
			ctrRectangle(s1top - param.ChiW / 2, param.ChiOffset, param.ChiW, param.ChiT)
		];
		if (ChiNb > 1) {
			ctrChiTopList.push(
				ctrRectangle(
					s2top - param.ChiW / 2,
					lExt2 - param.ChiOffset - param.ChiT,
					param.ChiW,
					param.ChiT
				)
					.translate(0, lExt1)
					.rotate(0, lExt1, aAExt)
			);
		}
		if (ChiNb > 2) {
			ctrChiTopList.push(
				ctrRectangle(
					s1top - param.ChiW / 2,
					param.L1 + (lDC - param.ChiT) / 2,
					param.ChiW,
					param.ChiT
				).rotate(s1top, param.L1 + lDC / 2, -aA3)
			);
		}
		if (ChiNb > 3) {
			ctrChiTopList.push(
				ctrRectangle(
					s1top - param.ChiW / 2,
					(lExt1 + param.ChiOffset - param.ChiT) / 2,
					param.ChiW,
					param.ChiT
				)
			);
		}
		if (ChiNb > 4) {
			ctrChiTopList.push(
				ctrRectangle(
					s2top - param.ChiW / 2,
					(lExt2 - param.ChiOffset - param.ChiT) / 2,
					param.ChiW,
					param.ChiT
				)
					.translate(0, lExt1)
					.rotate(0, lExt1, aAExt)
			);
		}
		for (const iCtr of ctrChiTopList) {
			figChimney.addMainO(iCtr);
		}
		figChimney.addSecond(ctrRoofWall1);
		figChimney.addDynamics(ctrRoofWall1);
		figChimney.addSecond(ctrFaitiere1);
		figChimney.addSecond(ctrRoofWall2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		figChimney.addDynamics(ctrRoofWall2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		figChimney.addSecond(ctrFaitiere2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		// add chimneys to figTop1 and figTop2
		if (ChiNb > 0) {
			for (const iCtr of ctrChiTopList) {
				figTop1.addSecond(iCtr);
				figTop2.addSecond(iCtr.translate(0, -lExt1).rotate(0, 0, -aAExt));
			}
		}
		// final figure list
		rGeome.fig = {
			faceSide1: figSide1,
			faceSide2: figSide2,
			faceTop1: figTop1,
			faceTop2: figTop2,
			faceChimney: figChimney
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		const t3dTop2 = transform3d().addRotation(0, 0, aAExt).addTranslation(0, lExt1, 0);
		const t3dSide2 = transform3d()
			.addRotation(Math.PI / 2, 0, 0)
			.addTranslation(0, lExt2, 0)
			.addRotation(0, 0, aAExt)
			.addTranslation(0, lExt1, 0);
		const unionList = [`ipax_${designName}_1`, `ipax_${designName}_2`];
		if (ChiNb > 0) {
			unionList.push(`subpax_${designName}_chi1`);
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_top1`,
					face: `${designName}_faceTop1`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_side1`,
					face: `${designName}_faceSide1`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: L1e,
					rotate: [Math.PI / 2, 0, 0],
					translate: [0, L1e, 0]
				},
				{
					outName: `subpax_${designName}_top2`,
					face: `${designName}_faceTop2`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H1,
					rotate: t3dTop2.getRotation(),
					translate: t3dTop2.getTranslation()
				},
				{
					outName: `subpax_${designName}_side2`,
					face: `${designName}_faceSide2`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: L2e,
					rotate: t3dSide2.getRotation(),
					translate: t3dSide2.getTranslation()
				},
				{
					outName: `subpax_${designName}_chi1`,
					face: `${designName}_faceChimney`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: ChiHeight,
					rotate: [0, 0, 0],
					translate: [0, 0, H23min]
				}
			],
			volumes: [
				{
					outName: `ipax_${designName}_1`,
					boolMethod: EBVolume.eIntersection,
					inList: [`subpax_${designName}_top1`, `subpax_${designName}_side1`]
				},
				{
					outName: `ipax_${designName}_2`,
					boolMethod: EBVolume.eIntersection,
					inList: [`subpax_${designName}_top2`, `subpax_${designName}_side2`]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: unionList
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'maison drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const maisonDef: tPageDef = {
	pTitle: 'Maison',
	pDescription: 'An house with a fold',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { maisonDef };
