const debug = require('debug')('metalsmith-markdown');
const { extname, dirname, basename } = require('path');
const marked = require('marked');

const renderer = new marked.Renderer();

function slug(text) {
  text = (text != null ? text.trim() : void 0) || '';
  const replaced = text.replace(/\W+/g, '-').replace(/[-]+/g, '-');
  return replaced.toLowerCase();
}

// add an embedded anchor tag like on GitHub
renderer.heading = function(text, level) {
  const slugged = slug(text);
  return `<h${level} class='heading'>${text}<a title='${text}' id='${slugged}' class='anchor' href='#${slugged}' aria-hidden='true'></a></h${level}>`;
};

const DEFAULTS = {
  renderer: renderer,
  smartypants: true
};

function markdown(file) {
  return /\.md|\.markdown/.test(extname(file));
}

module.exports = function(options) {
  options = options || {};
  const opts = Object.assign({}, DEFAULTS, options);
  const keys = opts.keys || [];

  return function(files, metalsmith, done) {
    var data, dir, file, htmlPath, str;

    for (file in files) {
      data = files[file];

      if (markdown(file)) {
        dir = dirname(file);
        htmlPath = `${basename(file, extname(file))}.html`;

        if (dir !== '.') {
          htmlPath = `${dir}/${htmlPath}`;
        }

        if (data.contents) {
          data.markdown = data.contents;
          str = marked(data.markdown.toString(), opts);
          data.html = data.contents = Buffer.from(str);
        }

        keys.forEach(function(key) {
          return (data[key] = marked(data[key], opts));
        });

        delete files[file];
        files[htmlPath] = data;
      }
    }

    debug('Successfully converted files!');
    return done();
  };
};
