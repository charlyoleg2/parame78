// sheetfold.ts

import type {
	Segment1,
	Figure,
	tFigures,
	tVolume,
	tContour,
	tExtrude,
	tBVolume,
	Transform2d,
	Transform3d
} from 'geometrix';
import {
	contour,
	ctrRectangle,
	ctrRectRot,
	Contour,
	figure,
	envelop,
	ffix,
	SegEnum,
	isActiveCorner,
	withinPiPi,
	point,
	transform2d,
	transform3d,
	EExtrude,
	EBVolume
} from 'geometrix';
import type { Facet } from './facet';
import { tJDir, tJSide, ContourJ, contourJ2contour } from './facet';

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
	jx: number;
	jy: number;
}

interface tJunc3 {
	jName: string;
	segPosition: number;
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
					for (const iJunc of iCtr.pJuncs) {
						const iJuncName = iJunc.jName;
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
								this.pJuncs[jIdx].a2SegIdx = iJunc.jPosition;
								this.pJuncs[jIdx].a2Dir = iJunc.jDir;
								this.pJuncs[jIdx].a2Side = iJunc.jSide;
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
									a1SegIdx: iJunc.jPosition,
									a1Dir: iJunc.jDir,
									a1Side: iJunc.jSide,
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
	oneTetaLength(
		faIdx: number,
		coIdx: number,
		segIdx: number
	): [number, number, number, number, string] {
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
		const rLog = `Ax ${ffix(segA.px)} Ay ${ffix(segA.py)} Bx ${ffix(segB.px)} By ${ffix(segB.py)}`;
		return [segA.px, segA.py, rTeta, rLength, rLog];
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
				const [Ax, Ay, aAB, lAB, ABLog] = this.oneTetaLength(faIdx, coIdx, segIdx);
				let jTeta = aAB;
				let xx = Ax;
				let yy = Ay;
				if (tJDir.eB === jDir) {
					const pA = point(Ax, Ay).translatePolar(aAB, lAB);
					xx = pA.cx;
					yy = pA.cy;
					jTeta = withinPiPi(aAB + Math.PI);
				}
				if (1 === idx) {
					const absDiffL = Math.abs(lAB - iJunc.jLength);
					if (absDiffL > cPrecision) {
						const ABLog2 = `jName ${iJunc.jName} ${ABLog}`;
						throw `err908: junction ${iJuncIdx} jLength ${ffix(iJunc.jLength)} ${ffix(lAB)} differs of ${absDiffL}\n${ABLog2}`;
					}
					if (iJunc.a1Side === iJunc.a2Side) {
						throw `err905: jSide ${iJunc.a1Side} ${iJunc.a2Side} must be opposite`;
					}
					iJunc.a2x = xx;
					iJunc.a2y = yy;
					iJunc.a2Teta = jTeta;
					if (this.pFacets[faIdx].attached === false) {
						this.pFacets[faIdx].attached = true;
						this.pFacets[faIdx].ax = xx;
						this.pFacets[faIdx].ay = yy;
						this.pFacets[faIdx].aa = jTeta;
						this.pFacets[faIdx].juncIdx = iJuncIdx;
					} else {
						throw `err545: pFacet ${faIdx} is already attached`;
					}
				} else {
					iJunc.jLength = lAB;
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
	positionJ2d(iFacetIdx: number): Transform2d {
		const rTm1 = transform2d();
		let facIdx = iFacetIdx;
		if (this.pFacets[iFacetIdx].attached) {
			while (facIdx > 0) {
				const jIdx = this.pFacets[facIdx].juncIdx;
				const junc = this.pJuncs[jIdx];
				const tJangle = Math.abs(junc.angle);
				const tJWidth = tJangle === 0 ? junc.radius : tJangle * junc.radius;
				const tSign = tJSide.eABLeft === junc.a1Side ? -1 : 1;
				rTm1.addTranslation(0, tSign * tJWidth);
				const [ta, tx, ty] = this.fromJunctionToAttach(junc);
				rTm1.addRotation(ta);
				rTm1.addTranslation(tx, ty);
				facIdx = junc.a1FacetIdx;
			}
		} else {
			throw `err491: iFacetIdx ${iFacetIdx} is not attached!`;
		}
		return rTm1;
	}
	positionF2d(iFacetIdx: number): Transform2d {
		const tm1 = this.positionJ2d(iFacetIdx);
		const az1 = tm1.getRotation();
		const [xx1, yy1] = tm1.getTranslation();
		const iFacet = this.pFacets[iFacetIdx];
		const rTm2d = transform2d()
			.addTranslation(-iFacet.ax, -iFacet.ay)
			.addRotation(-iFacet.aa + az1)
			.addTranslation(xx1, yy1);
		return rTm2d;
	}
	findCtrJ(iCtrsJ: ContourJ[], iFacetIdx: number, iCtrIdx: number): ContourJ {
		let rCtrJ = iCtrsJ[0];
		let found = false;
		for (const ctrJ of iCtrsJ) {
			if (ctrJ.compareIdx(iFacetIdx, iCtrIdx)) {
				rCtrJ = ctrJ;
				found = true;
			}
		}
		if (!found) {
			throw `err612: not found ctrJ with iFacetIdx ${iFacetIdx} and iCtrIdx ${iCtrIdx}`;
		}
		return rCtrJ;
	}
	generateJunc3List(iCtrJ: ContourJ): tJunc3[] {
		const rJ3List: tJunc3[] = [];
		for (const iJunc of iCtrJ.pJuncs) {
			const j3: tJunc3 = {
				jName: iJunc.jName,
				segPosition: iJunc.jPosition
			};
			rJ3List.push(j3);
		}
		return rJ3List;
	}
	calcJuncList(iCtrJ: ContourJ, jName: string): tJunc3[] {
		const startIdx = iCtrJ.findIdx(jName);
		if (startIdx < 0) {
			throw `err324: junction ${jName} not found`;
		}
		const origList = this.generateJunc3List(iCtrJ);
		const rJuncList = [...origList.slice(startIdx), ...origList.slice(0, startIdx)];
		return rJuncList;
	}
	incrSegIdx(idx: number, delta: number, maxIdx: number): number {
		let rIdx = idx + delta;
		if (rIdx >= maxIdx) {
			rIdx = 0;
		} else if (rIdx < 0) {
			rIdx = maxIdx + rIdx;
		}
		return rIdx;
	}
	addSeg(iCtr: Contour, iSeg: Segment1) {
		if (iSeg.sType !== SegEnum.eStart) {
			iCtr.addSeg(iSeg);
			iCtr.setLastPoint(iSeg.px, iSeg.py); // required for addSegStrokeRP()
		}
	}
	makePartialCtr(
		iCtrJ: ContourJ,
		iJuncList: tJunc3[],
		first: boolean,
		iCtrsJ: ContourJ[]
	): Contour {
		let startIdx = iJuncList[0].segPosition;
		let endIdx = this.incrSegIdx(startIdx, 0, iCtrJ.segments.length);
		if (!first) {
			startIdx = this.incrSegIdx(iJuncList[0].segPosition, 1, iCtrJ.segments.length);
			endIdx = this.incrSegIdx(startIdx, 0, iCtrJ.segments.length);
		}
		//console.log(`dbg391: partial1 ${iCtrJ.facetIdx} ${iCtrJ.ctrIdx}`);
		//console.log(`dbg392: partial2 used ${iCtrJ.used} with startIdx ${startIdx}`);
		//console.log(`dbg393: partial3 segNb ${iCtrJ.segments.length}`);
		//console.log(`dbg394: partial4 juncNb ${iJuncList.length} ctrsNb ${iCtrsJ.length}`);
		const rCtr = contour(iCtrJ.segments[startIdx].px, iCtrJ.segments[startIdx].py);
		let segIdx = this.incrSegIdx(startIdx, 0, iCtrJ.segments.length);
		for (let i1 = 1; i1 < iJuncList.length; i1++) {
			//console.log(`dbg212: i1 ${i1} segIdx ${segIdx}`);
			iCtrJ.incrementUsed();
			while (segIdx !== iJuncList[i1].segPosition) {
				segIdx = this.incrSegIdx(segIdx, 1, iCtrJ.segments.length);
				this.addSeg(rCtr, iCtrJ.segments[segIdx].clone());
			}
			const junc = this.pJuncs[this.getJuncIdx(iJuncList[i1].jName)];
			if (junc.a2FacetIdx === -1) {
				// junction with no facet-2
				const Ax = iCtrJ.segments[segIdx].px;
				const Ay = iCtrJ.segments[segIdx].py;
				segIdx = this.incrSegIdx(segIdx, 1, iCtrJ.segments.length);
				const Bx = iCtrJ.segments[segIdx].px;
				const By = iCtrJ.segments[segIdx].py;
				const vABx = Bx - Ax;
				const vABy = By - Ay;
				const lAB = Math.sqrt(vABx ** 2 + vABy ** 2);
				const aAB = Math.atan2(vABy, vABx);
				const jLen = junc.angle === 0 ? junc.radius : Math.abs(junc.angle) * junc.radius;
				//console.log(`dbg312: jLen ${ffix(jLen)} aAB ${ffix(aAB)} lAB ${ffix(lAB)}`);
				const a90 = junc.a1Side === tJSide.eABLeft ? -Math.PI / 2 : Math.PI / 2;
				//console.log(`dbg313: jLen ${ffix(jLen)} aAB ${ffix(aAB)} a90 ${ffix(a90)}`);
				rCtr.addSegStrokeRP(aAB + a90, jLen);
				rCtr.addSegStrokeRP(aAB, lAB);
				rCtr.addSegStrokeA(Bx, By);
			} else {
				const ctrJ2 = this.findCtrJ(iCtrsJ, junc.a2FacetIdx, junc.a2ContIdx);
				const juncList2 = this.calcJuncList(ctrJ2, junc.jName);
				const partialCtr = this.makePartialCtr(ctrJ2, juncList2, false, iCtrsJ);
				rCtr.addSegStrokeA(partialCtr.segments[0].px, partialCtr.segments[0].py);
				for (const seg of partialCtr.segments) {
					this.addSeg(rCtr, seg.clone());
					//console.log(`dbg310: seg.px.py ${ffix(seg.px)} ${ffix(seg.py)}`);
				}
				segIdx = this.incrSegIdx(segIdx, 1, iCtrJ.segments.length);
				rCtr.addSegStrokeA(iCtrJ.segments[segIdx].px, iCtrJ.segments[segIdx].py);
			}
		}
		iCtrJ.incrementUsed();
		segIdx = this.incrSegIdx(segIdx, 1, iCtrJ.segments.length);
		while (segIdx !== endIdx) {
			this.addSeg(rCtr, iCtrJ.segments[segIdx].clone());
			segIdx = this.incrSegIdx(segIdx, 1, iCtrJ.segments.length);
		}
		return rCtr;
	}
	generateNewContours(iCtrsJ: ContourJ[]): tContour[] {
		const rCtrsNew: tContour[] = [];
		for (const iCtrJ of iCtrsJ) {
			if (iCtrJ.used === 0) {
				const j0: tJunc3 = { jName: '', segPosition: 0 };
				const juncList1 = [j0, ...this.generateJunc3List(iCtrJ)];
				const ctrN = this.makePartialCtr(iCtrJ, juncList1, true, iCtrsJ);
				//console.log(`dbg325: ${iCtrsJ.length} ctrN segNb ${ctrN.segments.length}`);
				//for (const [idx, seg] of ctrN.segments.entries()) {
				//	console.log(`dbg701: ${idx} : ${seg.sType} ${ffix(seg.px)} ${ffix(seg.py)}`);
				//}
				rCtrsNew.push(ctrN);
			}
		}
		return rCtrsNew;
	}
	generateOneMarker(iJunc: tJunc2): tContour {
		const jLen = iJunc.angle === 0 ? iJunc.radius : Math.abs(iJunc.angle) * iJunc.radius;
		if (jLen < 2 * iJunc.mark) {
			const ctrM = ctrRectangle(-iJunc.mark, 0, 2 * iJunc.mark, jLen);
			return ctrM;
		} else {
			const ctrM = contour(-iJunc.mark, iJunc.mark)
				.addPointA(0, 0)
				.addPointA(iJunc.mark, iJunc.mark)
				.addSegArc2()
				.addSegStrokeA(iJunc.mark, jLen - iJunc.mark)
				.addPointA(0, jLen)
				.addPointA(-iJunc.mark, jLen - iJunc.mark)
				.addSegArc2()
				.closeSegStroke();
			return ctrM;
		}
	}
	generateMarkers(): tContour[] {
		const rMarkers: tContour[] = [];
		for (const iJunc of this.pJuncs) {
			if (iJunc.associated === 0) {
				throw `err509: junction ${iJunc.jName} is not associated`;
			}
			if (iJunc.mark > 0) {
				const facetIdx = iJunc.a1FacetIdx;
				const tJangle = Math.abs(iJunc.angle);
				const tJWidth = tJangle === 0 ? iJunc.radius : tJangle * iJunc.radius;
				const tSign = tJSide.eABLeft === iJunc.a1Side ? -1 : 0;
				const tm1 = transform2d().addTranslation(iJunc.jLength / 2, tSign * tJWidth);
				if (facetIdx > 0) {
					const [ta, tx, ty] = this.fromJunctionToAttach(iJunc);
					tm1.addRotation(ta).addTranslation(tx, ty);
					const tm2 = this.positionJ2d(facetIdx);
					tm1.addRotation(tm2.getRotation()).addTranslation(...tm2.getTranslation());
				} else {
					tm1.addRotation(iJunc.a1Teta).addTranslation(iJunc.a1x, iJunc.a1y);
				}
				const ctrM = this.generateOneMarker(iJunc)
					.rotate(0, 0, tm1.getRotation())
					.translate(...tm1.getTranslation());
				rMarkers.push(ctrM);
			}
		}
		return rMarkers;
	}
	// external API
	makePatternFigure(iCheck: boolean): Figure {
		const facetPlaced: Facet[] = [];
		// place facets
		for (const [iFacetIdx, iFacet] of this.pFacets.entries()) {
			if (iFacetIdx > 0) {
				const tm2 = this.positionF2d(iFacetIdx);
				facetPlaced.push(iFacet.place(tm2));
			} else {
				if (iFacet.attached) {
					throw `err490: iFacetIdx ${iFacetIdx} is attached!`;
				}
				const tm0 = transform2d();
				facetPlaced.push(iFacet.place(tm0));
			}
		}
		// list of contours
		const ctrsAll: tContour[] = [];
		const ctrsPure: tContour[] = [];
		const ctrsJ: ContourJ[] = [];
		for (const [iFacetIdx, iFacet] of facetPlaced.entries()) {
			ctrsAll.push(...iFacet.getContourAll());
			ctrsPure.push(...iFacet.getContourPure());
			ctrsJ.push(...iFacet.getContourJ(iFacetIdx));
		}
		// second layer
		const rfig = figure();
		for (const iCtr of ctrsAll) {
			rfig.addSecond(iCtr);
		}
		// make new contours
		const ctrsNew = this.generateNewContours(ctrsJ);
		const ctrsMaker = this.generateMarkers();
		// find ctrOuter
		const ctrsAll2: tContour[] = [...ctrsNew, ...ctrsPure, ...ctrsMaker];
		const ctrsRest2: tContour[] = [];
		let ctrOuter = ctrsAll2[0];
		const envTracker = envelop(ctrOuter.getEnvelop());
		for (const iCtr of ctrsAll2) {
			if (envTracker.add(iCtr.getEnvelop())) {
				ctrsRest2.push(ctrOuter);
				ctrOuter = iCtr;
			} else {
				ctrsRest2.push(iCtr);
			}
		}
		if (iCheck) {
			if (!envTracker.check(ctrOuter.getEnvelop())) {
				throw `err782: the outer-contour does not envelop all contours`;
			}
		}
		// main layer
		rfig.addMainOI([ctrOuter, ...ctrsRest2]);
		//rfig.addMainOI([ctrOuter]);
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
	makeFigures(iCheck = true): tFigures {
		const rfigs: tFigures = {};
		// check
		if (this.pThickness <= 0) {
			throw `err822: thickness ${this.pThickness} is negative`;
		}
		// pattern
		rfigs[this.nameFacePattern()] = this.makePatternFigure(iCheck);
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
				outName: `subpax_${this.pPartName}_${this.nameFace(iFacetIdx)}`,
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
				outName: `subpax_${this.pPartName}_${this.nameFaceJ(iJuncIdx)}`,
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

export type { tJuncs, tHalfProfile, SheetFold };
export { sheetFold, facet2figure };
