var on=Array.isArray,_n=Array.prototype.indexOf,zn=Array.from,Wn=Object.defineProperty,K=Object.getOwnPropertyDescriptor,cn=Object.getOwnPropertyDescriptors,vn=Object.prototype,hn=Array.prototype,Ct=Object.getPrototypeOf,Rt=Object.isExtensible;const Xn=()=>{};function Jn(t){return t()}function Pt(t){for(var e=0;e<t.length;e++)t[e]()}const x=2,Ft=4,ot=8,gt=16,O=32,U=64,et=128,m=256,rt=512,y=1024,I=2048,q=4096,Y=8192,_t=16384,pn=32768,Mt=65536,Qn=1<<17,dn=1<<19,qt=1<<20,wt=1<<21,C=Symbol("$state"),te=Symbol("legacy props"),ne=Symbol("");function Lt(t){return t===this.v}function wn(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function jt(t){return!wn(t,this.v)}function En(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function yn(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function gn(t){throw new Error("https://svelte.dev/e/effect_orphan")}function Tn(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function ee(){throw new Error("https://svelte.dev/e/hydration_failed")}function re(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function mn(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function An(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function bn(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let ct=!1;function le(){ct=!0}const ae=1,se=2,fe=4,ie=8,ue=16,oe=1,_e=2,ce=4,ve=8,he=16,pe=1,de=2,xn="[",Rn="[!",Dn="]",Yt={},g=Symbol(),we="http://www.w3.org/1999/xhtml";let p=null;function Dt(t){p=t}function Ee(t,e=!1,n){var r=p={p,c:null,d:!1,e:null,m:!1,s:t,x:null,l:null};ct&&!e&&(p.l={s:null,u:null,r1:[],r2:mt(!1)}),Nn(()=>{r.d=!0})}function ye(t){const e=p;if(e!==null){const u=e.e;if(u!==null){var n=h,r=v;e.e=null;try{for(var l=0;l<u.length;l++){var a=u[l];ft(a.effect),B(a.reaction),zt(a.fn)}}finally{ft(n),B(r)}}p=e.p,e.m=!0}return{}}function vt(){return!ct||p!==null&&p.l===null}function j(t){if(typeof t!="object"||t===null||C in t)return t;const e=Ct(t);if(e!==vn&&e!==hn)return t;var n=new Map,r=on(t),l=k(0),a=v,u=i=>{var s=v;B(a);var f=i();return B(s),f};return r&&n.set("length",k(t.length)),new Proxy(t,{defineProperty(i,s,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&mn();var _=n.get(s);return _===void 0?(_=u(()=>k(f.value)),n.set(s,_)):S(_,u(()=>j(f.value))),!0},deleteProperty(i,s){var f=n.get(s);if(f===void 0)s in i&&n.set(s,u(()=>k(g)));else{if(r&&typeof s=="string"){var _=n.get("length"),o=Number(s);Number.isInteger(o)&&o<_.v&&S(_,o)}S(f,g),It(l)}return!0},get(i,s,f){var b;if(s===C)return t;var _=n.get(s),o=s in i;if(_===void 0&&(!o||(b=K(i,s))!=null&&b.writable)&&(_=u(()=>k(j(o?i[s]:g))),n.set(s,_)),_!==void 0){var c=G(_);return c===g?void 0:c}return Reflect.get(i,s,f)},getOwnPropertyDescriptor(i,s){var f=Reflect.getOwnPropertyDescriptor(i,s);if(f&&"value"in f){var _=n.get(s);_&&(f.value=G(_))}else if(f===void 0){var o=n.get(s),c=o==null?void 0:o.v;if(o!==void 0&&c!==g)return{enumerable:!0,configurable:!0,value:c,writable:!0}}return f},has(i,s){var c;if(s===C)return!0;var f=n.get(s),_=f!==void 0&&f.v!==g||Reflect.has(i,s);if(f!==void 0||h!==null&&(!_||(c=K(i,s))!=null&&c.writable)){f===void 0&&(f=u(()=>k(_?j(i[s]):g)),n.set(s,f));var o=G(f);if(o===g)return!1}return _},set(i,s,f,_){var xt;var o=n.get(s),c=s in i;if(r&&s==="length")for(var b=f;b<o.v;b+=1){var Q=n.get(b+"");Q!==void 0?S(Q,g):b in i&&(Q=u(()=>k(g)),n.set(b+"",Q))}o===void 0?(!c||(xt=K(i,s))!=null&&xt.writable)&&(o=u(()=>k(void 0)),S(o,u(()=>j(f))),n.set(s,o)):(c=o.v!==g,S(o,u(()=>j(f))));var tt=Reflect.getOwnPropertyDescriptor(i,s);if(tt!=null&&tt.set&&tt.set.call(_,f),!c){if(r&&typeof s=="string"){var bt=n.get("length"),dt=Number(s);Number.isInteger(dt)&&dt>=bt.v&&S(bt,dt+1)}It(l)}return!0},ownKeys(i){G(l);var s=Reflect.ownKeys(i).filter(o=>{var c=n.get(o);return c===void 0||c.v!==g});for(var[f,_]of n)_.v!==g&&!(f in i)&&s.push(f);return s},setPrototypeOf(){An()}})}function It(t,e=1){S(t,t.v+e)}function Ot(t){try{if(t!==null&&typeof t=="object"&&C in t)return t[C]}catch{}return t}function ge(t,e){return Object.is(Ot(t),Ot(e))}function Tt(t){var e=x|I,n=v!==null&&(v.f&x)!==0?v:null;return h===null||n!==null&&(n.f&m)!==0?e|=m:h.f|=qt,{ctx:p,deps:null,effects:null,equals:Lt,f:e,fn:t,reactions:null,rv:0,v:null,wv:0,parent:n??h}}function Te(t){const e=Tt(t);return rn(e),e}function me(t){const e=Tt(t);return e.equals=jt,e}function Ht(t){var e=t.effects;if(e!==null){t.effects=null;for(var n=0;n<e.length;n+=1)M(e[n])}}function In(t){for(var e=t.parent;e!==null;){if((e.f&x)===0)return e;e=e.parent}return null}function Bt(t){var e,n=h;ft(In(t));try{Ht(t),e=fn(t)}finally{ft(n)}return e}function Ut(t){var e=Bt(t),n=(N||(t.f&m)!==0)&&t.deps!==null?q:y;R(t,n),t.equals(e)||(t.v=e,t.wv=an())}const $=new Map;function mt(t,e){var n={f:0,v:t,reactions:null,equals:Lt,rv:0,wv:0};return n}function k(t,e){const n=mt(t);return rn(n),n}function Ae(t,e=!1){var r;const n=mt(t);return e||(n.equals=jt),ct&&p!==null&&p.l!==null&&((r=p.l).s??(r.s=[])).push(n),n}function S(t,e,n=!1){v!==null&&!D&&vt()&&(v.f&(x|gt))!==0&&!(E!=null&&E.includes(t))&&bn();let r=n?j(e):e;return On(t,r)}function On(t,e){if(!t.equals(e)){var n=t.v;X?$.set(t,e):$.set(t,n),t.v=e,(t.f&x)!==0&&((t.f&I)!==0&&Bt(t),R(t,(t.f&m)===0?y:q)),t.wv=an(),Vt(t,I),vt()&&h!==null&&(h.f&y)!==0&&(h.f&(O|U))===0&&(A===null?Yn([t]):A.push(t))}return e}function Vt(t,e){var n=t.reactions;if(n!==null)for(var r=vt(),l=n.length,a=0;a<l;a++){var u=n[a],i=u.f;(i&I)===0&&(!r&&u===h||(R(u,e),(i&(y|m))!==0&&((i&x)!==0?Vt(u,q):pt(u))))}}function Gt(t){console.warn("https://svelte.dev/e/hydration_mismatch")}let F=!1;function be(t){F=t}let d;function H(t){if(t===null)throw Gt(),Yt;return d=t}function xe(){return H(L(d))}function Re(t){if(F){if(L(d)!==null)throw Gt(),Yt;d=t}}function De(t=1){if(F){for(var e=t,n=d;e--;)n=L(n);d=n}}function Ie(){for(var t=0,e=d;;){if(e.nodeType===8){var n=e.data;if(n===Dn){if(t===0)return e;t-=1}else(n===xn||n===Rn)&&(t+=1)}var r=L(e);e.remove(),e=r}}var kt,kn,Kt,Zt;function Oe(){if(kt===void 0){kt=window,kn=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,n=Text.prototype;Kt=K(e,"firstChild").get,Zt=K(e,"nextSibling").get,Rt(t)&&(t.__click=void 0,t.__className=void 0,t.__attributes=null,t.__style=void 0,t.__e=void 0),Rt(n)&&(n.__t=void 0)}}function lt(t=""){return document.createTextNode(t)}function Et(t){return Kt.call(t)}function L(t){return Zt.call(t)}function ke(t,e){if(!F)return Et(t);var n=Et(d);if(n===null)n=d.appendChild(lt());else if(e&&n.nodeType!==3){var r=lt();return n==null||n.before(r),H(r),r}return H(n),n}function Se(t,e){if(!F){var n=Et(t);return n instanceof Comment&&n.data===""?L(n):n}if(e&&(d==null?void 0:d.nodeType)!==3){var r=lt();return d==null||d.before(r),H(r),r}return d}function Ne(t,e=1,n=!1){let r=F?d:t;for(var l;e--;)l=r,r=L(r);if(!F)return r;var a=r==null?void 0:r.nodeType;if(n&&a!==3){var u=lt();return r===null?l==null||l.after(u):r.before(u),H(u),u}return H(r),r}function Ce(t){t.textContent=""}function $t(t){h===null&&v===null&&gn(),v!==null&&(v.f&m)!==0&&h===null&&yn(),X&&En()}function Sn(t,e){var n=e.last;n===null?e.last=e.first=t:(n.next=t,t.prev=n,e.last=t)}function V(t,e,n,r=!0){var l=h,a={ctx:p,deps:null,nodes_start:null,nodes_end:null,f:t|I,first:null,fn:e,last:null,next:null,parent:l,prev:null,teardown:null,transitions:null,wv:0};if(n)try{At(a),a.f|=pn}catch(s){throw M(a),s}else e!==null&&pt(a);var u=n&&a.deps===null&&a.first===null&&a.nodes_start===null&&a.teardown===null&&(a.f&(qt|et))===0;if(!u&&r&&(l!==null&&Sn(a,l),v!==null&&(v.f&x)!==0)){var i=v;(i.effects??(i.effects=[])).push(a)}return a}function Nn(t){const e=V(ot,null,!1);return R(e,y),e.teardown=t,e}function Pe(t){$t();var e=h!==null&&(h.f&O)!==0&&p!==null&&!p.m;if(e){var n=p;(n.e??(n.e=[])).push({fn:t,effect:h,reaction:v})}else{var r=zt(t);return r}}function Fe(t){return $t(),Cn(t)}function Me(t){const e=V(U,t,!0);return(n={})=>new Promise(r=>{n.outro?Mn(e,()=>{M(e),r(void 0)}):(M(e),r(void 0))})}function zt(t){return V(Ft,t,!1)}function Cn(t){return V(ot,t,!0)}function qe(t,e=[],n=Tt){const r=e.map(n);return Pn(()=>t(...r.map(G)))}function Pn(t,e=0){return V(ot|gt|e,t,!0)}function Le(t,e=!0){return V(ot|O,t,!0,e)}function Wt(t){var e=t.teardown;if(e!==null){const n=X,r=v;Nt(!0),B(null);try{e.call(null)}finally{Nt(n),B(r)}}}function Xt(t,e=!1){var n=t.first;for(t.first=t.last=null;n!==null;){var r=n.next;(n.f&U)!==0?n.parent=null:M(n,e),n=r}}function Fn(t){for(var e=t.first;e!==null;){var n=e.next;(e.f&O)===0&&M(e),e=n}}function M(t,e=!0){var n=!1;if((e||(t.f&dn)!==0)&&t.nodes_start!==null){for(var r=t.nodes_start,l=t.nodes_end;r!==null;){var a=r===l?null:L(r);r.remove(),r=a}n=!0}Xt(t,e&&!n),ut(t,0),R(t,_t);var u=t.transitions;if(u!==null)for(const s of u)s.stop();Wt(t);var i=t.parent;i!==null&&i.first!==null&&Jt(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function Jt(t){var e=t.parent,n=t.prev,r=t.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),e!==null&&(e.first===t&&(e.first=r),e.last===t&&(e.last=n))}function Mn(t,e){var n=[];Qt(t,n,!0),qn(n,()=>{M(t),e&&e()})}function qn(t,e){var n=t.length;if(n>0){var r=()=>--n||e();for(var l of t)l.out(r)}else e()}function Qt(t,e,n){if((t.f&Y)===0){if(t.f^=Y,t.transitions!==null)for(const u of t.transitions)(u.is_global||n)&&e.push(u);for(var r=t.first;r!==null;){var l=r.next,a=(r.f&Mt)!==0||(r.f&O)!==0;Qt(r,e,a?n:!1),r=l}}}function je(t){tn(t,!0)}function tn(t,e){if((t.f&Y)!==0){t.f^=Y,(t.f&y)===0&&(t.f^=y),J(t)&&(R(t,I),pt(t));for(var n=t.first;n!==null;){var r=n.next,l=(n.f&Mt)!==0||(n.f&O)!==0;tn(n,l?e:!1),n=r}if(t.transitions!==null)for(const a of t.transitions)(a.is_global||e)&&a.in()}}const Ln=typeof requestIdleCallback>"u"?t=>setTimeout(t,1):requestIdleCallback;let z=[],W=[];function nn(){var t=z;z=[],Pt(t)}function en(){var t=W;W=[],Pt(t)}function Ye(t){z.length===0&&queueMicrotask(nn),z.push(t)}function He(t){W.length===0&&Ln(en),W.push(t)}function St(){z.length>0&&nn(),W.length>0&&en()}let nt=!1,at=!1,st=null,P=!1,X=!1;function Nt(t){X=t}let Z=[];let v=null,D=!1;function B(t){v=t}let h=null;function ft(t){h=t}let E=null;function jn(t){E=t}function rn(t){v!==null&&v.f&wt&&(E===null?jn([t]):E.push(t))}let w=null,T=0,A=null;function Yn(t){A=t}let ln=1,it=0,N=!1;function an(){return++ln}function J(t){var o;var e=t.f;if((e&I)!==0)return!0;if((e&q)!==0){var n=t.deps,r=(e&m)!==0;if(n!==null){var l,a,u=(e&rt)!==0,i=r&&h!==null&&!N,s=n.length;if(u||i){var f=t,_=f.parent;for(l=0;l<s;l++)a=n[l],(u||!((o=a==null?void 0:a.reactions)!=null&&o.includes(f)))&&(a.reactions??(a.reactions=[])).push(f);u&&(f.f^=rt),i&&_!==null&&(_.f&m)===0&&(f.f^=m)}for(l=0;l<s;l++)if(a=n[l],J(a)&&Ut(a),a.wv>t.wv)return!0}(!r||h!==null&&!N)&&R(t,y)}return!1}function Hn(t,e){for(var n=e;n!==null;){if((n.f&et)!==0)try{n.fn(t);return}catch{n.f^=et}n=n.parent}throw nt=!1,t}function Bn(t){return(t.f&_t)===0&&(t.parent===null||(t.parent.f&et)===0)}function ht(t,e,n,r){if(nt){if(n===null&&(nt=!1),Bn(e))throw t;return}n!==null&&(nt=!0);{Hn(t,e);return}}function sn(t,e,n=!0){var r=t.reactions;if(r!==null)for(var l=0;l<r.length;l++){var a=r[l];E!=null&&E.includes(t)||((a.f&x)!==0?sn(a,e,!1):e===a&&(n?R(a,I):(a.f&y)!==0&&R(a,q),pt(a)))}}function fn(t){var b;var e=w,n=T,r=A,l=v,a=N,u=E,i=p,s=D,f=t.f;w=null,T=0,A=null,N=(f&m)!==0&&(D||!P||v===null),v=(f&(O|U))===0?t:null,E=null,Dt(t.ctx),D=!1,it++,t.f|=wt;try{var _=(0,t.fn)(),o=t.deps;if(w!==null){var c;if(ut(t,T),o!==null&&T>0)for(o.length=T+w.length,c=0;c<w.length;c++)o[T+c]=w[c];else t.deps=o=w;if(!N)for(c=T;c<o.length;c++)((b=o[c]).reactions??(b.reactions=[])).push(t)}else o!==null&&T<o.length&&(ut(t,T),o.length=T);if(vt()&&A!==null&&!D&&o!==null&&(t.f&(x|q|I))===0)for(c=0;c<A.length;c++)sn(A[c],t);return l!==t&&(it++,A!==null&&(r===null?r=A:r.push(...A))),_}finally{w=e,T=n,A=r,v=l,N=a,E=u,Dt(i),D=s,t.f^=wt}}function Un(t,e){let n=e.reactions;if(n!==null){var r=_n.call(n,t);if(r!==-1){var l=n.length-1;l===0?n=e.reactions=null:(n[r]=n[l],n.pop())}}n===null&&(e.f&x)!==0&&(w===null||!w.includes(e))&&(R(e,q),(e.f&(m|rt))===0&&(e.f^=rt),Ht(e),ut(e,0))}function ut(t,e){var n=t.deps;if(n!==null)for(var r=e;r<n.length;r++)Un(t,n[r])}function At(t){var e=t.f;if((e&_t)===0){R(t,y);var n=h,r=p,l=P;h=t,P=!0;try{(e&gt)!==0?Fn(t):Xt(t),Wt(t);var a=fn(t);t.teardown=typeof a=="function"?a:null,t.wv=ln;var u=t.deps,i}catch(s){ht(s,t,n,r||t.ctx)}finally{P=l,h=n}}}function Vn(){try{Tn()}catch(t){if(st!==null)ht(t,st,null);else throw t}}function un(){var t=P;try{var e=0;for(P=!0;Z.length>0;){e++>1e3&&Vn();var n=Z,r=n.length;Z=[];for(var l=0;l<r;l++){var a=Kn(n[l]);Gn(a)}$.clear()}}finally{at=!1,P=t,st=null}}function Gn(t){var e=t.length;if(e!==0)for(var n=0;n<e;n++){var r=t[n];if((r.f&(_t|Y))===0)try{J(r)&&(At(r),r.deps===null&&r.first===null&&r.nodes_start===null&&(r.teardown===null?Jt(r):r.fn=null))}catch(l){ht(l,r,null,r.ctx)}}}function pt(t){at||(at=!0,queueMicrotask(un));for(var e=st=t;e.parent!==null;){e=e.parent;var n=e.f;if((n&(U|O))!==0){if((n&y)===0)return;e.f^=y}}Z.push(e)}function Kn(t){for(var e=[],n=t;n!==null;){var r=n.f,l=(r&(O|U))!==0,a=l&&(r&y)!==0;if(!a&&(r&Y)===0){if((r&Ft)!==0)e.push(n);else if(l)n.f^=y;else{var u=v;try{v=n,J(n)&&At(n)}catch(f){ht(f,n,null,n.ctx)}finally{v=u}}var i=n.first;if(i!==null){n=i;continue}}var s=n.parent;for(n=n.next;n===null&&s!==null;)n=s.next,s=s.parent}return e}function Zn(t){var e;for(St();Z.length>0;)at=!0,un(),St();return e}async function Be(){await Promise.resolve(),Zn()}function G(t){var e=t.f,n=(e&x)!==0;if(v!==null&&!D){if(!(E!=null&&E.includes(t))){var r=v.deps;t.rv<it&&(t.rv=it,w===null&&r!==null&&r[T]===t?T++:w===null?w=[t]:(!N||!w.includes(t))&&w.push(t))}}else if(n&&t.deps===null&&t.effects===null){var l=t,a=l.parent;a!==null&&(a.f&m)===0&&(l.f^=m)}return n&&(l=t,J(l)&&Ut(l)),X&&$.has(t)?$.get(t):t.v}function Ue(t){var e=D;try{return D=!0,t()}finally{D=e}}const $n=-7169;function R(t,e){t.f=t.f&$n|e}function Ve(t){if(!(typeof t!="object"||!t||t instanceof EventTarget)){if(C in t)yt(t);else if(!Array.isArray(t))for(let e in t){const n=t[e];typeof n=="object"&&n&&C in n&&yt(n)}}}function yt(t,e=new Set){if(typeof t=="object"&&t!==null&&!(t instanceof EventTarget)&&!e.has(t)){e.add(t),t instanceof Date&&t.getTime();for(let r in t)try{yt(t[r],e)}catch{}const n=Ct(t);if(n!==Object.prototype&&n!==Array.prototype&&n!==Map.prototype&&n!==Set.prototype&&n!==Date.prototype){const r=cn(n);for(let l in r){const a=r[l].get;if(a)try{a.call(t)}catch{}}}}}export{Wn as $,Ie as A,H as B,be as C,je as D,Mt as E,Mn as F,zt as G,xn as H,Cn as I,Ye as J,K,re as L,Qn as M,me as N,jt as O,ce as P,j as Q,S as R,C as S,Ae as T,g as U,ve as V,te as W,_e as X,oe as Y,he as Z,Zn as _,ye as a,k as a0,Be as a1,Te as a2,De as a3,Et as a4,Ce as a5,Nn as a6,B as a7,ft as a8,v as a9,Ct as aA,cn as aB,He as aC,vt as aD,ge as aE,kt as aF,wn as aG,h as aa,on as ab,kn as ac,lt as ad,pe as ae,de as af,Oe as ag,L as ah,Yt as ai,Dn as aj,Gt as ak,ee as al,zn as am,Me as an,fe as ao,Y as ap,ae as aq,On as ar,se as as,mt as at,ie as au,Qt as av,qn as aw,ue as ax,ne as ay,we as az,Pn as b,ke as c,Le as d,M as e,Se as f,d as g,F as h,le as i,G as j,p as k,ct as l,Ue as m,Xn as n,Fe as o,Ee as p,Pt as q,Re as r,Ne as s,qe as t,Pe as u,Jn as v,Ve as w,Tt as x,xe as y,Rn as z};
