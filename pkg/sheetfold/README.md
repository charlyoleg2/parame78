SheetFold
=========


Presentation
------------

*SheetFold* is a *typescript library* for designing 3D model conceived for being manufactured from a metal sheet.

*SheetFold* relies on the library [geometrix](https://www.npmjs.com/package/geometrix).


Links
-----

- [pkg](https://www.npmjs.com/package/sheetfold) : sheetfold as npm-package
- [sources](https://github.com/charlyoleg2/parame78/tree/main/pkg/sheetfold) : git-repository
- [API](https://charlyoleg2.github.io/parame78/apidoc/) : public instance of the UI
- [in use](https://charlyoleg2.github.io/parame78/desi78/demoSheetFold) : public instance of the UI


Installation
------------

```bash
npm install sheetfold
```


Usage
-----

```js
import { triAArA } from 'sheetfold';

const [a3, logstr] = triAArA(1.0, 2.0); // expect 0.14159
```


Development
-----------

```bash
git clone https://github.com/charlyoleg2/parame78
cd parame78
npm -w sheetfold install
npm -w sheetfold run ci
```

Main functions of SheetFold
---------------------------

### triAArA

![sheetfold\_triAArA.svg](https://raw.githubusercontent.com/charlyoleg2/parame78/refs/heads/main/pkg/sheetfold/svg/sheetfold_triAArA.svg)

Compute the third angle fron the two first angles. The sign of the two first angles must be identical. The sign of the third angle is the same as the sign of the two first angles. The sum of the 3 angles of a triangle is Pi.


Common pitfalls around SheetFold
--------------------------------

