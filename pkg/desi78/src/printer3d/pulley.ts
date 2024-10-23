// pulley.ts
// three spherical lens

// step-1 : import from geometrix
import type {
	//Contour,
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
	//line,
	//vector,
	contour,
	contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	//radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	//pDropdown,
	pSectionSeparator,
	initGeom,
	EExtrude,
	EBVolume
} from 'geometrix';
//import { triAArA, triALArLL, triLALrL, triALLrL, triALLrLAA, triLLLrA, triLLLrAAA } from 'triangule';
import { triLALrL, triALLrL, triLLLrA } from 'triangule';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'pulley',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('zn', 'peg', 100, 3, 300, 1),
		pNumber('pim', 'mm', 2, 0.5, 20, 0.05),
		pSectionSeparator('Profile details'),
		pNumber('bw', 'mm', 0.45, 0.1, 3, 0.01),
		pNumber('nw', 'mm', 0.9, 0.1, 3, 0.01),
		pNumber('pegR', 'mm', 0.55, 0.05, 2, 0.01),
		pNumber('ha', 'degree', 5, -40, 40, 1),
		pNumber('ra', 'mm', 0, 0, 3, 0.1),
		pSectionSeparator('Inner hollow'),
		pNumber('rw', 'mm', 2, 0.5, 10, 0.1),
		pSectionSeparator('Rim'),
		pNumber('rimPlus', 'mm', 1.5, -2, 4, 0.5),
		pCheckbox('rimLeft', true),
		pCheckbox('rimRight', true),
		pSectionSeparator('Widths'),
		pNumber('wheelW', 'mm', 7, 1, 10, 0.1),
		pNumber('rimW', 'mm', 1.2, 0.5, 5, 0.1)
	],
	paramSvg: {
		zn: 'pulley_peg.svg',
		pim: 'pulley_peg.svg',
		bw: 'pulley_peg.svg',
		nw: 'pulley_peg.svg',
		pegR: 'pulley_peg.svg',
		ha: 'pulley_peg.svg',
		ra: 'pulley_peg.svg',
		rw: 'pulley_peg.svg',
		rimPlus: 'pulley_rim.svg',
		rimLeft: 'pulley_rim.svg',
		rimRight: 'pulley_rim.svg',
		wheelW: 'pulley_rim.svg',
		rimW: 'pulley_rim.svg'
	},
	sim: {
		tMax: 100,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

//const c_simOne = 0;
//const c_simTwo = 1;
//const c_simParallel = 2;
//const c_simObject = 3;

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figPulleyProfile = figure();
	const figPulleyRim = figure();
	const figPulleyWidth = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const D1 = (param.zn * param.pim) / Math.PI;
		const R1 = D1 / 2;
		const R2 = R1 - param.bw;
		const R3 = R2 - param.nw;
		const R4 = R2 - param.rw;
		const ap = (2 * Math.PI) / param.zn;
		const lAC = R3 + param.pegR;
		const aACD = Math.PI / 2 - degToRad(param.ha);
		const lCD = param.pegR;
		//const lAD = Math.sqrt(lAC ** 2 + lCD ** 2 - 2 * lAC * lCD * Math.cos(aACD));
		const lAD = triLALrL(lAC, aACD, lCD);
		//const aCDA = Math.asin((Math.sin(aACD) * lAC) / lAD); // law of sines
		//const aCDA = Math.acos((lCD ** 2 + lAD ** 2 - lAC ** 2) / (2 * lCD * lAD)); // law of cosines
		const aCDA = triLLLrA(lCD, lAC, lAD);
		//console.log(`dbg115: lAD ${ffix(lAD)} ${ffix(lAD2)}  aCDA ${ffix(aCDA)} ${ffix(aCDA2)}`);
		//const aCAD = Math.asin((Math.sin(aACD) * lCD) / lAD);
		const aCAD = triLLLrA(lAD, lCD, lAC);
		const aADF = aCDA + Math.PI / 2;
		//const sign = aCDA < Math.PI / 2 ? -1 : 1;
		//rGeome.logstr += `dbg789: aCDA: ${aCDA}, sign: ${sign}\n`;
		//const eqA = 1;
		//const eqB = -2 * lAD * Math.cos(aADF);
		//const eqC = lAD ** 2 - R2 ** 2;
		//const eqD = eqB ** 2 - 4 * eqA * eqC;
		//if (eqD < 0) {
		//	throw `err116: discriminant ${eqD} of quadratic equation is negatif`;
		//}
		//const x1 = (-eqB + Math.sqrt(eqD)) / (2 * eqA);
		//const x2 = (-eqB - Math.sqrt(eqD)) / (2 * eqA);
		const [x1, x2] = triALLrL(aADF, lAD, R2);
		const lDF = Math.min(Math.abs(x1), Math.abs(x2));
		//const aDAF = Math.asin((Math.sin(aADF) * lDF) / R2);
		const aDAF = triLLLrA(lAD, lDF, R2);
		//console.log(`dbg133: aCAD ${ffix(aCAD)} ${ffix(aCAD2)}  aDAF ${ffix(aDAF)} ${ffix(aDAF2)}`);
		const aCAF = aCAD - aDAF;
		//rGeome.logstr += `dbg783: aCAD: ${aCAD}, aDAF: ${aDAF}, aCAF: ${aCAF}rad\n`;
		const apd = 2 * aCAF;
		const apa = ap - apd;
		//rGeome.logstr += `dbg785: ap: ${ap}, apd: ${apd}, apa: ${apa}\n`;
		const rimR = R2 + param.rimPlus;
		const wheelWh = param.wheelW / 2;
		// step-5 : checks on the parameter values
		//if (x1 <= 0) {
		//	throw `err109: x1 ${x1} is negative`;
		//}
		//if (x2 <= 0) {
		//	throw `err114: x2 ${x2} is negative`;
		//}
		if (lAD > R2) {
			throw `err332: lAD ${lAD} is larger than R2 ${R2}`;
		}
		if (apa <= 0) {
			throw `err115: apa ${apa} is negative`;
		}
		if (apd <= 0) {
			throw `err116: apd ${apd} is negative`;
		}
		if (R4 <= 0) {
			throw `err123: R4 ${R4} is negative`;
		}
		if (R3 <= R4) {
			throw `err126: R3 ${R3} is too small compare to R4 ${R4}`;
		}
		if (rimR <= R4) {
			throw `err129: rimR ${rimR} smaller than R4 ${R4}`;
		}
		// step-6 : any logs
		rGeome.logstr += `R1: ${ffix(R1)}  D1: ${ffix(2 * R1)} mm\n`;
		rGeome.logstr += `R2: ${ffix(R2)}  D2: ${ffix(2 * R2)} mm\n`;
		rGeome.logstr += `R3: ${ffix(R3)}  D3: ${ffix(2 * R3)} mm\n`;
		rGeome.logstr += `R4: ${ffix(R4)}  D4: ${ffix(2 * R4)} mm\n`;
		rGeome.logstr += `pitch length at R2: ${ffix(ap * R2)} mm\n`;
		rGeome.logstr += `addendum length: ${ffix(apa * R2)} mm\n`;
		rGeome.logstr += `dedendum length: ${ffix(apd * R2)} mm\n`;
		// step-7 : drawing of the figures
		// figPulleyProfile
		const ctrP = contour(R2, 0);
		for (let idx = 0; idx < param.zn; idx++) {
			const idxA = idx * ap;
			const idxAp = idxA + apa + apd / 2;
			ctrP.addPointAP(idxA + apa / 2, R2)
				.addPointAP(idxA + apa, R2)
				.addSegArc2();
			ctrP.addCornerRounded(param.ra);
			ctrP.addSegStrokeAP(idxAp - aCAD, lAD);
			ctrP.addPointAP(idxAp, R3)
				.addPointAP(idxAp + aCAD, lAD)
				.addSegArc2();
			//ctrP.addSegStrokeAP(idxAp, R3 - pegR).addSegStrokeAP(idxAp + aBD, lAD);
			ctrP.addSegStrokeAP(idxA + ap, R2);
			ctrP.addCornerRounded(param.ra);
		}
		figPulleyProfile.addMainOI([ctrP, contourCircle(0, 0, R4)]);
		figPulleyProfile.addSecond(contourCircle(0, 0, R1));
		figPulleyProfile.addSecond(contourCircle(0, 0, R2));
		figPulleyProfile.addSecond(contourCircle(0, 0, R3));
		// figPulleyRim
		figPulleyRim.addMainOI([contourCircle(0, 0, rimR), contourCircle(0, 0, R4)]);
		figPulleyRim.addSecond(ctrP);
		// figPulleyWidth
		figPulleyWidth.addMainO(ctrRectangle(-wheelWh, -R2, param.wheelW, 2 * R2));
		figPulleyWidth.addMainO(ctrRectangle(-wheelWh - param.rimW, -rimR, param.rimW, 2 * rimR));
		figPulleyWidth.addMainO(ctrRectangle(wheelWh, -rimR, param.rimW, 2 * rimR));
		// final figure list
		rGeome.fig = {
			facePulleyProfile: figPulleyProfile,
			facePulleyRim: figPulleyRim,
			facePulleyWidth: figPulleyWidth
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		const preInList: string[] = [];
		if (param.rimLeft) {
			preInList.push(`subpax_${designName}_rim1`);
		}
		preInList.push(`subpax_${designName}_wheel`);
		if (param.rimRight) {
			preInList.push(`subpax_${designName}_rim2`);
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_wheel`,
					face: `${designName}_facePulleyProfile`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.wheelW,
					rotate: [0, 0, 0],
					translate: [0, 0, param.rimW]
				},
				{
					outName: `subpax_${designName}_rim1`,
					face: `${designName}_facePulleyRim`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.rimW,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_rim2`,
					face: `${designName}_facePulleyRim`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.rimW,
					rotate: [0, 0, 0],
					translate: [0, 0, param.wheelW + param.rimW]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: preInList
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'pulley drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const pulleyDef: tPageDef = {
	pTitle: 'Pulley',
	pDescription: 'A pulley for belt with peg',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { pulleyDef };
