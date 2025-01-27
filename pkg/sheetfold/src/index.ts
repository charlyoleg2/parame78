// index.ts : entry point of the library sheetfold

import type { Figure, tFigures, tVolume, tContour } from 'geometrix';
import { Contour, figure, ffix } from 'geometrix';

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
	angle: number;
	radius: number;
	neutral: number;
	associated: number;
	a1FacetIdx: number;
	a1ContIdx: number;
	a1JuncIdx: number;
	a2FacetIdx: number;
	a2ContIdx: number;
	a2JuncIdx: number;
	jLength: number;
}
type tJuncs2 = Record<string, tJunc2>;

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
	pJuncs: tJuncs2 = {};
	constructor(iName: string, iFacets: Facet[], iJuncs: tJuncs) {
		this.pName = iName;
		const jNames2 = Object.keys(iJuncs);
		for (const [iFacetIdx, iFacet] of iFacets.entries()) {
			let backward = 0;
			for (const [iCtrIdx, iCtr] of iFacet.outerInner.entries()) {
				if (iCtr instanceof ContourJ) {
					for (const [iJuncIdx, iJuncName] of iCtr.junctionID.entries()) {
						const jNames = Object.keys(this.pJuncs);
						if (jNames.includes(iJuncName)) {
							if (1 === this.pJuncs[iJuncName].associated) {
								this.pJuncs[iJuncName].associated = 2;
								this.pJuncs[iJuncName].a2FacetIdx = iFacetIdx;
								this.pJuncs[iJuncName].a2ContIdx = iCtrIdx;
								this.pJuncs[iJuncName].a2JuncIdx = iCtr.junctionPosition[iJuncIdx];
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
								this.pJuncs[iJuncName] = {
									angle: iJuncs[iJuncName].angle,
									radius: iJuncs[iJuncName].radius,
									neutral: iJuncs[iJuncName].neutral,
									associated: 1,
									a1FacetIdx: iFacetIdx,
									a1ContIdx: iCtrIdx,
									a1JuncIdx: iCtr.junctionPosition[iJuncIdx],
									a2FacetIdx: -1,
									a2ContIdx: -1,
									a2JuncIdx: -1,
									jLength: 0
								};
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
		const jNames = Object.keys(this.pJuncs);
		for (const jName of jNames) {
			const fa1 = this.pJuncs[jName].a1FacetIdx;
			const co1 = this.pJuncs[jName].a1ContIdx;
			const ju1 = this.pJuncs[jName].a1JuncIdx;
			const fa2 = this.pJuncs[jName].a2FacetIdx;
			const co2 = this.pJuncs[jName].a2ContIdx;
			const ju2 = this.pJuncs[jName].a2JuncIdx;
			console.log(`dbg527: ${jName} : ${fa1} ${co1} ${ju1} : ${fa2} ${co2} ${ju2}`);
		}
	}
	/** @internal */
	oneLength(faIdx: number, coIdx: number, juIdx: number): number {
		const ctr = this.pFacets[faIdx].outerInner[coIdx];
		if (!(ctr instanceof Contour)) {
			throw `err234: faIdx ${faIdx}, coIdx ${coIdx} is not a Contour but a ContourCircle`;
		}
		const segA = ctr.segments[juIdx];
		const segB = ctr.segments[juIdx + 1];
		const rLength = Math.sqrt((segB.px - segA.px) ** 2 + (segB.py - segA.py) ** 2);
		//console.log(`dbg320: ${faIdx} ${coIdx} ${juIdx} has a length of ${ffix(rLength)}`);
		return rLength;
	}
	/** @internal */
	computeLength() {
		//this.printJuncs();
		const jNames = Object.keys(this.pJuncs);
		for (const jName of jNames) {
			for (let idx = 0; idx < this.pJuncs[jName].associated; idx++) {
				let faIdx = this.pJuncs[jName].a1FacetIdx;
				let coIdx = this.pJuncs[jName].a1ContIdx;
				let juIdx = this.pJuncs[jName].a1JuncIdx;
				if (1 === idx) {
					faIdx = this.pJuncs[jName].a2FacetIdx;
					coIdx = this.pJuncs[jName].a2ContIdx;
					juIdx = this.pJuncs[jName].a2JuncIdx;
				}
				const jLength = this.oneLength(faIdx, coIdx, juIdx);
				if (1 === idx) {
					const jLength1 = this.pJuncs[jName].jLength;
					const absDiff = Math.abs(jLength - jLength1);
					if (absDiff > cPrecision) {
						throw `err908: jLength ${ffix(jLength1)} ${ffix(jLength)} differs of ${absDiff}`;
					}
				} else {
					this.pJuncs[jName].jLength = jLength;
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
