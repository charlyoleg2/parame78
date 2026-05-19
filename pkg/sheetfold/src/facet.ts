// facet.ts

import type { tContour, Transform2d } from 'geometrix';
import { Contour, SegEnum, isSeg } from 'geometrix';

enum tJDir {
	eA,
	eB
}

enum tJSide {
	eABRight,
	eABLeft
}

interface tJunction {
	jName: string;
	jDir: tJDir;
	jSide: tJSide;
	jPosition: number;
}

function invertJDir(iJDir: tJDir): tJDir {
	let rJDir = tJDir.eA;
	if (iJDir === rJDir) {
		rJDir = tJDir.eB;
	}
	return rJDir;
}

/**
 * class `ContourJ`
 *
 */
class ContourJ extends Contour {
	/** @internal */
	pJuncs: tJunction[] = [];
	lastPosition = -1;
	facetIdx = -1;
	ctrIdx = -1;
	used = 0;
	startJunction(jName: string, aNb: tJDir, abSide: tJSide): this {
		//console.log(`dbg822: jName: ${jName} aNb: ${aNb}`);
		for (const iJunc of this.pJuncs) {
			if (iJunc.jName === jName) {
				throw `err209: jName ${jName} already used`;
			}
		}
		const newPosition = this.segments.length - 1;
		if (newPosition === this.lastPosition) {
			throw `err210: jName ${jName} overwrites previous position ${newPosition}`;
		}
		this.lastPosition = newPosition;
		this.pJuncs.push({
			jName: jName,
			jDir: aNb,
			jSide: abSide,
			jPosition: newPosition
		});
		return this;
	}
	findIdx(jName: string): number {
		let rIdx = -1;
		for (const [idx, iJunc] of this.pJuncs.entries()) {
			if (jName === iJunc.jName) {
				rIdx = idx;
			}
		}
		return rIdx;
	}
	cloneJ(iCtr: Contour): ContourJ {
		const rctrJ = new ContourJ(iCtr.segments[0].px, iCtr.segments[0].py);
		for (const seg of iCtr.segments) {
			const nseg = seg.clone();
			if (nseg.sType !== SegEnum.eStart) {
				rctrJ.addSeg(nseg);
				if (isSeg(nseg.sType)) {
					rctrJ.setLastPoint(nseg.px, nseg.py);
				}
			}
		}
		for (const iJunc of this.pJuncs) {
			rctrJ.pJuncs.push({
				jName: iJunc.jName,
				jDir: iJunc.jDir,
				jSide: iJunc.jSide,
				jPosition: iJunc.jPosition
			});
		}
		rctrJ.lastPosition = this.lastPosition;
		return rctrJ;
	}
	generateRevertOrientation(): ContourJ {
		const ctrA = super.generateRevertOrientation();
		const rctrJ = new ContourJ(ctrA.segments[0].px, ctrA.segments[0].py);
		for (const seg of ctrA.segments) {
			const nseg = seg.clone();
			if (nseg.sType !== SegEnum.eStart) {
				rctrJ.addSeg(nseg);
				if (isSeg(nseg.sType)) {
					rctrJ.setLastPoint(nseg.px, nseg.py);
				}
			}
		}
		const jnb = this.pJuncs.length;
		for (let idx = 0; idx < jnb; idx++) {
			const iJunc = this.pJuncs[jnb - idx - 1];
			const lastPos = this.segments.length - 2 - iJunc.jPosition;
			if (lastPos < 0) {
				throw `err110: revert ctrJ len ${this.segments.length} has lastPos ${lastPos} negative`;
			}
			rctrJ.pJuncs.push({
				jName: iJunc.jName,
				jDir: invertJDir(iJunc.jDir),
				jSide: iJunc.jSide,
				jPosition: lastPos
			});
			rctrJ.lastPosition = lastPos;
		}
		return rctrJ;
	}
	translate(ix: number, iy: number): ContourJ {
		const ctrA = super.translate(ix, iy);
		const rCtrJ = this.cloneJ(ctrA);
		return rCtrJ;
	}
	translatePolar(ia: number, il: number): ContourJ {
		return this.translate(il * Math.cos(ia), il * Math.sin(ia));
	}
	rotate(ix: number, iy: number, ia: number): ContourJ {
		const ctrA = super.rotate(ix, iy, ia);
		const rCtrJ = this.cloneJ(ctrA);
		return rCtrJ;
	}
	setIdx(iFacetIdx: number, iCtrIdx: number) {
		this.facetIdx = iFacetIdx;
		this.ctrIdx = iCtrIdx;
		this.used = 0;
	}
	compareIdx(iFacetIdx: number, iCtrIdx: number): boolean {
		let rCompare = false;
		if (iFacetIdx === this.facetIdx && iCtrIdx === this.ctrIdx) {
			rCompare = true;
		}
		return rCompare;
	}
	incrementUsed() {
		this.used += 1;
	}
	normOrientation(iOuterInner: boolean): ContourJ {
		const orientation1 = super.getEnvelop().orientation;
		if (orientation1 !== iOuterInner) {
			//console.log(`dbg155: orientation revert with ${iOuterInner} ${orientation1}`);
			return this.generateRevertOrientation();
		} else {
			return this;
		}
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
	juncIdx = 0;
	outerInner: tContourJ[] = [];
	constructor(iOuterInner: tContourJ[]) {
		for (const iCtr of iOuterInner) {
			this.outerInner.push(iCtr);
		}
	}
	place(tm2: Transform2d): Facet {
		const az2 = tm2.getRotation();
		const [xx2, yy2] = tm2.getTranslation();
		const ctrsJ: tContourJ[] = [];
		for (const iCtr of this.outerInner) {
			ctrsJ.push(iCtr.rotate(0, 0, az2).translate(xx2, yy2));
		}
		const rFacet = facet(ctrsJ);
		rFacet.attached = this.attached;
		rFacet.ax = this.ax;
		rFacet.ay = this.ay;
		rFacet.aa = this.aa;
		rFacet.juncIdx = this.juncIdx;
		return rFacet;
	}
	getContourPure(): tContour[] {
		const ctrsPure: tContour[] = [];
		for (const iCtr of this.outerInner) {
			if (!(iCtr instanceof ContourJ)) {
				ctrsPure.push(iCtr);
			}
		}
		return ctrsPure;
	}
	getContourJ(iFacetIdx: number): ContourJ[] {
		const ctrsJ: ContourJ[] = [];
		for (const [iCtrIdx, iCtr] of this.outerInner.entries()) {
			if (iCtr instanceof ContourJ) {
				const ctrN = iCtr.normOrientation(iCtrIdx === 0);
				ctrN.setIdx(iFacetIdx, iCtrIdx);
				ctrsJ.push(ctrN);
			}
		}
		return ctrsJ;
	}
	getContourAll(): tContour[] {
		const ctrsAll: tContour[] = [];
		for (const iCtr of this.outerInner) {
			ctrsAll.push(contourJ2contour(iCtr));
		}
		return ctrsAll;
	}
}

// instantiation functions

/**
 * Intanciate a ContourJ object
 * @internal
 *
 *  @param ix - x-coordiante of the starting point
 *  @param iy - y-coordiante of the starting point
 *  @param icolor - option color for displaying that contour
 *  @returns the ContourJ object
 */
function contourJ(ix: number, iy: number, icolor = ''): ContourJ {
	return new ContourJ(ix, iy, icolor);
}

/**
 * Intanciate a Facet object
 * @internal
 *
 *  @param iOuterInner - a list of CountourJ/Contour objects
 *  @returns the Facet object
 */
function facet(iOuterInner: tContourJ[]): Facet {
	return new Facet(iOuterInner);
}

// other helper functions
function contourJ2contour(iContoutJ: tContourJ): tContour {
	return iContoutJ.clone();
	//return iContoutJ;
}

export type { tJunction, tContourJ };
export { tJDir, tJSide, ContourJ, Facet, contourJ, facet, contourJ2contour };
