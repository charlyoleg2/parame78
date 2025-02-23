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
	facetIdx = -1;
	ctrIdx = -1;
	used = 0;
	startJunction(jName: string, aNb: tJDir, abSide: tJSide): this {
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
		for (const jPosition of this.junctionPosition) {
			rctrJ.junctionPosition.push(jPosition);
		}
		for (const jID of this.junctionID) {
			rctrJ.junctionID.push(jID);
		}
		for (const jDir of this.junctionDir) {
			rctrJ.junctionDir.push(jDir);
		}
		for (const jSide of this.junctionSide) {
			rctrJ.junctionSide.push(jSide);
		}
		rctrJ.lastPosition = this.lastPosition;
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
				if (iCtr.getEnvelop().orientation !== true) {
					throw `err890: orientation of ContourJ ${iFacetIdx} ${iCtrIdx} is not CCW`;
				}
				iCtr.setIdx(iFacetIdx, iCtrIdx);
				ctrsJ.push(iCtr);
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
function contourJ(ix: number, iy: number, icolor = ''): ContourJ {
	return new ContourJ(ix, iy, icolor);
}
function facet(iOuterInner: tContourJ[]): Facet {
	return new Facet(iOuterInner);
}

// other helper functions
function contourJ2contour(iContoutJ: tContourJ): tContour {
	return iContoutJ.clone();
	//return iContoutJ;
}

export type { tContourJ };
export { tJDir, tJSide, ContourJ, Facet, contourJ, facet, contourJ2contour };
