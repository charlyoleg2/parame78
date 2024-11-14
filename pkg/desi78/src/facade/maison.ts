// maison.ts
// an house with a fold

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
	//point,
	//Point,
	//ShapePoint,
	//vector,
	contour,
	//contourCircle,
	//ctrRectangle,
	figure,
	degToRad,
	radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
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
		pNumber('WF', 'm', 0.4, 0, 1.5, 0.1),
		pNumber('WBL', '%', 3.0, 0, 20, 0.01),
		pNumber('WBH', '%', 5.0, 0, 20, 0.01),
		pNumber('AB', 'degree', 15, 0, 80, 1),
		pNumber('WBE', 'm', 0.3, 0.05, 1, 0.01),
		pNumber('WBR', '%', 50, 0, 100, 1),
		pSectionSeparator('Chimney'),
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
		WF: 'maison_roofBorder.svg',
		WBL: 'maison_roofBorder.svg',
		WBH: 'maison_roofBorder.svg',
		AB: 'maison_roofBorder.svg',
		WBE: 'maison_roofBorder.svg',
		WBR: 'maison_roofBorder.svg',
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
		const [lDC, lDE, tl4] = triALArLL(aECD, lCE, aDEC);
		const aA3 = Math.atan2(lDC, param.W1);
		const aA2 = Math.atan2(lDE, param.W2);
		const lBD = Math.sqrt(param.W1 ** 2 + lDC ** 2);
		const lExt1 = param.L1 + lDE;
		const lExt2 = param.L2 + lDC;
		const lExt1f = param.L1 + lDE * (1 - param.RS / 100.0);
		const lExt2f = (lDC * param.RS) / 100.0;
		const aAExt = aA1 - Math.PI;
		const WBL1 = (param.L1 * param.WBL) / 100.0;
		const WBH1 = (param.L1 * param.WBH) / 100.0;
		const WBL2 = (param.L2 * param.WBL) / 100.0;
		const WBH2 = (param.L2 * param.WBH) / 100.0;
		const WBEstroke = param.WBR < 1 ? true : false;
		const WBER = (param.WBE * param.WBR) / 200.0;
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
		//rGeome.logstr += `dbg326:\n${tl1}\n${tl2}\n${tl3}\n${tl4}\n`;
		rGeome.logstr += `triangule: ${tl1}${tl2}${tl3}${tl4}\n`;
		// step-7 : drawing of the figures
		// figSide1
		const ctrSide1 = contour(0, 0)
			.addSegStrokeA(param.W1, 0)
			.addSegStrokeA(param.W1, param.H2)
			.addSegStrokeA(param.W1 + WBL1, param.H2);
		if (WBEstroke) {
			ctrSide1.addSegStrokeA(param.W1 + WBL1, param.H2 + param.WBE);
		} else {
			ctrSide1
				.addPointA(param.W1 + WBL1 + WBER, param.H2 + param.WBE / 2)
				.addPointA(param.W1 + WBL1, param.H2 + param.WBE)
				.addSegArc2();
		}
		ctrSide1.addSegStrokeA(s1top, param.H1).addSegStrokeA(0, param.H3).closeSegStroke();
		const ctrSide2 = contour(0, 0)
			.addSegStrokeA(param.W2, 0)
			.addSegStrokeA(param.W2, param.H2)
			.addSegStrokeA(s2top, param.H1)
			.addSegStrokeA(0, param.H3)
			.closeSegStroke();
		figSide1.addMainO(ctrSide1);
		figSide1.addSecond(ctrSide2.translate(s1top - s2top, 0));
		// figSide2
		figSide2.addMainO(ctrSide2);
		figSide2.addSecond(ctrSide1.translate(s2top - s1top, 0));
		// figTop1
		const ctrRoof1 = contour(0, 0)
			.addSegStrokeA(param.W1, 0)
			.addSegStrokeA(param.W1, param.L1)
			.addSegStrokeA(0, lExt1)
			.closeSegStroke();
		const ctrFaitiere1 = contour(s1top, 0).addSegStrokeA(s1top, lExt1f);
		const ctrRoof2 = contour(0, 0)
			.addSegStrokeA(param.W2, lDC)
			.addSegStrokeA(param.W2, lExt2)
			.addSegStrokeA(0, lExt2)
			.closeSegStroke();
		const ctrFaitiere2 = contour(s2top, lExt2f).addSegStrokeA(s2top, lExt2);
		figTop1.addMainO(ctrRoof1);
		figTop1.addSecond(ctrFaitiere1);
		figTop1.addSecond(ctrRoof2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		figTop1.addSecond(ctrFaitiere2.translate(0, lExt1).rotate(0, lExt1, aAExt));
		// figTop2
		figTop2.addMainO(ctrRoof2);
		figTop2.addSecond(ctrFaitiere2);
		figTop2.addSecond(ctrRoof1.translate(0, -lExt1).rotate(0, 0, -aAExt));
		figTop2.addSecond(ctrFaitiere1.translate(0, -lExt1).rotate(0, 0, -aAExt));
		// final figure list
		rGeome.fig = {
			faceSide1: figSide1,
			faceSide2: figSide2,
			faceTop1: figTop1,
			faceTop2: figTop2
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		const t3dTop2 = transform3d().addRotation(0, 0, aAExt).addTranslation(0, lExt1, 0);
		const t3dSide2 = transform3d()
			.addRotation(Math.PI / 2, 0, 0)
			.addTranslation(0, lExt2, 0)
			.addRotation(0, 0, aAExt)
			.addTranslation(0, lExt1, 0);
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
					length: lExt1,
					rotate: [Math.PI / 2, 0, 0],
					translate: [0, lExt1, 0]
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
					length: lExt2,
					rotate: t3dSide2.getRotation(),
					translate: t3dSide2.getTranslation()
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
					inList: [`ipax_${designName}_1`, `ipax_${designName}_2`]
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
