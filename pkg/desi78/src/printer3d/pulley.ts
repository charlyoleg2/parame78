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
	partName: 'pulley',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('zn', 'peg', 100, 9, 300, 1),
		pNumber('pim', 'mm', 2, 0.5, 20, 0.05),
		pNumber('pil', 'mm', 0.4, 0.1, 20, 0.05),
		pSectionSeparator('Profile details'),
		pNumber('bw', 'mm', 0.45, 0.1, 3, 0.01),
		pNumber('nw', 'mm', 0.4, 0.1, 3, 0.01),
		pDropdown('addendum', ['stroke', 'arc']),
		pNumber('ha', 'degree', 5, -40, 40, 1),
		pNumber('ra', 'mm', 0, 0, 3, 0.1),
		pSectionSeparator('Inner hollow'),
		pNumber('rw', 'mm', 2, 0.5, 10, 0.1),
		pSectionSeparator('Rim'),
		pNumber('rimPlus', 'mm', 1.5, -2, 4, 0.5),
		pSectionSeparator('Widths'),
		pNumber('wheelW', 'mm', 7, 1, 10, 0.1),
		pNumber('rimW', 'mm', 1.2, 0.5, 5, 0.1)
	],
	paramSvg: {
		zn: 'pulley_peg.svg',
		pim: 'pulley_peg.svg',
		pil: 'pulley_peg.svg',
		bw: 'pulley_peg.svg',
		nw: 'pulley_peg.svg',
		ha: 'pulley_peg.svg',
		ra: 'pulley_peg.svg',
		rw: 'pulley_peg.svg',
		rimPlus: 'pulley_rim.svg',
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
		const R1 = (param.zn * param.pim) / Math.PI;
		const R2 = R1 - param.bw;
		const R3 = R2 - param.nw;
		const R4 = R2 - param.rw;
		const ap = (2 * Math.PI) / param.zn;
		const apa = (ap * 2 * param.pil) / param.pim;
		const apd = ap - apa;
		const rimR = R2 + param.rimPlus;
		const wheelWh = param.wheelW / 2;
		const apdh = apd / 2;
		const aha = degToRad(param.ha);
		const tmpA = aha - apdh;
		const lAB = (R2 * Math.sin(tmpA)) / Math.sin(aha);
		const lBC = R3 - lAB;
		const pegR = lBC * Math.sin(aha); // lCD
		const lBD = lBC * Math.cos(aha);
		const aAD = Math.PI - aha;
		const lAD = Math.sqrt(lAB ** 2 + lBD ** 2 - 2 * lAB * lBD * Math.cos(aAD)); // law of cosines
		const aBD = Math.asin((lBD * Math.sin(aAD)) / lAD);
		// step-5 : checks on the parameter values
		if (tmpA <= 0) {
			throw `err109: tmpA ${tmpA} is negative`;
		}
		if (lBC <= 0) {
			throw `err114: lBC ${lBC} is negative. R3 ${R3}, lAB ${lAB}`;
		}
		if (R4 <= 0) {
			throw `err123: R4 ${R4} is negative`;
		}
		if (R3 - pegR <= R4) {
			throw `err126: R3 ${R3} is too small compare to pegR ${pegR} and R4 ${R4}`;
		}
		if (rimR <= R4) {
			throw `err129: rimR ${rimR} smaller than R4 ${R4}`;
		}
		// step-6 : any logs
		rGeome.logstr += `R1: ${ffix(R1)} mm\n`;
		rGeome.logstr += `R2: ${ffix(R2)} mm\n`;
		rGeome.logstr += `R3: ${ffix(R3)} mm\n`;
		rGeome.logstr += `R4: ${ffix(R4)} mm\n`;
		rGeome.logstr += `pegR: ${ffix(pegR)} mm\n`;
		// step-7 : drawing of the figures
		// figPulleyProfile
		const ctrP = contour(R2, 0);
		for (let idx = 0; idx < param.zn; idx++) {
			const idxA = idx * ap;
			const idxAp = idxA + apa + apd / 2;
			if (param.addendum === 0) {
				// stroke
				ctrP.addSegStrokeAP(idxA + apa, R2);
			} else {
				ctrP.addPointAP(idxA + apa / 2, R2)
					.addPointAP(idxA + apa, R2)
					.addSegArc2();
			}
			ctrP.addCornerRounded(param.ra);
			ctrP.addSegStrokeAP(idxAp - aBD, lAD);
			ctrP.addPointAP(idxAp, R3 - pegR)
				.addPointAP(idxAp + aBD, lAD)
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
					inList: [
						`subpax_${designName}_rim1`,
						`subpax_${designName}_wheel`,
						`subpax_${designName}_rim2`
					]
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
