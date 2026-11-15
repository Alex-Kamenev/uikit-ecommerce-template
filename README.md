# UIkit E-commerce Template

Responsive e-commerce template containing catalog, filters, product pages, cart and checkout screens. Built with [UIkit](https://getuikit.com).

This is Aleksandar Kamenev's maintained fork of [Roman Chekurov's original template](https://github.com/chekromul/uikit-ecommerce-template). Original authorship, image credits and the MIT license are retained. The template is a static interface demo: it does not implement payments, authentication, inventory, order storage or a commerce backend.

Original upstream demo: https://chekromul.github.io/uikit-ecommerce-template (not a deployment of this fork).

Also you can see `Sass` port of this theme: [vkovic/uikit-computer-store-template](https://github.com/vkovic/uikit-computer-store-template) 

[![UIkit E-commerce Template](https://raw.githubusercontent.com/chekromul/uikit-ecommerce-template/gh-pages/images/preview.png "UIkit E-commerce Template")](https://raw.githubusercontent.com/chekromul/uikit-ecommerce-template/gh-pages/images/preview.png "UIkit E-commerce Template")

## Overview

### Technologies

The project uses:

- [UIkit](https://getuikit.com)
- [Pug](https://pugjs.org)
- [Less](https://lesscss.org)
- [Gulp](https://gulpjs.com)


### Browser support

Builds target modern browsers using the `browserslist` configuration in `package.json`. UIkit 3.25 and the current build tools replace the old release-candidate framework and legacy plugin chain. The fork retains its original Pug templates, theme Less sources and image assets; a visual browser comparison has not yet been performed.

## Quick start

### What's included

```
uikit-ecommerce-store/
├── src/
|   ├── scripts/
│   |   ├── script.js
|   ├── styles/
│   |   ├── components/
|   |   ├── style.less
|   ├── templates/
│   |   ├── components/
|   |   ├── data/
|   |   ├── layouts/
|   |   ├── mixins/
|   |   ├── pages/
|   |   |    ├── index.pug
|   |   ├── partials/
|   ├── images/

```

### Build

Use Node.js 22 or newer (Node.js 24 was used for verification), Git and npm. From your terminal:

```sh
git clone https://github.com/Alex-Kamenev/uikit-ecommerce-template.git
cd uikit-ecommerce-template
npm ci --ignore-scripts
npm test
npm start
```

`npm test` builds the template and checks all 21 pages, local references, all 68 images, compiled scripts, the default Maps configuration and quantity/map input handling. `npm start` builds and runs a local BrowserSync server with source watchers. To serve an existing build, use `npm run server`; `npm run build` only writes the static output to `dest/`.

Image files are copied unchanged, including on rebuild. The build clears only this checkout's `dest/` directory first, preventing stale output. The old image optimization/cache and GitHub Pages publishing plugins have been removed; no build or development command publishes files to GitHub. The generated output includes the original MIT `LICENSE`.

### Optional Google Maps

No Google Maps API key is shipped or requested by default. To enable map loading, supply your own browser API key when building, for example in PowerShell:

```powershell
$env:GOOGLE_MAPS_API_KEY = "your-browser-key"
npm run build
```

The key becomes visible in generated HTML, as required for the browser Maps API. Restrict it to your site's HTTP referrers and the Maps JavaScript API in your Google Cloud project. A `.env` file is not loaded automatically. Keep the key out of source control; the inherited upstream key was removed from the current source, but historical commits retain it.

## Copyright and Credits

[Shopping Categories Colection](https://thenounproject.com/jarosigrist/collection/shopping-categories) icons by Jaro Sigrist from Noun Project. Licensed under Creative Commons Attribution 3.0.

## License

This software is licensed under the MIT License © [Roman Chekurov](https://github.com/chekromul)
