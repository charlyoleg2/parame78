Parame78
========


Presentation
------------

*Parame78* is the top-monorepo for the design-library *desi78*, which contains a collection of 3D shapes designed by *charlyoleg*.

This monorepo contains the following *javascript* package:

1. desi78: a *parametrix* design library
2. desi78-cli: the cli of desi78
3. desi78-ui: the web-ui of desi78
4. desi78-uis: the web-server of desi78-ui

This repo is a typical designer-repository using [parametrix](https://charlyoleg2.github.io/parametrix/).
The design-library and its associated UI and CLI are published as *npm-packages*.
The UI is also available on the github-page.


Links
-----

- [desi78-ui](https://charlyoleg2.github.io/parame78/) : public instance of the UI
- [sources](https://github.com/charlyoleg2/parame78) : git-repository
- [pkg](https://www.npmjs.com/package/desi78) : desi78 as npm-package
- [pkg-cli](https://www.npmjs.com/package/desi78-cli) : desi78-cli as npm-package
- [pkg-uis](https://www.npmjs.com/package/desi78-uis) : desi78-uis as npm-package


Usage for Makers
----------------

Parametrize and generate your 3D-files with the online-app:

[https://charlyoleg2.github.io/parame78/](https://charlyoleg2.github.io/parame78/)

Or use the UI locally:

```bash
npx desi78-uis
```

Or use the command-line-interface (CLI):

```bash
npx desi78-cli
```

Getting started for Dev
-----------------------

```bash
git clone https://github.com/charlyoleg2/parame78
cd parame78
npm i
npm run ci
npm run preview
```

Other useful commands:
```bash
npm run clean
npm run ls-workspaces
npm -w desi78 run check
npm -w desi78 run build
npm -w desi78-ui run dev
```

Prerequisite
------------

- [node](https://nodejs.org) version 20.10.0 or higher
- [npm](https://docs.npmjs.com/cli/v7/commands/npm) version 10.5.0 or higher


Publish a new release
---------------------

```bash
npm run versions
git commit -am 'increment sub versions'
npm version patch
git push
git push origin v0.5.6
```

