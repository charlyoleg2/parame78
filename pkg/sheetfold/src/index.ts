// index.ts : entry point of the library sheetfold

import type { Figure, tFigures, tVolume, tContour, tExtrude, tBVolume } from 'geometrix';
import {
	contour,
	ctrRectangle,
	ctrRectRot,
	Contour,
	figure,
	ffix,
	SegEnum,
	isActiveCorner,
	withinPiPi,
	point,
	transform3d,
	Transform3d,
	EExtrude,
	EBVolume
} from 'geometrix';
import { transform2d } from './transform2d';

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
	jx: number;
	jy: number;
}

type tHalfProfile = (string | number)[];
interface tOneProfile {
	x1: number;
	y1: number;
	a1: number;
	l1: number;
	ante: tHalfProfile;
	post: tHalfProfile;
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
	juncIdx = 0;
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
	pThickness = 0;
	pPartName = '';
	pSFMark = '';
	pFacets: Facet[] = [];
	pJuncs: tJunc2[] = [];
	pProfiles: tOneProfile[] = [];
	constructor(
		iFacets: Facet[],
		iJuncs: tJuncs,
		iProfiles: tOneProfile[],
		iThickness: number,
		iPartName: string,
		iSFMark: string
	) {
		this.pThickness = iThickness;
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
									diffY: 0,
									jx: 0,
									jy: 0
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
		// section-profiles
		for (const oneProfile of iProfiles) {
			if (oneProfile.l1 <= 0) {
				throw `err292: profile l1 ${oneProfile.l1} is negative or null`;
			}
			for (const [idx, halfP] of oneProfile.ante.entries()) {
				if (0 === idx % 2) {
					if ('string' !== typeof halfP) {
						throw `err234: even element of ante is not a string`;
					}
					if (!jNames2.includes(halfP)) {
						throw `err242: even element string ${halfP} of ante is not a declared junctions`;
					}
				} else {
					if ('number' !== typeof halfP) {
						throw `err239: odd element of ante is not a number`;
					}
					if (halfP <= 0) {
						throw `err242: odd element number ${halfP} of ante is negative or null`;
					}
				}
			}
			for (const [idx, halfP] of oneProfile.post.entries()) {
				if (0 === idx % 2) {
					if ('string' !== typeof halfP) {
						throw `err234: even element of post is not a string`;
					}
					if (!jNames2.includes(halfP)) {
						throw `err242: even element string ${halfP} of post is not a declared junctions`;
					}
				} else {
					if ('number' !== typeof halfP) {
						throw `err239: odd element of post is not a number`;
					}
					if (halfP <= 0) {
						throw `err242: odd element number ${halfP} of post is negative or null`;
					}
				}
			}
			this.pProfiles.push(oneProfile);
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
		for (const [iJuncIdx, iJunc] of this.pJuncs.entries()) {
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
						throw `err908: junction ${iJuncIdx} jLength ${ffix(iJunc.jLength)} ${ffix(jLength)} differs of ${absDiffL}`;
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
						this.pFacets[faIdx].juncIdx = iJuncIdx;
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
	/** @internal */
	getJuncIdx(jName: string): number {
		let rIdx = -1;
		for (const [idx, iJunc] of this.pJuncs.entries()) {
			if (jName === iJunc.jName) {
				rIdx = idx;
			}
		}
		if (rIdx < 0) {
			throw `err801: jName ${jName} not found`;
		}
		return rIdx;
	}
	/** @internal */
	fromJunctionToAttach(iJunc: tJunc2): [number, number, number] {
		let ra = iJunc.a1Teta;
		let rx = iJunc.a1x;
		let ry = iJunc.a1y;
		const faIdx = iJunc.a1FacetIdx;
		if (faIdx > 0) {
			const facette = this.pFacets[faIdx];
			ra = ra - facette.aa;
			const tx2 = rx - facette.ax;
			const ty2 = ry - facette.ay;
			const tl2 = Math.sqrt(tx2 ** 2 + ty2 ** 2);
			const ta2 = Math.atan2(ty2, tx2);
			const ta3 = ta2 - facette.aa;
			rx = tl2 * Math.cos(ta3);
			ry = tl2 * Math.sin(ta3);
		}
		//console.log(`dbg720: jIdx ${jIdx}  ra ${ra}  rx ${rx}  ry ${ry}`);
		return [ra, rx, ry];
	}
	positionF(iTm: Transform3d, iFacetIdx: number): Transform3d {
		let rTm = iTm;
		if (iFacetIdx > 0) {
			const jIdx = this.pFacets[iFacetIdx].juncIdx;
			const junc = this.pJuncs[jIdx];
			if (tJSide.eABLeft === junc.a1Side) {
				rTm = rTm.addRotation(-junc.angle, 0, 0).addTranslation(0, -junc.jx, junc.jy);
			} else {
				rTm = rTm.addRotation(junc.angle, 0, 0).addTranslation(0, junc.jx, junc.jy);
			}
			rTm = this.positionJ(rTm, jIdx);
		}
		return rTm;
	}
	positionJ(iTm: Transform3d, jIdx: number): Transform3d {
		const junc = this.pJuncs[jIdx];
		const [ta, tx, ty] = this.fromJunctionToAttach(junc);
		let rTm = iTm.addRotation(0, 0, ta).addTranslation(tx, ty, 0);
		const faIdx = junc.a1FacetIdx;
		if (faIdx > 0) {
			rTm = this.positionF(rTm, faIdx);
		}
		return rTm;
	}
	// external API
	makePatternFigure(): Figure {
		const rfig = figure();
		// second-layer
		for (const [iFacetIdx, iFacet] of this.pFacets.entries()) {
			if (iFacetIdx > 0) {
				const tm2 = transform2d();
				let facIdx = iFacetIdx;
				if (iFacet.attached) {
					while (facIdx > 0) {
						const jIdx = this.pFacets[facIdx].juncIdx;
						const junc = this.pJuncs[jIdx];
						const [ta, tx, ty] = this.fromJunctionToAttach(junc);
						tm2.addRotation(ta);
						tm2.addTranslation(tx, ty);
						const tJangle = Math.abs(junc.angle);
						const tJlength = tJangle === 0 ? junc.radius : tJangle * junc.radius;
						const tSign = tJSide.eABLeft === junc.a1Side ? -1 : 1;
						const tJaz = junc.a1Teta + (tSign * Math.PI) / 2;
						tm2.addTranslation(tJlength * Math.cos(tJaz), tJlength * Math.sin(tJaz));
						facIdx = junc.a1FacetIdx;
					}
				} else {
					throw `err491: iFacetIdx ${iFacetIdx} is not attached!`;
				}
				const az = tm2.getRotation();
				const [xx, yy] = tm2.getTranslation();
				for (const iCtr of iFacet.outerInner) {
					const ctr1 = contourJ2contour(iCtr)
						.rotate(iFacet.ax, iFacet.ay, -iFacet.aa)
						.translate(-iFacet.ax, -iFacet.ay)
						.rotate(0, 0, az)
						.translate(xx, yy);
					rfig.addSecond(ctr1);
				}
			} else {
				if (iFacet.attached) {
					throw `err490: iFacetIdx ${iFacetIdx} is attached!`;
				}
				for (const iCtr of iFacet.outerInner) {
					rfig.addSecond(iCtr);
				}
			}
		}
		// main-layer
		//rfig.addMainOI(outerInner);
		return rfig;
	}
	/** @internal */
	nameFacePattern(): string {
		const rStr = `${this.pSFMark}_pattern`;
		return rStr;
	}
	/** @internal */
	nameFace(idx: number): string {
		const rStr = `${this.pSFMark}_f${idx.toString().padStart(2, '0')}`;
		return rStr;
	}
	/** @internal */
	nameFaceJ(idx: number): string {
		const rStr = `${this.pSFMark}_fj${idx.toString().padStart(2, '0')}`;
		return rStr;
	}
	/** @internal */
	nameFaceProfiles(): string {
		const rStr = `${this.pSFMark}_profiles`;
		return rStr;
	}
	/** @internal */
	makeFacetFig(iFacetIdx: number, iFacet: Facet): Figure {
		const rFig = figure();
		const outerInner: tContour[] = [];
		for (const iCtr of iFacet.outerInner) {
			let ctr1 = contourJ2contour(iCtr);
			if (iFacetIdx > 0) {
				ctr1 = ctr1.translate(-iFacet.ax, -iFacet.ay).rotate(0, 0, Math.PI / 2 - iFacet.aa);
			}
			outerInner.push(ctr1);
		}
		rFig.addMainOI(outerInner);
		return rFig;
	}
	/** @internal */
	drawJuncPositive(rE: number, rI: number, angle: number): [tContour, number, number] {
		const pC = point(0, rE);
		const pE2 = pC.translatePolar(-Math.PI / 2 + angle / 2, rE);
		const pE1 = pC.translatePolar(-Math.PI / 2 + angle, rE);
		const pI1 = pC.translatePolar(-Math.PI / 2 + angle, rI);
		const pI2 = pC.translatePolar(-Math.PI / 2 + angle / 2, rI);
		const rCtrBendP = contour(0, 0)
			.addPointA(pE2.cx, pE2.cy)
			.addPointA(pE1.cx, pE1.cy)
			.addSegArc2()
			.addSegStrokeA(pI1.cx, pI1.cy)
			.addPointA(pI2.cx, pI2.cy)
			.addPointA(0, this.pThickness)
			.addSegArc2()
			.closeSegStroke();
		return [rCtrBendP, pE1.cx, pE1.cy];
	}
	/** @internal */
	drawJuncNegative(rE: number, rI: number, angle: number): [tContour, number, number] {
		const pC = point(0, -rI);
		const pE2 = pC.translatePolar(Math.PI / 2 + angle / 2, rE);
		const pE1 = pC.translatePolar(Math.PI / 2 + angle, rE);
		const pI1 = pC.translatePolar(Math.PI / 2 + angle, rI);
		const pI2 = pC.translatePolar(Math.PI / 2 + angle / 2, rI);
		const rCtrBendN = contour(0, 0)
			.addPointA(pI2.cx, pI2.cy)
			.addPointA(pI1.cx, pI1.cy)
			.addSegArc2()
			.addSegStrokeA(pE1.cx, pE1.cy)
			.addPointA(pE2.cx, pE2.cy)
			.addPointA(0, this.pThickness)
			.addSegArc2()
			.closeSegStroke();
		return [rCtrBendN, pI1.cx, pI1.cy];
	}
	/** @internal */
	makeJuncCtr(
		jName: string,
		jAngle: number,
		jRadius: number,
		jNeutral: number
	): [tContour, number, number] {
		let rCtr = ctrRectangle(0, 0, jRadius, this.pThickness);
		if (jNeutral < 0 || jNeutral > 1) {
			throw `err329: junction ${jName} with neutral ${jNeutral} not within 0..1`;
		}
		if (jRadius < 0) {
			throw `err328: junction ${jName} with negative radius ${jRadius}`;
		}
		const rI = jRadius - this.pThickness * jNeutral;
		const rE = jRadius + this.pThickness * (1 - jNeutral);
		if (rI <= 0) {
			throw `err901: junction ${jName} with negative rI ${rI}, radius ${jRadius}, neutral ${jNeutral}, thickness ${this.pThickness}`;
		}
		let rjx = 0;
		let rjy = 0;
		if (0 === jAngle) {
			//rCtr = ctrRectangle(0, 0, jRadius, this.pThickness);
			rjx = jRadius;
			rjy = 0;
		} else if (jAngle > 0) {
			const [ctrBendP, tjx, tjy] = this.drawJuncPositive(rE, rI, jAngle);
			rCtr = ctrBendP;
			rjx = tjx;
			rjy = tjy;
		} else {
			const [ctrBendN, tjx, tjy] = this.drawJuncNegative(rE, rI, jAngle);
			rCtr = ctrBendN;
			rjx = tjx;
			rjy = tjy;
		}
		return [rCtr, rjx, rjy];
	}
	/** @internal */
	makeProfileFig(): Figure {
		const rfig = figure();
		for (const oneP of this.pProfiles) {
			let tx = oneP.x1;
			let ty = oneP.y1;
			let ta = oneP.a1;
			rfig.addMainO(ctrRectRot(tx, ty, oneP.l1, this.pThickness, ta));
			const p1 = point(tx, ty).translatePolar(ta, oneP.l1);
			tx = p1.cx;
			ty = p1.cy;
			for (const half of oneP.post) {
				if ('number' === typeof half) {
					rfig.addMainO(ctrRectRot(tx, ty, half, this.pThickness, ta));
					const p2 = point(tx, ty).translatePolar(ta, half);
					tx = p2.cx;
					ty = p2.cy;
				} else {
					const tJunc = this.pJuncs[this.getJuncIdx(half)];
					const [ctr, tjx, tjy] = this.makeJuncCtr(
						tJunc.jName,
						tJunc.angle,
						tJunc.radius,
						tJunc.neutral
					);
					rfig.addMainO(ctr.rotate(0, 0, ta).translate(tx, ty));
					const p3 = point(tjx, tjy).rotate(point(0, 0), ta);
					tx += p3.cx;
					ty += p3.cy;
					ta += tJunc.angle;
				}
			}
			// reset for ante
			tx = oneP.x1;
			ty = oneP.y1;
			ta = oneP.a1 + Math.PI;
			const p4 = point(tx, ty).translatePolar(ta - Math.PI / 2, this.pThickness);
			tx = p4.cx;
			ty = p4.cy;
			for (const half of oneP.ante) {
				if ('number' === typeof half) {
					rfig.addMainO(ctrRectRot(tx, ty, half, this.pThickness, ta));
					const p5 = point(tx, ty).translatePolar(ta, half);
					tx = p5.cx;
					ty = p5.cy;
				} else {
					const tJunc = this.pJuncs[this.getJuncIdx(half)];
					const [ctr, tjx, tjy] = this.makeJuncCtr(
						tJunc.jName,
						-tJunc.angle,
						tJunc.radius,
						tJunc.neutral
					);
					rfig.addMainO(ctr.rotate(0, 0, ta).translate(tx, ty));
					const p6 = point(tjx, tjy).rotate(point(0, 0), ta);
					tx += p6.cx;
					ty += p6.cy;
					ta -= tJunc.angle;
				}
			}
		}
		return rfig;
	}
	makeFigures(): tFigures {
		const rfigs: tFigures = {};
		// check
		if (this.pThickness <= 0) {
			throw `err822: thickness ${this.pThickness} is negative`;
		}
		// pattern
		rfigs[this.nameFacePattern()] = this.makePatternFigure();
		// profiles
		if (this.pProfiles.length > 0) {
			const faceName = this.nameFaceProfiles();
			rfigs[faceName] = this.makeProfileFig();
		}
		// facets
		for (const [iFacetIdx, iFacet] of this.pFacets.entries()) {
			const faceName = this.nameFace(iFacetIdx);
			rfigs[faceName] = this.makeFacetFig(iFacetIdx, iFacet);
		}
		// junctions
		for (const [iJuncIdx, iJunc] of this.pJuncs.entries()) {
			const faceName = this.nameFaceJ(iJuncIdx);
			const [ctr, tjx, tjy] = this.makeJuncCtr(
				iJunc.jName,
				iJunc.angle,
				iJunc.radius,
				iJunc.neutral
			);
			const fig = figure();
			fig.addMainO(ctr);
			rfigs[faceName] = fig;
			iJunc.jx = tjx;
			iJunc.jy = tjy;
		}
		// return
		return rfigs;
	}
	makeVolume(): tVolume {
		const extrudeList: tExtrude[] = [];
		for (const iFacetIdx of this.pFacets.keys()) {
			const tm0 = transform3d();
			let tm2 = tm0;
			if (iFacetIdx > 0) {
				const tm1 = tm0.addRotation(0, 0, -Math.PI / 2);
				tm2 = this.positionF(tm1, iFacetIdx);
			}
			const subM: tExtrude = {
				outName: `subpax_${this.nameFace(iFacetIdx)}`,
				face: `${this.pPartName}_${this.nameFace(iFacetIdx)}`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: this.pThickness,
				rotate: tm2.getRotation(),
				translate: tm2.getTranslation()
			};
			extrudeList.push(subM);
		}
		for (const [iJuncIdx, iJunc] of this.pJuncs.entries()) {
			let tm1 = transform3d();
			if (tJSide.eABLeft === iJunc.a1Side) {
				tm1 = tm1
					.addRotation(Math.PI / 2, 0, 0)
					.addTranslation(0, iJunc.jLength, 0)
					.addRotation(0, 0, -Math.PI / 2);
			} else {
				tm1 = tm1.addRotation(Math.PI / 2, 0, 0).addRotation(0, 0, Math.PI / 2);
			}
			const tm2 = this.positionJ(tm1, iJuncIdx);
			const subM: tExtrude = {
				outName: `subpax_${this.nameFaceJ(iJuncIdx)}`,
				face: `${this.pPartName}_${this.nameFaceJ(iJuncIdx)}`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: iJunc.jLength,
				rotate: tm2.getRotation(),
				translate: tm2.getTranslation()
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
	iProfiles: tOneProfile[],
	iThickness: number,
	iPartName: string,
	iSFMark = 'SFG'
): SheetFold {
	return new SheetFold(iFacets, iJuncs, iProfiles, iThickness, iPartName, iSFMark);
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
