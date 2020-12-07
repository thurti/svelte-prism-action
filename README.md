# svelte-prism-action

[Svelte](https://svelte.dev) action for lazy loading [Prism.js](https://prismjs.com) code highlighting. 

The action uses IntersectionObserver to dynamically render code highlighting. The prism.js language file gets lazy loaded when the `<code>` element gets visible in the viewport.

## Installation

`$ npm install svelte-prism-action`

Include a Prism.js theme into the `<head>` section of your `index.html`.
```html
<link href="https://unpkg.com/prismjs@1.22.0/themes/prism.css" rel="stylesheet" />
```

## Usage

Import `prism` from `svelte-prism-action`. Add the action to a component with  `use:prism`. All `<code>` elements with a `class="language-..."` will get highlighted once they have entered the viewport. 

For available language tags see https://prismjs.com/#supported-languages .

**HINT** If you are writing your codeblocks directly into a svelte component you need to escape some special characters (eg. curley brackets). Another way is to wrap the code inside `{``}`. 

```html
<script>
  import {prism} from "svelte-prism-action";
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
  <code class="lang-javascript">{`import {prism} from "svelte-prism-action";`}</code>

</main>
```

## Options
You can use `componentsUrl` to set the URL from where to import the Prism.js language files. By default it uses [unpkg cdn](https://unpkg.com), but you can use a local resource instead.

You can also change the IntersectionObserver options. For more information on what they do see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces .

```html
<main use:prism={{
  root: null,
  rootMargin: "100px",
  threshold: 0,
  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components"
}}> 
...
</main>
```

## Changelog
### 0.1.0 (2020-12-04)
- initial release

## License
MIT