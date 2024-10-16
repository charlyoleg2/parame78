Triangule
=========


Presentation
------------

*Triangule* is a *typescript library* for computing angles and length of triangles.

It solves analytically common triangle problems of Euclidian geometry.

It uses particularly the [law of cosines](https://en.wikipedia.org/wiki/Law_of_cosines) and the [law of sines](https://en.wikipedia.org/wiki/Law_of_sines).

*Triangule* doesn't have any dependency.


Links
-----

- [pkg](https://www.npmjs.com/package/triangule) : triangule as npm-package
- [sources](https://github.com/charlyoleg2/parame78/tree/main/pkg/triangule) : git-repository
- [API](https://charlyoleg2.github.io/parame78/) : public instance of the UI


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
