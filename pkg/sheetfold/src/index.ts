// index.ts : entry point of the library sheetfold

import type { Figure, tVolume, tContour } from 'geometrix';
import { Contour, figure } from 'geometrix';

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
	length: number;
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

class Facet {
	/** @internal */
	outerInner: tContourJ[] = [];
	constructor(iOuterInner: tContourJ[]) {
		for (const iCtr of iOuterInner) {
			this.outerInner.push(iCtr);
		}
	}
}

class SheetFold {
	/** @internal */
	pFacets: Facet[] = [];
	pJuncs: tJuncs2 = {};
	constructor(iFacets: Facet[], iJuncs: tJuncs) {
		const jNames2 = Object.keys(iJuncs);
		for (const [iFacetIdx, iFacet] of iFacets.entries()) {
			for (const [iCtrIdx, iCtr] of iFacet.outerInner.entries()) {
				if (iCtr instanceof ContourJ) {
					for (const [iJuncIdx, iJuncName] of iCtr.junctionID.entries()) {
						const jNames = Object.keys(this.pJuncs);
						if (jNames.includes(iJuncName)) {
							if (1 === this.pJuncs[iJuncName].associated) {
								this.pJuncs[iJuncName].associated = 2;
								this.pJuncs[iJuncName].a2FacetIdx = iFacetIdx;
								this.pJuncs[iJuncName].a2ContIdx = iCtrIdx;
								this.pJuncs[iJuncName].a2JuncIdx = iJuncIdx;
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
									a1JuncIdx: iJuncIdx,
									a2FacetIdx: -1,
									a2ContIdx: -1,
									a2JuncIdx: -1,
									length: 0
								};
							} else {
								throw `err129: jName ${iJuncName} not defined in junction-list`;
							}
						}
					}
				}
			}
			this.pFacets.push(iFacet);
		}
	}
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
function sheetFold(iFacets: Facet[], iJuncs: tJuncs): SheetFold {
	return new SheetFold(iFacets, iJuncs);
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
