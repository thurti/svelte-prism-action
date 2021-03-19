var app=function(){"use strict";function e(){}function r(e){return e()}function t(){return Object.create(null)}function n(e){e.forEach(r)}function a(e){return"function"==typeof e}function i(e,r){return e!=e?r==r:e!==r||e&&"object"==typeof e||"function"==typeof e}function o(e,r){e.appendChild(r)}function s(e,r,t){e.insertBefore(r,t||null)}function l(e){e.parentNode.removeChild(e)}function c(e){return document.createElement(e)}function u(e){return document.createTextNode(e)}function p(){return u(" ")}function f(e,r,t){null==t?e.removeAttribute(r):e.getAttribute(r)!==t&&e.setAttribute(r,t)}let m;function d(e){m=e}const h=[],g=[],v=[],k=[],y=Promise.resolve();let b=!1;function q(){b||(b=!0,y.then($))}function x(e){v.push(e)}let w=!1;const j=new Set;function $(){if(!w){w=!0;do{for(let e=0;e<h.length;e+=1){const r=h[e];d(r),A(r.$$)}for(d(null),h.length=0;g.length;)g.pop()();for(let e=0;e<v.length;e+=1){const r=v[e];j.has(r)||(j.add(r),r())}v.length=0}while(h.length);for(;k.length;)k.pop()();b=!1,w=!1,j.clear()}}function A(e){if(null!==e.fragment){e.update(),n(e.before_update);const r=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,r),e.after_update.forEach(x)}}const _=new Set;function C(e,r){e&&e.i&&(_.delete(e),e.i(r))}function E(e,r,t,n){if(e&&e.o){if(_.has(e))return;_.add(e),undefined.c.push((()=>{_.delete(e),n&&(t&&e.d(1),n())})),e.o(r)}}function P(e,t,i,o){const{fragment:s,on_mount:l,on_destroy:c,after_update:u}=e.$$;s&&s.m(t,i),o||x((()=>{const t=l.map(r).filter(a);c?c.push(...t):n(t),e.$$.on_mount=[]})),u.forEach(x)}function I(e,r){const t=e.$$;null!==t.fragment&&(n(t.on_destroy),t.fragment&&t.fragment.d(r),t.on_destroy=t.fragment=null,t.ctx=[])}function O(r,a,i,o,s,c,u=[-1]){const p=m;d(r);const f=r.$$={fragment:null,ctx:null,props:c,update:e,not_equal:s,bound:t(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:[]),callbacks:t(),dirty:u,skip_bound:!1};let g=!1;if(f.ctx=i?i(r,a.props||{},((e,t,...n)=>{const a=n.length?n[0]:t;return f.ctx&&s(f.ctx[e],f.ctx[e]=a)&&(!f.skip_bound&&f.bound[e]&&f.bound[e](a),g&&function(e,r){-1===e.$$.dirty[0]&&(h.push(e),q(),e.$$.dirty.fill(0)),e.$$.dirty[r/31|0]|=1<<r%31}(r,e)),t})):[],f.update(),g=!0,n(f.before_update),f.fragment=!!o&&o(f.ctx),a.target){if(a.hydrate){const e=function(e){return Array.from(e.childNodes)}(a.target);f.fragment&&f.fragment.l(e),e.forEach(l)}else f.fragment&&f.fragment.c();a.intro&&C(r.$$.fragment),P(r,a.target,a.anchor,a.customElement),$()}d(p)}class S{$destroy(){I(this,1),this.$destroy=e}$on(e,r){const t=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return t.push(r),()=>{const e=t.indexOf(r);-1!==e&&t.splice(e,1)}}$set(e){var r;this.$$set&&(r=e,0!==Object.keys(r).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}var L="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function T(e){var r={exports:{}};return e(r,r.exports),r.exports}var M=T((function(e){var r=function(e){var r=/\blang(?:uage)?-([\w-]+)\b/i,t=0,n={manual:e.Prism&&e.Prism.manual,disableWorkerMessageHandler:e.Prism&&e.Prism.disableWorkerMessageHandler,util:{encode:function e(r){return r instanceof a?new a(r.type,e(r.content),r.alias):Array.isArray(r)?r.map(e):r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++t}),e.__id},clone:function e(r,t){var a,i;switch(t=t||{},n.util.type(r)){case"Object":if(i=n.util.objId(r),t[i])return t[i];for(var o in a={},t[i]=a,r)r.hasOwnProperty(o)&&(a[o]=e(r[o],t));return a;case"Array":return i=n.util.objId(r),t[i]?t[i]:(a=[],t[i]=a,r.forEach((function(r,n){a[n]=e(r,t)})),a);default:return r}},getLanguage:function(e){for(;e&&!r.test(e.className);)e=e.parentElement;return e?(e.className.match(r)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(n){var e=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(n.stack)||[])[1];if(e){var r=document.getElementsByTagName("script");for(var t in r)if(r[t].src==e)return r[t]}return null}},isActive:function(e,r,t){for(var n="no-"+r;e;){var a=e.classList;if(a.contains(r))return!0;if(a.contains(n))return!1;e=e.parentElement}return!!t}},languages:{extend:function(e,r){var t=n.util.clone(n.languages[e]);for(var a in r)t[a]=r[a];return t},insertBefore:function(e,r,t,a){var i=(a=a||n.languages)[e],o={};for(var s in i)if(i.hasOwnProperty(s)){if(s==r)for(var l in t)t.hasOwnProperty(l)&&(o[l]=t[l]);t.hasOwnProperty(s)||(o[s]=i[s])}var c=a[e];return a[e]=o,n.languages.DFS(n.languages,(function(r,t){t===c&&r!=e&&(this[r]=o)})),o},DFS:function e(r,t,a,i){i=i||{};var o=n.util.objId;for(var s in r)if(r.hasOwnProperty(s)){t.call(r,s,r[s],a||s);var l=r[s],c=n.util.type(l);"Object"!==c||i[o(l)]?"Array"!==c||i[o(l)]||(i[o(l)]=!0,e(l,t,s,i)):(i[o(l)]=!0,e(l,t,null,i))}}},plugins:{},highlightAll:function(e,r){n.highlightAllUnder(document,e,r)},highlightAllUnder:function(e,r,t){var a={callback:t,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};n.hooks.run("before-highlightall",a),a.elements=Array.prototype.slice.apply(a.container.querySelectorAll(a.selector)),n.hooks.run("before-all-elements-highlight",a);for(var i,o=0;i=a.elements[o++];)n.highlightElement(i,!0===r,a.callback)},highlightElement:function(t,a,i){var o=n.util.getLanguage(t),s=n.languages[o];t.className=t.className.replace(r,"").replace(/\s+/g," ")+" language-"+o;var l=t.parentElement;l&&"pre"===l.nodeName.toLowerCase()&&(l.className=l.className.replace(r,"").replace(/\s+/g," ")+" language-"+o);var c={element:t,language:o,grammar:s,code:t.textContent};function u(e){c.highlightedCode=e,n.hooks.run("before-insert",c),c.element.innerHTML=c.highlightedCode,n.hooks.run("after-highlight",c),n.hooks.run("complete",c),i&&i.call(c.element)}if(n.hooks.run("before-sanity-check",c),!c.code)return n.hooks.run("complete",c),void(i&&i.call(c.element));if(n.hooks.run("before-highlight",c),c.grammar)if(a&&e.Worker){var p=new Worker(n.filename);p.onmessage=function(e){u(e.data)},p.postMessage(JSON.stringify({language:c.language,code:c.code,immediateClose:!0}))}else u(n.highlight(c.code,c.grammar,c.language));else u(n.util.encode(c.code))},highlight:function(e,r,t){var i={code:e,grammar:r,language:t};return n.hooks.run("before-tokenize",i),i.tokens=n.tokenize(i.code,i.grammar),n.hooks.run("after-tokenize",i),a.stringify(n.util.encode(i.tokens),i.language)},tokenize:function(e,r){var t=r.rest;if(t){for(var c in t)r[c]=t[c];delete r.rest}var u=new o;return s(u,u.head,e),function e(r,t,o,c,u,p){for(var f in o)if(o.hasOwnProperty(f)&&o[f]){var m=o[f];m=Array.isArray(m)?m:[m];for(var d=0;d<m.length;++d){if(p&&p.cause==f+","+d)return;var h=m[d],g=h.inside,v=!!h.lookbehind,k=!!h.greedy,y=h.alias;if(k&&!h.pattern.global){var b=h.pattern.toString().match(/[imsuy]*$/)[0];h.pattern=RegExp(h.pattern.source,b+"g")}for(var q=h.pattern||h,x=c.next,w=u;x!==t.tail&&!(p&&w>=p.reach);w+=x.value.length,x=x.next){var j=x.value;if(t.length>r.length)return;if(!(j instanceof a)){var $,A=1;if(k){if(!($=i(q,w,r,v)))break;var _=$.index,C=$.index+$[0].length,E=w;for(E+=x.value.length;E<=_;)E+=(x=x.next).value.length;if(w=E-=x.value.length,x.value instanceof a)continue;for(var P=x;P!==t.tail&&(E<C||"string"==typeof P.value);P=P.next)A++,E+=P.value.length;A--,j=r.slice(w,E),$.index-=w}else if(!($=i(q,0,j,v)))continue;_=$.index;var I=$[0],O=j.slice(0,_),S=j.slice(_+I.length),L=w+j.length;p&&L>p.reach&&(p.reach=L);var T=x.prev;O&&(T=s(t,T,O),w+=O.length),l(t,T,A),x=s(t,T,new a(f,g?n.tokenize(I,g):I,y,I)),S&&s(t,x,S),1<A&&e(r,t,o,x.prev,w,{cause:f+","+d,reach:L})}}}}}(e,u,r,u.head,0),function(e){for(var r=[],t=e.head.next;t!==e.tail;)r.push(t.value),t=t.next;return r}(u)},hooks:{all:{},add:function(e,r){var t=n.hooks.all;t[e]=t[e]||[],t[e].push(r)},run:function(e,r){var t=n.hooks.all[e];if(t&&t.length)for(var a,i=0;a=t[i++];)a(r)}},Token:a};function a(e,r,t,n){this.type=e,this.content=r,this.alias=t,this.length=0|(n||"").length}function i(e,r,t,n){e.lastIndex=r;var a=e.exec(t);if(a&&n&&a[1]){var i=a[1].length;a.index+=i,a[0]=a[0].slice(i)}return a}function o(){var e={value:null,prev:null,next:null},r={value:null,prev:e,next:null};e.next=r,this.head=e,this.tail=r,this.length=0}function s(e,r,t){var n=r.next,a={value:t,prev:r,next:n};return r.next=a,n.prev=a,e.length++,a}function l(e,r,t){for(var n=r.next,a=0;a<t&&n!==e.tail;a++)n=n.next;(r.next=n).prev=r,e.length-=a}if(e.Prism=n,a.stringify=function e(r,t){if("string"==typeof r)return r;if(Array.isArray(r)){var a="";return r.forEach((function(r){a+=e(r,t)})),a}var i={type:r.type,content:e(r.content,t),tag:"span",classes:["token",r.type],attributes:{},language:t},o=r.alias;o&&(Array.isArray(o)?Array.prototype.push.apply(i.classes,o):i.classes.push(o)),n.hooks.run("wrap",i);var s="";for(var l in i.attributes)s+=" "+l+'="'+(i.attributes[l]||"").replace(/"/g,"&quot;")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'"'+s+">"+i.content+"</"+i.tag+">"},!e.document)return e.addEventListener&&(n.disableWorkerMessageHandler||e.addEventListener("message",(function(r){var t=JSON.parse(r.data),a=t.language,i=t.code,o=t.immediateClose;e.postMessage(n.highlight(i,n.languages[a],a)),o&&e.close()}),!1)),n;var c=n.util.currentScript();function u(){n.manual||n.highlightAll()}if(c&&(n.filename=c.src,c.hasAttribute("data-manual")&&(n.manual=!0)),!n.manual){var p=document.readyState;"loading"===p||"interactive"===p&&c&&c.defer?document.addEventListener("DOMContentLoaded",u):window.requestAnimationFrame?window.requestAnimationFrame(u):window.setTimeout(u,16)}return n}("undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{});e.exports&&(e.exports=r),void 0!==L&&(L.Prism=r)})),H=T((function(e){var r=function(){var e=function(){};function r(e,r){Array.isArray(e)?e.forEach(r):null!=e&&r(e,0)}function t(e){for(var r={},t=0,n=e.length;t<n;t++)r[e[t]]=!0;return r}function n(e){var t={},n=[];function a(n,i){if(!(n in t)){i.push(n);var o=i.indexOf(n);if(o<i.length-1)throw new Error("Circular dependency: "+i.slice(o).join(" -> "));var s={},l=e[n];if(l){function c(r){if(!(r in e))throw new Error(n+" depends on an unknown component "+r);if(!(r in s))for(var o in a(r,i),s[r]=!0,t[r])s[o]=!0}r(l.require,c),r(l.optional,c),r(l.modify,c)}t[n]=s,i.pop()}}return function(e){var r=t[e];return r||(a(e,n),r=t[e]),r}}function a(e){for(var r in e)return!0;return!1}return function(i,o,s){var l=function(e){var r={};for(var t in e){var n=e[t];for(var a in n)if("meta"!=a){var i=n[a];r[a]="string"==typeof i?{title:i}:i}}return r}(i),c=function(e){var t;return function(n){if(n in e)return n;if(!t)for(var a in t={},e){var i=e[a];r(i&&i.alias,(function(r){if(r in t)throw new Error(r+" cannot be alias for both "+a+" and "+t[r]);if(r in e)throw new Error(r+" cannot be alias of "+a+" because it is a component.");t[r]=a}))}return t[n]||n}}(l);o=o.map(c),s=(s||[]).map(c);var u=t(o),p=t(s);o.forEach((function e(t){var n=l[t];r(n&&n.require,(function(r){r in p||(u[r]=!0,e(r))}))}));for(var f,m=n(l),d=u;a(d);){for(var h in f={},d){var g=l[h];r(g&&g.modify,(function(e){e in p&&(f[e]=!0)}))}for(var v in p)if(!(v in u))for(var k in m(v))if(k in u){f[v]=!0;break}for(var y in d=f)u[y]=!0}var b={getIds:function(){var e=[];return b.load((function(r){e.push(r)})),e},load:function(r,t){return function(r,t,n,a){const i=a?a.series:void 0,o=a?a.parallel:e;var s={},l={};function c(e){if(e in s)return s[e];l[e]=!0;var a,u=[];for(var p in r(e))p in t&&u.push(p);if(0===u.length)a=n(e);else{var f=o(u.map((function(e){var r=c(e);return delete l[e],r})));i?a=i(f,(function(){return n(e)})):n(e)}return s[e]=a}for(var u in t)c(u);var p=[];for(var f in l)p.push(s[f]);return o(p)}(m,u,r,t)}};return b}}();e.exports=r}));const z={languages:{markup:{alias:["html","xml","svg","mathml","ssml","atom","rss"]},css:{},clike:{},javascript:{alias:"js",require:"clike"},abap:{},abnf:{},actionscript:{require:"javascript"},ada:{},agda:{},al:{},antlr4:{alias:"g4"},apacheconf:{},apex:{require:["clike","sql"]},apl:{},applescript:{},aql:{},arduino:{require:"cpp"},arff:{},asciidoc:{alias:"adoc"},aspnet:{require:["markup","csharp"]},asm6502:{},autohotkey:{},autoit:{},bash:{alias:"shell"},basic:{},batch:{},bbcode:{alias:"shortcode"},birb:{require:"clike"},bison:{require:"c"},bnf:{alias:"rbnf"},brainfuck:{},brightscript:{},bro:{},bsl:{alias:"oscript"},c:{require:"clike"},csharp:{alias:["cs","dotnet"],require:"clike"},cpp:{require:"c"},cil:{},clojure:{},cmake:{},coffeescript:{alias:"coffee",require:"javascript"},concurnas:{alias:"conc"},csp:{},crystal:{require:"ruby"},"css-extras":{require:"css"},cypher:{},d:{require:"clike"},dart:{require:"clike"},dataweave:{},dax:{},dhall:{},diff:{},django:{alias:"jinja2",require:"markup-templating"},"dns-zone-file":{alias:"dns-zone"},docker:{alias:"dockerfile"},ebnf:{},editorconfig:{},eiffel:{},ejs:{alias:"eta",require:["javascript","markup-templating"]},elixir:{},elm:{},etlua:{require:["lua","markup-templating"]},erb:{require:["ruby","markup-templating"]},erlang:{},"excel-formula":{alias:["xlsx","xls"]},fsharp:{require:"clike"},factor:{},"firestore-security-rules":{require:"clike"},flow:{require:"javascript"},fortran:{},ftl:{require:"markup-templating"},gml:{alias:"gamemakerlanguage",require:"clike"},gcode:{},gdscript:{},gedcom:{},gherkin:{},git:{},glsl:{require:"c"},go:{require:"clike"},graphql:{},groovy:{require:"clike"},haml:{require:"ruby"},handlebars:{require:"markup-templating"},haskell:{alias:"hs"},haxe:{require:"clike"},hcl:{},hlsl:{require:"c"},http:{},hpkp:{},hsts:{},ichigojam:{},icon:{},ignore:{alias:["gitignore","hgignore","npmignore"]},inform7:{},ini:{},io:{},j:{},java:{require:"clike"},javadoc:{require:["markup","java","javadoclike"]},javadoclike:{},javastacktrace:{},jolie:{require:"clike"},jq:{},jsdoc:{require:["javascript","javadoclike","typescript"]},"js-extras":{require:"javascript"},json:{alias:"webmanifest"},json5:{require:"json"},jsonp:{require:"json"},jsstacktrace:{},"js-templates":{require:"javascript"},julia:{},keyman:{},kotlin:{alias:["kt","kts"],require:"clike"},latex:{alias:["tex","context"]},latte:{require:["clike","markup-templating","php"]},less:{require:"css"},lilypond:{alias:"ly",require:"scheme"},liquid:{},lisp:{alias:["emacs","elisp","emacs-lisp"]},livescript:{},llvm:{},lolcode:{},lua:{},makefile:{},markdown:{alias:"md",require:"markup"},"markup-templating":{require:"markup"},matlab:{},mel:{},mizar:{},mongodb:{require:"javascript"},monkey:{},moonscript:{alias:"moon"},n1ql:{},n4js:{alias:"n4jsd",require:"javascript"},"nand2tetris-hdl":{},naniscript:{alias:"nani"},nasm:{},neon:{},nginx:{require:"clike"},nim:{},nix:{},nsis:{},objectivec:{alias:"objc",require:"c"},ocaml:{},opencl:{require:"c"},oz:{},parigp:{},parser:{require:"markup"},pascal:{alias:"objectpascal"},pascaligo:{},pcaxis:{alias:"px"},peoplecode:{alias:"pcode"},perl:{},php:{require:"markup-templating"},phpdoc:{require:["php","javadoclike"]},"php-extras":{require:"php"},plsql:{require:"sql"},powerquery:{alias:["pq","mscript"]},powershell:{},processing:{require:"clike"},prolog:{},promql:{},properties:{},protobuf:{require:"clike"},pug:{require:["markup","javascript"]},puppet:{},pure:{},purebasic:{alias:"pbfasm",require:"clike"},purescript:{alias:"purs",require:"haskell"},python:{alias:"py"},q:{},qml:{require:"javascript"},qore:{require:"clike"},r:{},racket:{alias:"rkt",require:"scheme"},jsx:{require:["markup","javascript"]},tsx:{require:["jsx","typescript"]},reason:{require:"clike"},regex:{},renpy:{alias:"rpy"},rest:{},rip:{},roboconf:{},robotframework:{alias:"robot"},ruby:{alias:"rb",require:"clike"},rust:{},sas:{},sass:{require:"css"},scss:{require:"css"},scala:{require:"java"},scheme:{},"shell-session":{alias:["sh-session","shellsession"],require:"bash"},smali:{},smalltalk:{},smarty:{require:"markup-templating"},sml:{alias:"smlnj"},solidity:{alias:"sol",require:"clike"},"solution-file":{alias:"sln"},soy:{require:"markup-templating"},sparql:{alias:"rq",require:"turtle"},"splunk-spl":{},sqf:{require:"clike"},sql:{},stan:{},iecst:{},stylus:{},swift:{require:"clike"},"t4-templating":{},"t4-cs":{alias:"t4",require:["t4-templating","csharp"]},"t4-vb":{require:["t4-templating","vbnet"]},tap:{require:"yaml"},tcl:{},tt2:{require:["clike","markup-templating"]},textile:{require:"markup"},toml:{},turtle:{alias:"trig"},twig:{require:"markup"},typescript:{alias:"ts",require:"javascript"},typoscript:{alias:"tsconfig"},unrealscript:{alias:["uscript","uc"]},vala:{require:"clike"},vbnet:{require:"basic"},velocity:{require:"markup"},verilog:{},vhdl:{},vim:{},"visual-basic":{alias:["vb","vba"]},warpscript:{},wasm:{},wiki:{require:"markup"},xeora:{alias:"xeoracube",require:"markup"},"xml-doc":{require:"markup"},xojo:{},xquery:{require:"markup"},yaml:{alias:"yml"},yang:{},zig:{}}};"undefined"!=typeof window&&(window.Prism=window.Prism||{},M.manual=!0);const N={root:null,rootMargin:"100px",threshold:0,componentsUrl:"https://unpkg.com/prismjs@1.22.0/components"};function U(e,r){const t={...N,...r},n=async function(e){if(!e.dataset.isHighlighted){const r=function(e){let r=[];const t=e.className.match(/[lang|language]-(\w+)/)?.[1];t&&r.push(t);if("markdown"===t){let t=e.innerHTML.match(/(```)(\w+)/gm);t=t?.map((e=>e.replace("```","")))||[],r=[...r,...t]}return r}(e);if(r.length>0)try{await function(e){const r=H(z,e);return r.load((e=>import(`${t.componentsUrl}/prism-${e}.min.js`)),{series:async(e,r)=>{await e,await r()},parallel:async e=>{await Promise.all(e)}})}(r),M.highlightElement(e),e.dataset.isHighlighted=!0}catch(e){console.warn(e)}}};function a(e){e.forEach((e=>{e.isIntersecting&&n(e.target)}))}let i;return(q(),y).then((()=>{const r=e.querySelectorAll("code");i=new IntersectionObserver(a,{...t}),[...r].forEach((e=>{i.observe(e)}))})),{destroy(){i.disconnect()}}}function W(r){let t,n,i,m,d,h,g,v,k,y,b,q,x,w,j,$,A,_,C,E,P,I,O,S,L,T,M,H,z,N,W,B,F,D,G,J,R,Y,K,Q,V,X,Z,ee,re,te,ne,ae,ie,oe,se,le,ce,ue;return{c(){var e,r,a;t=c("main"),n=c("h1"),n.textContent="svelte-prism-action",i=p(),m=c("p"),m.innerHTML='<a href="https://svelte.dev">Svelte</a> action for lazy loading <a href="https://prismjs.com">Prism.js</a> code highlighting.',d=p(),h=c("p"),h.innerHTML='<a href="https://github.com/thurti/svelte-prism-action">Code on GitHub</a>',g=p(),v=c("h2"),v.textContent="Install",k=p(),y=c("code"),y.textContent="$ npm install svelte-prism-action",b=p(),q=c("p"),q.innerHTML='Include a Prism.js CSS theme in your svelte component or use the <code lang="html">&lt;head&gt;</code> section of your <code class="lang-html">index.html</code>.',x=p(),w=c("pre"),j=c("code"),j.textContent='<link href="https://unpkg.com/prismjs@1.22.0/themes/prism.css" rel="stylesheet" />',$=p(),A=c("h2"),A.textContent="Usage",_=p(),C=c("p"),C.innerHTML='Import prism from svelte-prism-action. Add the action to a component with <code class="lang-html">use:prism</code>. All <code class="lang-html">&lt;code&gt;</code> elements with a <code class="lang-html">class=&quot;language-...&quot;</code> will get highlighted once they have entered the viewport.',E=p(),P=c("p"),P.innerHTML='For available language tags see <a href="https://prismjs.com/#supported-languages">https://prismjs.com/#supported-languages</a> .',I=p(),O=c("p"),S=c("b"),S.textContent="HINT",L=u(" If you are writing your codeblocks directly into a svelte component you need to "),T=c("b"),T.textContent="escape special characters",M=u(" (eg. curley brackets). Another way is to wrap the code inside "),H=c("code"),H.textContent="{``}",z=u("."),N=p(),W=c("pre"),B=c("code"),B.textContent='\n<script>\n  import {prism} from "svelte-prism-action";\n<\/script>\n\n\x3c!-- add action to component --\x3e\n<main use:prism>\n\n\x3c!-- or set some options\n  <main use:prism={{\n    componentsUrl: "https://myPathToPrism/components"\n  }}>\n--\x3e\n\n  <p>\n    Use in code blocks.\n  </p>\n\n  <pre>\n    <code class="lang-css"> \x3c!-- wrap inside {``} if using inside svelte component--\x3e\n      {`.bg-gold{\n        background: gold;\n      }`}\n    </code>\n  </pre>\n  \n  <p>\n    Or use inline.\n  </p>\n\n  <code class="lang-javascript">{`import {prism} from "svelte-prism-action";`}</code>\n\n</main>\n  ',F=p(),D=c("h2"),D.textContent="Options",G=p(),J=c("p"),J.innerHTML='You can use <code>componentsUrl</code> to set the URL from where to import the Prism.js language files. By default it uses <a href="https://unpkg.com/">unpkg cdn</a>, but you can use a local resource instead.',R=p(),Y=c("p"),Y.innerHTML='You can also change the IntersectionObserver options. For more information on what they do see <a href="https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces">https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces</a> .',K=p(),Q=c("pre"),V=c("code"),V.textContent='<main use:prism={{\n  root: null,\n  rootMargin: "100px",\n  threshold: 0,\n  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components"\n}}> \n...\n</main>',X=p(),Z=c("h2"),Z.textContent="Lazy Loading",ee=p(),re=c("p"),re.innerHTML='The language files get lazy loaded. So you don&#39;t have to worry which files to include in your project. By default <a href="https://unpkg.com">unpkg CDN</a> is used. But you can set this to whatever you like with the `componentsUrl` option.',te=p(),ne=c("p"),ne.textContent="Please scroll down to test lazy loading.",ae=p(),ie=c("div"),ie.textContent=" ",oe=p(),se=c("pre"),le=c("code"),le.textContent="\n# Hi\nThis is my super cool markdown file. I'm just an example. \nBut I really like to tell you something about myself.\n\nThat's fancy, huh?\n\n```js\n  console.log(\"I can write code inside code.\");\n```\n\n\n```css\n  #test{\n    background: green;\n  }\n```\n",f(y,"id","test_inline"),f(y,"class","lang-bash"),f(j,"id","test_block"),f(j,"class","lang-html"),f(B,"class","lang-html"),f(V,"class","lang-javascript"),e="height",r="1000px",ie.style.setProperty(e,r,a?"important":""),f(le,"id","test_markdown"),f(le,"class","lang-markdown")},m(r,l){var c;s(r,t,l),o(t,n),o(t,i),o(t,m),o(t,d),o(t,h),o(t,g),o(t,v),o(t,k),o(t,y),o(t,b),o(t,q),o(t,x),o(t,w),o(w,j),o(t,$),o(t,A),o(t,_),o(t,C),o(t,E),o(t,P),o(t,I),o(t,O),o(O,S),o(O,L),o(O,T),o(O,M),o(O,H),o(O,z),o(t,N),o(t,W),o(W,B),o(t,F),o(t,D),o(t,G),o(t,J),o(t,R),o(t,Y),o(t,K),o(t,Q),o(Q,V),o(t,X),o(t,Z),o(t,ee),o(t,re),o(t,te),o(t,ne),o(t,ae),o(t,ie),o(t,oe),o(t,se),o(se,le),ce||(c=U.call(null,t),ue=c&&a(c.destroy)?c.destroy:e,ce=!0)},p:e,i:e,o:e,d(e){e&&l(t),ce=!1,ue()}}}class B extends S{constructor(e){super(),O(this,e,null,W,i,{})}}function F(r){let t,n,a=function(e){let r,t;return r=new B({}),{c(){var e;(e=r.$$.fragment)&&e.c()},m(e,n){P(r,e,n),t=!0},i(e){t||(C(r.$$.fragment,e),t=!0)},o(e){E(r.$$.fragment,e),t=!1},d(e){I(r,e)}}}();return{c(){a&&a.c(),t=u("")},m(e,r){a&&a.m(e,r),s(e,t,r),n=!0},p:e,i(e){n||(C(a),n=!0)},o(e){E(a),n=!1},d(e){a&&a.d(e),e&&l(t)}}}return new class extends S{constructor(e){super(),O(this,e,null,F,i,{})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
