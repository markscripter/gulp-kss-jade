var fs = require('fs');
var kss = require('kss');
var kssJadeGenerator = require('kss-jade-generator');
var path = require('path');
var assign = require('object-assign');
var through = require('through');
var PluginError = require('gulp-util').PluginError;

var PLUGIN_NAME = 'gulp-kss-jade';

module.exports = function(opt) {

  var firstFile = null;
  var buffer = [];
  var cache = {partial: {}};
  var templatePath;
  var template;
  var homepage;
  var destination = null;
  var source = null;
  var defaults = {
    templatePath: null,
    template: null,
    mask: {},
    markdown: true,
    multiline: true,
    typos: false,
    custom: [],
    helpers: '',
    css: [],
    js: [],
  };

  opt = assign(defaults, opt);
  opt.templatePath ?
    templatePath = path.resolve(process.cwd() + '/' + opt.templatePath) :
    new PluginError(PLUGIN_NAME,  'No templatePath provided. Please provide a templatePath.');

  opt.template ?
    template = fs.readFileSync(templatePath + '/' + opt.template, 'utf8') :
    new PluginError(PLUGIN_NAME,  'No template provided. Please provide a template.');

  opt.destination ?
    destination = path.resolve(process.cwd() + '/' + opt.destination) :
    new PluginError(PLUGIN_NAME,  'No destination provided. Please provide a destination.');

  opt.homepage ?
    homepage = opt.homepage :
    new PluginError(PLUGIN_NAME,  'No homepage provided. Please provide a homepage.');

  opt.source && Array.isArray(opt.source) ?
    source = opt.source.map((src) => path.resolve(process.cwd() + '/' + src)) :
    new PluginError(PLUGIN_NAME,  'No source provided. Please provide a source.');

  /* Is called for each file and writes all files to buffer */
  function bufferContents(file, enc, cb) {
    if (file.isNull()) return; // ignore
    if (file.isStream()) return new PluginError(PLUGIN_NAME,  'Streaming not supported');

    if (!firstFile) firstFile = file;
    buffer.push(file.contents.toString('utf8'));
  }

  function processKss(file, enc, cb) {
    var _this = this;

    kss.parse(buffer, opt, function(err, styleguide) {
      err ? new PluginError(PLUGIN_NAME,  'Streaming not supported') : 0;

      kssJadeGenerator.init({
        source: source,
        destination: destination,
        template: template,
        templatePath: templatePath,
        homepage: homepage,
        helpers: [],
        css: [],
        js: [],
      });

      kssJadeGenerator.generate(styleguide);
    });
  }

  return through(bufferContents, processKss);
};
