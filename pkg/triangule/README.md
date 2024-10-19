Triangule
=========


Presentation
------------

*Triangule* is a *typescript library* for computing angles and lengths of triangles.

It solves analytically common triangle problems in Euclidian geometry. It's based only on lengths and angles. On purpose, it doesn't use Cartesian coordinates.

It uses particularly the [law of cosines](https://en.wikipedia.org/wiki/Law_of_cosines) and the [law of sines](https://en.wikipedia.org/wiki/Law_of_sines).

*Triangule* doesn't have any dependency.


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

```bash
import { triAArA } from 'triangule';

const a3 = triAArA(1.0, 2.0); // expect 0.14159
```


Development
-----------

```bash
git clone https://github.com/charlyoleg2/parame78
cd parame78
npm -w triangule install
npm -w triangule run ci
```


Implementation details
----------------------

![triangule\_angle\_sign.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/triangule/svg/triangule_angle_sign.svg)

Either all angles of a triangle are positive or they are all negative.
