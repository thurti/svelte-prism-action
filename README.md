[![NPM Version](https://img.shields.io/npm/v/svelte-prism-action?style=flat&color=green)](https://www.npmjs.com/package/svelte-prism-action)

# svelte-prism-action

[Svelte](https://svelte.dev) action for **lazy loading** [Prism.js](https://prismjs.com) code highlighting languages from remote or local path.

## Example

<big><a href="https://thurti.github.io/svelte-prism-action/public">Example Page</a></big>

The action uses IntersectionObserver to dynamically render code highlighting. The prism.js language file is lazy loaded when the `<code>` element gets visible in the viewport.

## Installation

`$ npm install svelte-prism-action`

Include a Prism.js CSS theme in your svelte component or use the `<head>` section of your `index.html`.

```html
<link
  href="https://unpkg.com/prismjs@1.22.0/themes/prism.css"
  rel="stylesheet"
/>
```

## Usage

Import `prism` from `svelte-prism-action`. Add the action to a component with `use:prism`. All `<code>` elements with a `class="language-..."` will get highlighted once they have entered the viewport.

For available language tags see https://prismjs.com/#supported-languages .

**HINT** If you are writing your codeblocks directly into a svelte component you need to **escape special characters** (eg. curley brackets). Another way is to wrap the code inside ` {``} `.

```html
<script>
  import { prism } from "svelte-prism-action";
</script>

<!-- add action to component -->
<main use:prism>
  <!-- or set some options
  <main use:prism={{
    componentsUrl: "https://myPathToPrism/components"
  }}>
-->

  <!-- use in code blocks -->
  <pre>
    <code class="lang-css">{` <!-- wrap inside {``} if using inside svelte component-->
      .bg-gold{
        background: gold;
      }
    `}
    </code>
  </pre>

  <!-- use inline -->
  <code class="lang-javascript"
    >{`import {prism} from "svelte-prism-action";`}</code
  >
</main>
```

## Options

You can use `componentsUrl` to set the URL from where to import the Prism.js language files. By default it uses [unpkg cdn](https://unpkg.com), but you can use a local resource instead.

To lazy load **third party language** files (eg. `prism-svelte`) or define a different file per language you can use `thirdPartyUrls` object with language `id` as key and the URL as the value.

You can also change the IntersectionObserver options. For more information on what they do see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces .

```html
<main use:prism={{
  root: null,
  rootMargin: "100px",
  threshold: 0,
  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components",
  thirdPartyUrls: {
    svelte: "https://cdn.jsdelivr.net/npm/prism-svelte@0.5.0/index.js"
  }
}}>
...
</main>
```

## Changelog

### 1.1.3 (2024-04-17)

- Add: Typescript support (generated types from JSDoc)
- make svelte a peer dependency and version less restrictive (because should work with svelte version >= 3)

### 1.1.2 (2023-03-16)

- Fix: highlight fails when `prism-markup.js` import not finished

### 1.1.1 (2023-03-15)

- Fix: SvelteKit error while loading prism-markup.js

### 1.1.0 (2023-03-15)

- Add: support for third party language files
- Updated dependencies

### 1.0.7 (2021-06-10)

- Fix #1: SvelteKit support. Fixed vite compile errors and added `/* @vite-ignore */` to dynamic `import()`.

### 1.0.6 (2021-03-19)

- Updated dependencies

### 1.0.5 (2020-12-09)

- Add: use custom build `components.js` to reduce package file size
- updated dev dependencies
- replaced custom language loader with prism.js builtin loader

### 1.0.4 (2020-12-08)

- Fix: error if language dependency has dependency on its own

### 1.0.3 (2020-12-08)

- Fix: error if markdown additional languages is null

### 1.0.2 (2020-12-08)

- Add: import languages from markdown code blocks
- Fix: loading languages with dependencies (eg. markdown) leads to error

### 1.0.1

- added .npmignore

### 1.0.0 (2020-12-04)

- initial release

## License

MIT
