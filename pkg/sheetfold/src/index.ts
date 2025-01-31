// index.ts : entry point of the library sheetfold

import type { Figure, tFigures, tVolume, tContour, tExtrude, tBVolume } from 'geometrix';
import {
	Contour,
	figure,
	ffix,
	SegEnum,
	isActiveCorner,
	withinPiPi,
	point,
	EExtrude,
	EBVolume
} from 'geometrix';

enum tJDir {
	eA,
	eB
}

enum tJSide {
	eABRight,
	eABLeft
}

interface tJunc {
	angle: number;
	radius: number;
	neutral: number;
	mark: number;
}
type tJuncs = Record<string, tJunc>;

interface tJunc2 {
	jName: string;
	angle: number;
	radius: number;
	neutral: number;
	mark: number;
	associated: number;
	a1FacetIdx: number;
	a1ContIdx: number;
	a1SegIdx: number;
	a1Dir: tJDir;
	a1Side: tJSide;
	a1x: number;
	a1y: number;
	a1Teta: number;
	a2FacetIdx: number;
	a2ContIdx: number;
	a2SegIdx: number;
	a2Dir: tJDir;
	a2Side: tJSide;
	a2x: number;
	a2y: number;
	a2Teta: number;
	jLength: number;
	diffA: number;
	diffX: number;
	diffY: number;
}

/**
 * class `ContourJ`
 *
 */
class ContourJ extends Contour {
	/** @internal */
	junctionID: string[] = [];
	junctionDir: tJDir[] = [];
	junctionSide: tJSide[] = [];
	junctionPosition: number[] = [];
	lastPosition = -1;
	startJunction(jName: string, aNb: tJDir, abSide: tJSide): ContourJ {
		//console.log(`dbg822: jName: ${jName} aNb: ${aNb}`);
		if (this.junctionID.includes(jName)) {
			throw `err209: junctionID ${jName} already used`;
		}
		const newPosition = this.segments.length - 1;
		if (newPosition === this.lastPosition) {
			throw `err210: junctionID ${jName} overwrites previous junction`;
		}
		this.lastPosition = newPosition;
		this.junctionID.push(jName);
		this.junctionDir.push(aNb);
		this.junctionSide.push(abSide);
		this.junctionPosition.push(newPosition);
		return this;
	}
}

type tContourJ = tContour | ContourJ;

/**
 * class `Facet`
 *
 */
class Facet {
	/** @internal */
	attached = false;
	ax = 0;
	ay = 0;
	aa = 0;
	outerInner: tContourJ[] = [];
	constructor(iOuterInner: tContourJ[]) {
		for (const iCtr of iOuterInner) {
			this.outerInner.push(iCtr);
		}
	}
}

const cPrecision = 10 ** -5;

/**
 * class `SheetFold`
 *
 */
class SheetFold {
	/** @internal */
	pPartName = '';
	pSFMark = '';
	pFacets: Facet[] = [];
	pJuncs: tJunc2[] = [];
	constructor(iFacets: Facet[], iJuncs: tJuncs, iPartName: string, iSFMark: string) {
		this.pPartName = iPartName;
		this.pSFMark = iSFMark;
		const jNames2 = Object.keys(iJuncs);
		for (const [iFacetIdx, iFacet] of iFacets.entries()) {
			let backward = 0;
			for (const [iCtrIdx, iCtr] of iFacet.outerInner.entries()) {
				if (iCtr instanceof ContourJ) {
					for (const [iJuncIdx, iJuncName] of iCtr.junctionID.entries()) {
						const jNames = this.pJuncs.map((item) => item.jName);
						if (jNames.includes(iJuncName)) {
							const jIdx = jNames.findIndex((item) => item === iJuncName);
							if (1 === this.pJuncs[jIdx].associated) {
								const facetIdx1 = this.pJuncs[jIdx].a1FacetIdx;
								if (iFacetIdx <= facetIdx1) {
									throw `err390: junction ${jIdx} connects facets ${facetIdx1} and ${iFacetIdx}. Must be higher!`;
								}
								this.pJuncs[jIdx].associated = 2;
								this.pJuncs[jIdx].a2FacetIdx = iFacetIdx;
								this.pJuncs[jIdx].a2ContIdx = iCtrIdx;
								this.pJuncs[jIdx].a2SegIdx = iCtr.junctionPosition[iJuncIdx];
								this.pJuncs[jIdx].a2Dir = iCtr.junctionDir[iJuncIdx];
								this.pJuncs[jIdx].a2Side = iCtr.junctionSide[iJuncIdx];
								if (0 === backward) {
									backward = 1;
								} else {
									throw `err628: jName ${iJuncName} is the second backward junction of facet-idx ${iFacetIdx}`;
								}
							} else {
								throw `err125: jName ${iJuncName} used a third time in facet-idx ${iFacetIdx}`;
							}
						} else {
							if (jNames2.includes(iJuncName)) {
								this.pJuncs.push({
									jName: iJuncName,
									angle: iJuncs[iJuncName].angle,
									radius: iJuncs[iJuncName].radius,
									neutral: iJuncs[iJuncName].neutral,
									mark: iJuncs[iJuncName].mark,
									associated: 1,
									a1FacetIdx: iFacetIdx,
									a1ContIdx: iCtrIdx,
									a1SegIdx: iCtr.junctionPosition[iJuncIdx],
									a1Dir: iCtr.junctionDir[iJuncIdx],
									a1Side: iCtr.junctionSide[iJuncIdx],
									a1x: 0,
									a1y: 0,
									a1Teta: 0,
									a2FacetIdx: -1,
									a2ContIdx: -1,
									a2SegIdx: -1,
									a2Dir: tJDir.eA,
									a2Side: tJSide.eABRight,
									a2x: 0,
									a2y: 0,
									a2Teta: 0,
									jLength: 0,
									diffA: 0,
									diffX: 0,
									diffY: 0
								});
							} else {
								throw `err129: jName ${iJuncName} not defined in junction-list`;
							}
						}
					}
				}
			}
			if (0 === backward && iFacetIdx > 0) {
				throw `err738: iFacetIdx ${iFacetIdx} has no backward connection`;
			}
			this.pFacets.push(iFacet);
		}
		this.computeLength();
		this.checkFacet();
	}
	/** @internal */
	printJuncs() {
		for (const iJunc of this.pJuncs) {
			const fa1 = iJunc.a1FacetIdx;
			const co1 = iJunc.a1ContIdx;
			const seg1 = iJunc.a1SegIdx;
			const fa2 = iJunc.a2FacetIdx;
			const co2 = iJunc.a2ContIdx;
			const seg2 = iJunc.a2SegIdx;
			console.log(`dbg527: ${iJunc.jName} : ${fa1} ${co1} ${seg1} : ${fa2} ${co2} ${seg2}`);
		}
	}
	/** @internal */
	oneTetaLength(faIdx: number, coIdx: number, segIdx: number): [number, number, number, number] {
		const ctr = this.pFacets[faIdx].outerInner[coIdx];
		if (!(ctr instanceof Contour)) {
			throw `err234: faIdx ${faIdx}, coIdx ${coIdx} is not a Contour but a ContourCircle`;
		}
		const maxLen = ctr.segments.length;
		const segA = ctr.segments[segIdx];
		const segB = ctr.segments[(segIdx + 1) % maxLen];
		const segC = ctr.segments[(segIdx + 2) % maxLen];
		if (isActiveCorner(segA.sType)) {
			throw `err101: junction ${faIdx} ${coIdx} ${segIdx} starts with an active corner`;
		}
		if (SegEnum.eStroke !== segB.sType) {
			throw `err102: junction ${faIdx} ${coIdx} ${segIdx} is not a stroke`;
		}
		if (isActiveCorner(segC.sType)) {
			throw `err103: junction ${faIdx} ${coIdx} ${segIdx} ends with an active corner`;
		}
		const rLength = Math.sqrt((segB.px - segA.px) ** 2 + (segB.py - segA.py) ** 2);
		//console.log(`dbg320: ${faIdx} ${coIdx} ${segIdx} has a length of ${ffix(rLength)}`);
		const rTeta = Math.atan2(segB.py - segA.py, segB.px - segA.px);
		return [segA.px, segA.py, rTeta, rLength];
	}
	/** @internal */
	computeLength() {
		//this.printJuncs();
		for (const iJunc of this.pJuncs) {
			for (let idx = 0; idx < iJunc.associated; idx++) {
				let faIdx = iJunc.a1FacetIdx;
				let coIdx = iJunc.a1ContIdx;
				let segIdx = iJunc.a1SegIdx;
				let jDir = iJunc.a1Dir;
				if (1 === idx) {
					faIdx = iJunc.a2FacetIdx;
					coIdx = iJunc.a2ContIdx;
					segIdx = iJunc.a2SegIdx;
					jDir = iJunc.a2Dir;
				}
				const [xxPre, yyPre, jTetaPre, jLength] = this.oneTetaLength(faIdx, coIdx, segIdx);
				let jTeta = jTetaPre;
				let xx = xxPre;
				let yy = yyPre;
				if (tJDir.eB === jDir) {
					const pA = point(xxPre, yyPre).translatePolar(jTetaPre, jLength);
					xx = pA.cx;
					yy = pA.cy;
					jTeta = withinPiPi(jTetaPre + Math.PI);
				}
				if (1 === idx) {
					const absDiffL = Math.abs(jLength - iJunc.jLength);
					if (absDiffL > cPrecision) {
						throw `err908: jLength ${ffix(iJunc.jLength)} ${ffix(jLength)} differs of ${absDiffL}`;
					}
					if (iJunc.a1Side === iJunc.a2Side) {
						throw `err905: jSide ${iJunc.a1Side} ${iJunc.a2Side} must be opposite`;
					}
					iJunc.a2x = xx;
					iJunc.a2y = yy;
					iJunc.a2Teta = jTeta;
					iJunc.diffA = withinPiPi(iJunc.a2Teta - iJunc.a1Teta);
					iJunc.diffX = iJunc.a2x - iJunc.a1x;
					iJunc.diffY = iJunc.a2y - iJunc.a1y;
					if (this.pFacets[faIdx].attached === false) {
						this.pFacets[faIdx].attached = true;
						this.pFacets[faIdx].ax = xx;
						this.pFacets[faIdx].ay = yy;
						this.pFacets[faIdx].aa = jTeta;
					} else {
						throw `err545: pFacet ${faIdx} ax is already set`;
					}
				} else {
					iJunc.jLength = jLength;
					iJunc.a1Teta = jTeta;
					iJunc.a1x = xx;
					iJunc.a1y = yy;
				}
			}
		}
	}
	checkFacet() {
		for (const [iFacetIdx, iFacet] of this.pFacets.entries()) {
			if (iFacetIdx > 0 && iFacet.attached === false) {
				throw `err464: pFacet ${iFacetIdx} ax is not set`;
			}
		}
	}
	// end of constructor sub-functions
	makePatternFigure(): Figure {
		const rfig = figure();
		const outerInner: tContour[] = [];
		for (const iFacet of this.pFacets) {
			for (const iCtr of iFacet.outerInner) {
				if (iCtr instanceof ContourJ) {
					outerInner.push(contourJ2contour(iCtr));
				} else {
					outerInner.push(iCtr);
				}
			}
		}
		rfig.addMainOI(outerInner);
		return rfig;
	}
	nameFace(idx: number): string {
		const rStr = `${this.pSFMark}_f${idx.toString().padStart(2, '0')}`;
		return rStr;
	}
	makeFacetFigures(): tFigures {
		const rfigs: tFigures = {};
		for (const [iFacetIdx, iFacet] of this.pFacets.entries()) {
			const fig = figure();
			const outerInner: tContour[] = [];
			for (const iCtr of iFacet.outerInner) {
				let ctr1 = contourJ2contour(iCtr);
				if (iFacetIdx > 0) {
					ctr1 = ctr1
						.translate(-iFacet.ax, -iFacet.ay)
						.rotate(0, 0, Math.PI / 2 - iFacet.aa);
				}
				outerInner.push(ctr1);
			}
			fig.addMainOI(outerInner);
			const faceName = this.nameFace(iFacetIdx);
			rfigs[faceName] = fig;
		}
		return rfigs;
	}
	makeVolume(thickness: number): tVolume {
		const extrudeList: tExtrude[] = [];
		for (const iFacetIdx of this.pFacets.keys()) {
			const subM: tExtrude = {
				outName: `subpax_${this.nameFace(iFacetIdx)}`,
				face: `${this.pPartName}_${this.nameFace(iFacetIdx)}`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: thickness,
				rotate: [0, 0, 0],
				translate: [0, 0, 4 * thickness * iFacetIdx]
			};
			extrudeList.push(subM);
		}
		const subN = extrudeList.map((item) => item.outName);
		const volumeList: tBVolume[] = [];
		const vol1: tBVolume = {
			outName: `pax_${this.pPartName}`,
			boolMethod: EBVolume.eUnion,
			inList: subN
		};
		volumeList.push(vol1);
		return { extrudes: extrudeList, volumes: volumeList };
	}
}

// instantiation functions
function contourJ(ix: number, iy: number, icolor = ''): ContourJ {
	return new ContourJ(ix, iy, icolor);
}
function facet(iOuterInner: tContourJ[]): Facet {
	return new Facet(iOuterInner);
}
function sheetFold(
	iFacets: Facet[],
	iJuncs: tJuncs,
	iPartName: string,
	iSFMark = 'SFG'
): SheetFold {
	return new SheetFold(iFacets, iJuncs, iPartName, iSFMark);
}

// other helper functions
function contourJ2contour(iContoutJ: tContourJ): tContour {
	return iContoutJ;
}
function facet2figure(iFacet: Facet): Figure {
	const rfig = figure();
	const outerInner: tContour[] = [];
	for (const iCtr of iFacet.outerInner) {
		if (iCtr instanceof ContourJ) {
			outerInner.push(contourJ2contour(iCtr));
		} else {
			outerInner.push(iCtr);
		}
	}
	rfig.addMainOI(outerInner);
	return rfig;
}

export type { ContourJ, SheetFold };
export { tJDir, tJSide, contourJ, facet, sheetFold, contourJ2contour, facet2figure };
