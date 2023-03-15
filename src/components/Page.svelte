<script>
  import {prism} from './../actions/svelte-prism-action';
</script>

<main use:prism={{componentsUrls: {svelte: "https://cdn.jsdelivr.net/npm/prism-svelte@0.5.0/index.js"}}}>

  <h1>svelte-prism-action</h1>
  <p><a href="https://svelte.dev">Svelte</a> action for lazy loading <a href="https://prismjs.com">Prism.js</a> code highlighting.</p>

  <p><a href="https://github.com/thurti/svelte-prism-action">Code on GitHub</a></p>

  <h2>Install</h2>

  <code id="test_inline" class="lang-bash">$ npm install svelte-prism-action</code>

  <p>
    Include a Prism.js CSS theme in your svelte component or use the <code lang="html">&lt;head&gt;</code> section of your <code class="lang-html">index.html</code>.
  </p>
  <pre><code id="test_block" class="lang-html">{`<link href="https://unpkg.com/prismjs@1.22.0/themes/prism.css" rel="stylesheet" />`}</code></pre>

  <h2>Usage</h2>

  <p>Import prism from svelte-prism-action. Add the action to a component with <code class="lang-html">use:prism</code>. All <code class="lang-html">&lt;code&gt;</code> elements with a <code class="lang-html">class="language-..."</code> will get highlighted once they have entered the viewport.</p>

  <p>For available language tags see <a href="https://prismjs.com/#supported-languages">https://prismjs.com/#supported-languages</a> .</p>

  <p><b>HINT</b> If you are writing your codeblocks directly into a svelte component you need to <b>escape special characters</b> (eg. curley brackets). Another way is to wrap the code inside <code>{`\{\`\`\}`}</code>.</p>

  <pre><code id="test_svelte" class="lang-svelte">{`
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

  <p>
    Use in code blocks.
  </p>

  <pre>
    <code class="lang-css"> <!-- wrap inside \{\`\`\} if using inside svelte component-->
      \{\`.bg-gold{
        background: gold;
      }\`\}
    </code>
  </pre>
  
  <p>
    Or use inline.
  </p>

  <code class="lang-javascript">\{\`import {prism} from "svelte-prism-action";\`\}</code>

</main>
  `}
  </code></pre>

  <h2>Options</h2>
  <p>You can use <code>componentsUrl</code> to set the URL from where to import the Prism.js language files. By default it uses <a href="https://unpkg.com/">unpkg cdn</a>, but you can use a local resource instead.</p>

  <p>You can also change the IntersectionObserver options. For more information on what they do see <a href="https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces">https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces</a> .</p>

  <pre>
    <code class="lang-javascript">
{`<main use:prism={{
  root: null,
  rootMargin: "100px",
  threshold: 0,
  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components"
}}> 
...
</main>`}
    </code>
  </pre>

  <h2>Lazy Loading</h2>
  <p>
    The language files get lazy loaded. So you don't have to worry which files to include in your project. By default <a href="https://unpkg.com">unpkg CDN</a> is used. But you can set this to whatever you like with the `componentsUrl` option.
  </p>
  <p>Please scroll down to test lazy loading.</p>
  <div style="height:1000px">&nbsp;</div>

  <pre>
    <code id="test_markdown" class="lang-markdown">
{`
# Hi
This is my super cool markdown file. I'm just an example. 
But I really like to tell you something about myself.

That's fancy, huh?

\`\`\`js
  console.log("I can write code inside code.");
\`\`\`


\`\`\`css
  #test{
    background: green;
  }
\`\`\`
`}
    </code>
  </pre>
</main>