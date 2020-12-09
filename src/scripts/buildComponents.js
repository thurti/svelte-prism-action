const fs = require('fs')
const components = require('prismjs/components');

const cleaned_components = {
  languages: {}
};

//pick only alias and require from components
for (const lang in components.languages) {
  const element = components.languages[lang];
  if (lang !== 'meta') {
    cleaned_components.languages[lang] = {
      alias: element.alias,
      require: element.require
    }
  }
}

//write to js file
const out = `export const components = ${JSON.stringify(cleaned_components)};`;
fs.writeFileSync('./src/actions/components.js', out);