Triangule
=========


Presentation
------------

*Triangule* is a *typescript library* for computing angles and lengths of triangles.

It solves analytically common triangle problems in Euclidian geometry. It's based only on lengths and angles. On purpose, it doesn't use Cartesian coordinates.

It uses essentially the [law of cosines](https://en.wikipedia.org/wiki/Law_of_cosines) and the [law of sines](https://en.wikipedia.org/wiki/Law_of_sines).

*Triangule* relies on the standard library *Math* and doesn't have any extra dependency.


Links
-----

- [pkg](https://www.npmjs.com/package/triangule) : triangule as npm-package
- [sources](https://github.com/charlyoleg2/parame78/tree/main/pkg/triangule) : git-repository
- [API](https://charlyoleg2.github.io/parame78/apidoc/) : public instance of the UI
- [in use](https://charlyoleg2.github.io/parame78/desi78/demoTriangule) : public instance of the UI


Installation
------------

```bash
npm install triangule
```


Usage
-----

```js
import { triAArA } from 'triangule';

const [a3, logstr] = triAArA(1.0, 2.0); // expect 0.14159
```


Development
-----------

```bash
git clone https://github.com/charlyoleg2/parame78
cd parame78
npm -w triangule install
npm -w triangule run ci
```

Main functions of Triangule
---------------------------

### triAArA

![triangule\_triAArA.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_triAArA.svg)

Compute the third angle fron the two first angles. The sign of the two first angles must be identical. The sign of the third angle is the same as the sign of the two first angles. The sum of the 3 angles of a triangle is Pi.

### triALArLL

![triangule\_triALArLL.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_triALArLL.svg)

From two angles and one length, compute the two remaining lengths. The two input angles must be adjacent to the input length. After getting the third angle, it uses the *law of sines* for computing the two remaining traingle-side-lengths.

### triLALrL

![triangule\_triLALrL.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_triLALrL.svg)

From two lengths and one angle, compute the remaining length. The input angle must be the angle between the two lengths. It's the direct application of the *law of cosines*.

### triALLrL

![triangule\_triALLrL.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_triALLrL.svg)

From one angle and two lengths, compute the two possible length of the third triangle-side. The input angle must be opposite to one of the length. It is the intersection between a line and a circle, which can have two solutions. The *law of cosines* provides an equation of the second degree, which can have two solutions.

### triALLrLAA

![triangule\_triALLrLAA.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_triALLrLAA.svg)

Same inputs as *triALLrL*. The output is completed with two angles for each possible length.

### triLLLrA

![triangule\_triLLLrA.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_triLLLrA.svg)

From the three lengths of a triangle, compute one of the angle. It's a direct application of the *law of cosines*.

### triLLLrAAA

![triangule\_triLLLrAAA.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_triLLLrAAA.svg)

Same inputs as *triLLLrA*. The output is extended to the three angles of the triangle.


Common pitfalls around triangles
--------------------------------

### Oriented angles in a triangle

![triangule\_angle\_sign.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_angle_sign.svg)

Either all angles of a triangle are positive or they are all negative.


### Possible ways to measure an angle

- If we measure the angle between two *half-lines*, the angle is modulo 2\*Pi.
- If we measure the angle between two *lines*, the angle is modulo Pi.

![triangule\_strokeAngle.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_strokeAngle.svg)

Let's note A, the angle between two lines. Those angles are equivalent:
- A
- A+Pi
- A-Pi

The following angles are not equivalent to A:
- -A
- Pi-A
- -Pi-A

![triangule\_anglePotentialError.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_anglePotentialError.svg)
