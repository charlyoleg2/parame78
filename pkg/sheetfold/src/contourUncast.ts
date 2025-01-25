// contourUncast.ts : remove the type constrain of methods of Contour

import { Contour } from 'geometrix';

/**
 * class `ContourUncast`
 *
 */
class ContourUncast extends Contour {
	addPointA(ax: number, ay: number): this {
		super.addPointA(ax, ay);
		return this;
	}
	addPointAP(aa: number, al: number): this {
		super.addPointAP(aa, al);
		return this;
	}
	addPointR(rx: number, ry: number): this {
		super.addPointR(rx, ry);
		return this;
	}
	addPointRP(ra: number, rl: number): this {
		super.addPointRP(ra, rl);
		return this;
	}
	addSegStrokeA(ax: number, ay: number): this {
		super.addSegStrokeA(ax, ay);
		return this;
	}
	addSegStrokeAP(aa: number, al: number): this {
		super.addSegStrokeAP(aa, al);
		return this;
	}
	addSegStrokeR(rx: number, ry: number): this {
		super.addSegStrokeR(rx, ry);
		return this;
	}
	addSegStrokeRP(ra: number, rl: number): this {
		super.addSegStrokeRP(ra, rl);
		return this;
	}
	addSegArc(iRadius: number, iLarge: boolean, iCcw: boolean): this {
		super.addSegArc(iRadius, iLarge, iCcw);
		return this;
	}
	addSegArc2(): this {
		super.addSegArc2();
		return this;
	}
	addSegArc3(iTangentAngle1: number, firstNlast: boolean): this {
		super.addSegArc3(iTangentAngle1, firstNlast);
		return this;
	}
	addSeg2Arcs(ita1: number, ita2: number): this {
		super.addSeg2Arcs(ita1, ita2);
		return this;
	}
	addCornerPointed(): this {
		super.addCornerPointed();
		return this;
	}
	addCornerRounded(iRadius: number): this {
		super.addCornerRounded(iRadius);
		return this;
	}
	addCornerWidened(iRadius: number): this {
		super.addCornerWidened(iRadius);
		return this;
	}
	addCornerWideAcc(iRadius: number): this {
		super.addCornerWideAcc(iRadius);
		return this;
	}
	closeSegStroke(): this {
		super.closeSegStroke();
		return this;
	}
	closeSegArc(iRadius: number, iLarge: boolean, iCcw: boolean): this {
		super.closeSegArc(iRadius, iLarge, iCcw);
		return this;
	}
	translate(ix: number, iy: number): this {
		super.translate(ix, iy);
		return this;
	}
	translatePolar(ia: number, il: number): this {
		super.translatePolar(ia, il);
		return this;
	}
	rotate(ix: number, iy: number, ia: number): this {
		super.rotate(ix, iy, ia);
		return this;
	}
	scale(ix: number, iy: number, ir: number, scaleCorner = false): this {
		super.scale(ix, iy, ir, scaleCorner);
		return this;
	}
	addPartial(iContour: ContourUncast): this {
		super.addPartial(iContour);
		return this;
	}
}

export { ContourUncast };
