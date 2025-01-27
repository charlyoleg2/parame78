// index.ts : entry point of the library sheetfold

import type { Figure, tFigures, tVolume, tContour } from 'geometrix';
import { Contour, figure, ffix, SegEnum, isActiveCorner, withinPiPi } from 'geometrix';

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
}
type tJuncs = Record<string, tJunc>;

interface tJunc2 {
	jName: string;
	angle: number;
	radius: number;
	neutral: number;
	associated: number;
	a1FacetIdx: number;
	a1ContIdx: number;
	a1SegIdx: number;
	a1Dir: tJDir;
	a1Side: tJSide;
	a2FacetIdx: number;
	a2ContIdx: number;
	a2SegIdx: number;
	a2Dir: tJDir;
	a2Side: tJSide;
	jLength: number;
	jTeta: number;
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
	pName = '';
	pFacets: Facet[] = [];
	pJuncs: tJunc2[] = [];
	constructor(iName: string, iFacets: Facet[], iJuncs: tJuncs) {
		this.pName = iName;
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
									associated: 1,
									a1FacetIdx: iFacetIdx,
									a1ContIdx: iCtrIdx,
									a1SegIdx: iCtr.junctionPosition[iJuncIdx],
									a1Dir: iCtr.junctionDir[iJuncIdx],
									a1Side: iCtr.junctionSide[iJuncIdx],
									a2FacetIdx: -1,
									a2ContIdx: -1,
									a2SegIdx: -1,
									a2Dir: tJDir.eA,
									a2Side: tJSide.eABRight,
									jLength: 0,
									jTeta: 0
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
	oneTetaLength(faIdx: number, coIdx: number, segIdx: number): [number, number] {
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
		return [rTeta, rLength];
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
				const [jTetaPre, jLength] = this.oneTetaLength(faIdx, coIdx, segIdx);
				let jTeta = jTetaPre;
				if (tJDir.eB === jDir) {
					jTeta = withinPiPi(jTetaPre + Math.PI);
				}
				if (1 === idx) {
					const absDiffL = Math.abs(jLength - iJunc.jLength);
					if (absDiffL > cPrecision) {
						throw `err908: jLength ${ffix(iJunc.jLength)} ${ffix(jLength)} differs of ${absDiffL}`;
					}
					const absDiffA = Math.abs(withinPiPi(jTeta - iJunc.jTeta));
					if (absDiffA > cPrecision) {
						throw `err909: jTeta ${ffix(iJunc.jTeta)} ${ffix(jTeta)} differs of ${absDiffA}`;
					}
					if (iJunc.a1Side === iJunc.a2Side) {
						throw `err905: jSide ${iJunc.a1Side} ${iJunc.a2Side} must be opposite`;
					}
				} else {
					iJunc.jLength = jLength;
					iJunc.jTeta = jTeta;
				}
			}
		}
	}
	makePatternFigure(): Figure {
		this.computeLength();
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
	makeFacetFigures(): tFigures {
		const rfigs: tFigures = {};
		for (const [iFacetIdx, iFacet] of this.pFacets.entries()) {
			const fig = figure();
			const outerInner: tContour[] = [];
			for (const iCtr of iFacet.outerInner) {
				if (iCtr instanceof ContourJ) {
					outerInner.push(contourJ2contour(iCtr));
				} else {
					outerInner.push(iCtr);
				}
			}
			fig.addMainOI(outerInner);
			const faceName = `${this.pName}_f${iFacetIdx.toString().padStart(2, '0')}`;
			rfigs[faceName] = fig;
		}
		return rfigs;
	}
	makeVolume(): tVolume {
		return { extrudes: [], volumes: [] };
	}
}

// instantiation functions
function contourJ(ix: number, iy: number, icolor = ''): ContourJ {
	return new ContourJ(ix, iy, icolor);
}
function facet(iOuterInner: tContourJ[]): Facet {
	return new Facet(iOuterInner);
}
function sheetFold(iName: string, iFacets: Facet[], iJuncs: tJuncs): SheetFold {
	return new SheetFold(iName, iFacets, iJuncs);
}

// other helper functions
function contourJ2contour(iContoutJ: ContourJ): Contour {
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
