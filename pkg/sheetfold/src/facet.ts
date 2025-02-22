// facet.ts

import type { tContour, Transform2d } from 'geometrix';
import { Contour } from 'geometrix';

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
	return iContoutJ;
}

export type { tContourJ };
export { tJDir, tJSide, ContourJ, Facet, contourJ, facet, contourJ2contour };
