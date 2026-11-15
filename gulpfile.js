const gulp = require('gulp');
const fs = require('node:fs/promises');
const path = require('node:path');
const less = require('less');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('csso');
const pug = require('pug');
const { minify } = require('terser');
const sync = require('browser-sync').create();

const ROOT = __dirname;
const SOURCE = path.join(ROOT, 'src');
const OUTPUT = path.join(ROOT, 'dest');

async function writeOutput(name, contents) {
  const target = path.join(OUTPUT, name);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, contents);
}

function reload() {
  if (sync.active) sync.reload();
}

async function html() {
  const directory = path.join(SOURCE, 'templates/pages');
  for (const name of await fs.readdir(directory)) {
    if (!name.endsWith('.pug')) continue;
    const rendered = pug.renderFile(path.join(directory, name), {
      basedir: path.join(SOURCE, 'templates'),
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    });
    await writeOutput(name.replace(/\.pug$/, '.html'), rendered);
  }
  reload();
}

async function styles() {
  const filename = path.join(SOURCE, 'styles/style.less');
  const rendered = await less.render(await fs.readFile(filename, 'utf8'), {
    filename,
    relativeUrls: true,
    math: 'always'
  });
  const prefixed = await postcss([autoprefixer()]).process(rendered.css, { from: filename });
  await writeOutput('styles/style.css', csso.minify(prefixed.css).css);
  reload();
}

async function scripts() {
  const directory = path.join(SOURCE, 'scripts');
  for (const name of await fs.readdir(directory)) {
    if (!name.endsWith('.js')) continue;
    let source = await fs.readFile(path.join(directory, name), 'utf8');
    // The upstream entry files each contain one local UIkit include directive.
    const include = source.match(/^\/\/=require\s+(.+)\s*$/m);
    if (include) {
      const imported = path.resolve(directory, include[1].trim());
      if (!imported.startsWith(path.join(ROOT, 'node_modules') + path.sep)) {
        throw new Error('Script include must refer to an installed dependency');
      }
      const importedSource = await fs.readFile(imported, 'utf8');
      source = source.replace(include[0], () => importedSource);
    }
    const result = await minify(source, { format: { comments: /^!/ } });
    await writeOutput(path.join('scripts', name), result.code);
  }
  reload();
}

async function images() {
  await fs.cp(path.join(SOURCE, 'images'), path.join(OUTPUT, 'images'), { recursive: true });
  reload();
}

async function copy() {
  for (const entry of await fs.readdir(SOURCE, { withFileTypes: true })) {
    if (entry.isFile()) await writeOutput(entry.name, await fs.readFile(path.join(SOURCE, entry.name)));
  }
  const fonts = path.join(SOURCE, 'fonts');
  try {
    await fs.cp(fonts, path.join(OUTPUT, 'fonts'), { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeOutput('LICENSE', await fs.readFile(path.join(ROOT, 'LICENSE')));
  reload();
}

async function clean() {
  // Keep recursive removal bounded to this checkout's fixed build directory.
  if (path.dirname(OUTPUT) !== ROOT || path.basename(OUTPUT) !== 'dest') {
    throw new Error('Unexpected output directory');
  }
  await fs.rm(OUTPUT, { recursive: true, force: true });
}

function server(done) {
  sync.init({
    notify: false,
    open: false,
    ui: false,
    online: false,
    listen: '127.0.0.1',
    server: { baseDir: OUTPUT }
  }, done);
}

function watch(done) {
  gulp.watch('src/templates/**/*.pug', html);
  gulp.watch('src/styles/**/*.less', styles);
  gulp.watch('src/scripts/*.js', scripts);
  gulp.watch('src/images/**/*', images);
  gulp.watch(['src/*', 'src/fonts/**/*'], copy);
  done();
}

const build = gulp.series(clean, gulp.parallel(html, styles, scripts, images, copy));
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.copy = copy;
exports.clean = clean;
exports.server = server;
exports.watch = watch;
exports.build = build;
exports.default = gulp.series(build, gulp.parallel(watch, server));
