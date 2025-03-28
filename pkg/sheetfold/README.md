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
import { facet } from 'sheetfold';

const fa1 = facet(50, 100);
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

### contourJ

Replace the *Contour* class of *geometrix* for creating a contour with junctions.


### facet

Replace the *Figure* class of *geometrix* for creating a figure with junctions.


### sheetFold

Generate a *sheefold* design by combining facets.


