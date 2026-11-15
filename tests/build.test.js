const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dest');

test('all template pages render and their local assets and links exist', () => {
  const pages = fs.readdirSync(path.join(root, 'src/templates/pages')).filter(name => name.endsWith('.pug'));
  assert.ok(pages.length > 0);
  assert.equal(fs.readdirSync(output).filter(name => name.endsWith('.html')).length, pages.length);
  for (const page of pages) {
    const filename = page.replace(/\.pug$/, '.html');
    const html = fs.readFileSync(path.join(output, filename), 'utf8');
    assert.match(html, /<!DOCTYPE html>/i);
    for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/g)) {
      const reference = match[1].split(/[?#]/)[0];
      if (!reference || /^(?:[a-z]+:|\/\/)/i.test(reference)) continue;
      const target = path.resolve(output, reference.replace(/^\//, ''));
      assert.ok(target.startsWith(output + path.sep), 'Local reference leaves output: ' + reference);
      assert.ok(fs.existsSync(target), filename + ' references missing ' + reference);
    }
  }
});

test('image assets copy byte-for-byte and scripts are compiled', () => {
  const sourceImages = path.join(root, 'src/images');
  const files = fs.readdirSync(sourceImages, { recursive: true }).filter(name => fs.statSync(path.join(sourceImages, name)).isFile());
  assert.ok(files.length > 0);
  for (const file of files) {
    assert.deepEqual(fs.readFileSync(path.join(output, 'images', file)), fs.readFileSync(path.join(sourceImages, file)), file);
  }
  assert.ok(fs.statSync(path.join(output, 'styles/style.css')).size > 10000);
  for (const script of ['script.js', 'uikit.js', 'uikit-icons.js']) {
    const source = fs.readFileSync(path.join(output, 'scripts', script), 'utf8');
    assert.doesNotMatch(source, /\/\/=require/);
    assert.doesNotThrow(() => new vm.Script(source));
  }
  assert.deepEqual(fs.readFileSync(path.join(output, 'LICENSE')), fs.readFileSync(path.join(root, 'LICENSE')));
});

test('no inherited maps key or network loader is emitted without configuration', {
  skip: Boolean(process.env.GOOGLE_MAPS_API_KEY)
}, () => {
  for (const name of fs.readdirSync(output).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(output, name), 'utf8');
    assert.doesNotMatch(html, /maps\.googleapis\.com\/maps\/api\/js/);
    assert.doesNotMatch(html, /AIza[0-9A-Za-z_-]{20,}/);
  }
});

test('quantity stays positive and map setup skips invalid coordinates', () => {
  const input = { value: '2' };
  const mapElements = [{ dataset: { latitude: 'invalid', longitude: '10', zoom: '5' } }];
  let mapsCreated = 0;
  const context = vm.createContext({
    document: {
      querySelectorAll(selector) { return selector === '.js-map' ? mapElements : []; },
      getElementById(id) { return id === 'quantity' ? input : null; }
    },
    UIkit: { scroll() {}, util: { on() {} } },
    google: { maps: { Map: function () { mapsCreated++; }, Marker: function () {}, Animation: { DROP: 1 } } }
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'src/scripts/script.js'), 'utf8'), context);
  context.increment(-10, 'quantity');
  assert.equal(input.value, 1);
  context.increment(2, 'quantity');
  assert.equal(input.value, 3);
  assert.doesNotThrow(() => context.increment(1, 'missing'));
  context.initMap();
  assert.equal(mapsCreated, 0);
  mapElements[0].dataset.latitude = '0';
  context.initMap();
  assert.equal(mapsCreated, 1);
});
