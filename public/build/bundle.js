
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.56.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var prismCore = createCommonjsModule(function (module) {
    /// <reference lib="WebWorker"/>

    var _self = (typeof window !== 'undefined')
    	? window   // if in browser
    	: (
    		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
    			? self // if in worker
    			: {}   // if in node js
    	);

    /**
     * Prism: Lightweight, robust, elegant syntax highlighting
     *
     * @license MIT <https://opensource.org/licenses/MIT>
     * @author Lea Verou <https://lea.verou.me>
     * @namespace
     * @public
     */
    var Prism = (function (_self) {

    	// Private helper vars
    	var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
    	var uniqueId = 0;

    	// The grammar object for plaintext
    	var plainTextGrammar = {};


    	var _ = {
    		/**
    		 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
    		 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
    		 * additional languages or plugins yourself.
    		 *
    		 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
    		 *
    		 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
    		 * empty Prism object into the global scope before loading the Prism script like this:
    		 *
    		 * ```js
    		 * window.Prism = window.Prism || {};
    		 * Prism.manual = true;
    		 * // add a new <script> to load Prism's script
    		 * ```
    		 *
    		 * @default false
    		 * @type {boolean}
    		 * @memberof Prism
    		 * @public
    		 */
    		manual: _self.Prism && _self.Prism.manual,
    		/**
    		 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
    		 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
    		 * own worker, you don't want it to do this.
    		 *
    		 * By setting this value to `true`, Prism will not add its own listeners to the worker.
    		 *
    		 * You obviously have to change this value before Prism executes. To do this, you can add an
    		 * empty Prism object into the global scope before loading the Prism script like this:
    		 *
    		 * ```js
    		 * window.Prism = window.Prism || {};
    		 * Prism.disableWorkerMessageHandler = true;
    		 * // Load Prism's script
    		 * ```
    		 *
    		 * @default false
    		 * @type {boolean}
    		 * @memberof Prism
    		 * @public
    		 */
    		disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

    		/**
    		 * A namespace for utility methods.
    		 *
    		 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
    		 * change or disappear at any time.
    		 *
    		 * @namespace
    		 * @memberof Prism
    		 */
    		util: {
    			encode: function encode(tokens) {
    				if (tokens instanceof Token) {
    					return new Token(tokens.type, encode(tokens.content), tokens.alias);
    				} else if (Array.isArray(tokens)) {
    					return tokens.map(encode);
    				} else {
    					return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
    				}
    			},

    			/**
    			 * Returns the name of the type of the given value.
    			 *
    			 * @param {any} o
    			 * @returns {string}
    			 * @example
    			 * type(null)      === 'Null'
    			 * type(undefined) === 'Undefined'
    			 * type(123)       === 'Number'
    			 * type('foo')     === 'String'
    			 * type(true)      === 'Boolean'
    			 * type([1, 2])    === 'Array'
    			 * type({})        === 'Object'
    			 * type(String)    === 'Function'
    			 * type(/abc+/)    === 'RegExp'
    			 */
    			type: function (o) {
    				return Object.prototype.toString.call(o).slice(8, -1);
    			},

    			/**
    			 * Returns a unique number for the given object. Later calls will still return the same number.
    			 *
    			 * @param {Object} obj
    			 * @returns {number}
    			 */
    			objId: function (obj) {
    				if (!obj['__id']) {
    					Object.defineProperty(obj, '__id', { value: ++uniqueId });
    				}
    				return obj['__id'];
    			},

    			/**
    			 * Creates a deep clone of the given object.
    			 *
    			 * The main intended use of this function is to clone language definitions.
    			 *
    			 * @param {T} o
    			 * @param {Record<number, any>} [visited]
    			 * @returns {T}
    			 * @template T
    			 */
    			clone: function deepClone(o, visited) {
    				visited = visited || {};

    				var clone; var id;
    				switch (_.util.type(o)) {
    					case 'Object':
    						id = _.util.objId(o);
    						if (visited[id]) {
    							return visited[id];
    						}
    						clone = /** @type {Record<string, any>} */ ({});
    						visited[id] = clone;

    						for (var key in o) {
    							if (o.hasOwnProperty(key)) {
    								clone[key] = deepClone(o[key], visited);
    							}
    						}

    						return /** @type {any} */ (clone);

    					case 'Array':
    						id = _.util.objId(o);
    						if (visited[id]) {
    							return visited[id];
    						}
    						clone = [];
    						visited[id] = clone;

    						(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
    							clone[i] = deepClone(v, visited);
    						});

    						return /** @type {any} */ (clone);

    					default:
    						return o;
    				}
    			},

    			/**
    			 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
    			 *
    			 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
    			 *
    			 * @param {Element} element
    			 * @returns {string}
    			 */
    			getLanguage: function (element) {
    				while (element) {
    					var m = lang.exec(element.className);
    					if (m) {
    						return m[1].toLowerCase();
    					}
    					element = element.parentElement;
    				}
    				return 'none';
    			},

    			/**
    			 * Sets the Prism `language-xxxx` class of the given element.
    			 *
    			 * @param {Element} element
    			 * @param {string} language
    			 * @returns {void}
    			 */
    			setLanguage: function (element, language) {
    				// remove all `language-xxxx` classes
    				// (this might leave behind a leading space)
    				element.className = element.className.replace(RegExp(lang, 'gi'), '');

    				// add the new `language-xxxx` class
    				// (using `classList` will automatically clean up spaces for us)
    				element.classList.add('language-' + language);
    			},

    			/**
    			 * Returns the script element that is currently executing.
    			 *
    			 * This does __not__ work for line script element.
    			 *
    			 * @returns {HTMLScriptElement | null}
    			 */
    			currentScript: function () {
    				if (typeof document === 'undefined') {
    					return null;
    				}
    				if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
    					return /** @type {any} */ (document.currentScript);
    				}

    				// IE11 workaround
    				// we'll get the src of the current script by parsing IE11's error stack trace
    				// this will not work for inline scripts

    				try {
    					throw new Error();
    				} catch (err) {
    					// Get file src url from stack. Specifically works with the format of stack traces in IE.
    					// A stack will look like this:
    					//
    					// Error
    					//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
    					//    at Global code (http://localhost/components/prism-core.js:606:1)

    					var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
    					if (src) {
    						var scripts = document.getElementsByTagName('script');
    						for (var i in scripts) {
    							if (scripts[i].src == src) {
    								return scripts[i];
    							}
    						}
    					}
    					return null;
    				}
    			},

    			/**
    			 * Returns whether a given class is active for `element`.
    			 *
    			 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
    			 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
    			 * given class is just the given class with a `no-` prefix.
    			 *
    			 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
    			 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
    			 * ancestors have the given class or the negated version of it, then the default activation will be returned.
    			 *
    			 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
    			 * version of it, the class is considered active.
    			 *
    			 * @param {Element} element
    			 * @param {string} className
    			 * @param {boolean} [defaultActivation=false]
    			 * @returns {boolean}
    			 */
    			isActive: function (element, className, defaultActivation) {
    				var no = 'no-' + className;

    				while (element) {
    					var classList = element.classList;
    					if (classList.contains(className)) {
    						return true;
    					}
    					if (classList.contains(no)) {
    						return false;
    					}
    					element = element.parentElement;
    				}
    				return !!defaultActivation;
    			}
    		},

    		/**
    		 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
    		 *
    		 * @namespace
    		 * @memberof Prism
    		 * @public
    		 */
    		languages: {
    			/**
    			 * The grammar for plain, unformatted text.
    			 */
    			plain: plainTextGrammar,
    			plaintext: plainTextGrammar,
    			text: plainTextGrammar,
    			txt: plainTextGrammar,

    			/**
    			 * Creates a deep copy of the language with the given id and appends the given tokens.
    			 *
    			 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
    			 * will be overwritten at its original position.
    			 *
    			 * ## Best practices
    			 *
    			 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
    			 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
    			 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
    			 *
    			 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
    			 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
    			 *
    			 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
    			 * @param {Grammar} redef The new tokens to append.
    			 * @returns {Grammar} The new language created.
    			 * @public
    			 * @example
    			 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
    			 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
    			 *     // at its original position
    			 *     'comment': { ... },
    			 *     // CSS doesn't have a 'color' token, so this token will be appended
    			 *     'color': /\b(?:red|green|blue)\b/
    			 * });
    			 */
    			extend: function (id, redef) {
    				var lang = _.util.clone(_.languages[id]);

    				for (var key in redef) {
    					lang[key] = redef[key];
    				}

    				return lang;
    			},

    			/**
    			 * Inserts tokens _before_ another token in a language definition or any other grammar.
    			 *
    			 * ## Usage
    			 *
    			 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
    			 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
    			 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
    			 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
    			 * this:
    			 *
    			 * ```js
    			 * Prism.languages.markup.style = {
    			 *     // token
    			 * };
    			 * ```
    			 *
    			 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
    			 * before existing tokens. For the CSS example above, you would use it like this:
    			 *
    			 * ```js
    			 * Prism.languages.insertBefore('markup', 'cdata', {
    			 *     'style': {
    			 *         // token
    			 *     }
    			 * });
    			 * ```
    			 *
    			 * ## Special cases
    			 *
    			 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
    			 * will be ignored.
    			 *
    			 * This behavior can be used to insert tokens after `before`:
    			 *
    			 * ```js
    			 * Prism.languages.insertBefore('markup', 'comment', {
    			 *     'comment': Prism.languages.markup.comment,
    			 *     // tokens after 'comment'
    			 * });
    			 * ```
    			 *
    			 * ## Limitations
    			 *
    			 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
    			 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
    			 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
    			 * deleting properties which is necessary to insert at arbitrary positions.
    			 *
    			 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
    			 * Instead, it will create a new object and replace all references to the target object with the new one. This
    			 * can be done without temporarily deleting properties, so the iteration order is well-defined.
    			 *
    			 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
    			 * you hold the target object in a variable, then the value of the variable will not change.
    			 *
    			 * ```js
    			 * var oldMarkup = Prism.languages.markup;
    			 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
    			 *
    			 * assert(oldMarkup !== Prism.languages.markup);
    			 * assert(newMarkup === Prism.languages.markup);
    			 * ```
    			 *
    			 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
    			 * object to be modified.
    			 * @param {string} before The key to insert before.
    			 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
    			 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
    			 * object to be modified.
    			 *
    			 * Defaults to `Prism.languages`.
    			 * @returns {Grammar} The new grammar object.
    			 * @public
    			 */
    			insertBefore: function (inside, before, insert, root) {
    				root = root || /** @type {any} */ (_.languages);
    				var grammar = root[inside];
    				/** @type {Grammar} */
    				var ret = {};

    				for (var token in grammar) {
    					if (grammar.hasOwnProperty(token)) {

    						if (token == before) {
    							for (var newToken in insert) {
    								if (insert.hasOwnProperty(newToken)) {
    									ret[newToken] = insert[newToken];
    								}
    							}
    						}

    						// Do not insert token which also occur in insert. See #1525
    						if (!insert.hasOwnProperty(token)) {
    							ret[token] = grammar[token];
    						}
    					}
    				}

    				var old = root[inside];
    				root[inside] = ret;

    				// Update references in other language definitions
    				_.languages.DFS(_.languages, function (key, value) {
    					if (value === old && key != inside) {
    						this[key] = ret;
    					}
    				});

    				return ret;
    			},

    			// Traverse a language definition with Depth First Search
    			DFS: function DFS(o, callback, type, visited) {
    				visited = visited || {};

    				var objId = _.util.objId;

    				for (var i in o) {
    					if (o.hasOwnProperty(i)) {
    						callback.call(o, i, o[i], type || i);

    						var property = o[i];
    						var propertyType = _.util.type(property);

    						if (propertyType === 'Object' && !visited[objId(property)]) {
    							visited[objId(property)] = true;
    							DFS(property, callback, null, visited);
    						} else if (propertyType === 'Array' && !visited[objId(property)]) {
    							visited[objId(property)] = true;
    							DFS(property, callback, i, visited);
    						}
    					}
    				}
    			}
    		},

    		plugins: {},

    		/**
    		 * This is the most high-level function in Prism’s API.
    		 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
    		 * each one of them.
    		 *
    		 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
    		 *
    		 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
    		 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
    		 * @memberof Prism
    		 * @public
    		 */
    		highlightAll: function (async, callback) {
    			_.highlightAllUnder(document, async, callback);
    		},

    		/**
    		 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
    		 * {@link Prism.highlightElement} on each one of them.
    		 *
    		 * The following hooks will be run:
    		 * 1. `before-highlightall`
    		 * 2. `before-all-elements-highlight`
    		 * 3. All hooks of {@link Prism.highlightElement} for each element.
    		 *
    		 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
    		 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
    		 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
    		 * @memberof Prism
    		 * @public
    		 */
    		highlightAllUnder: function (container, async, callback) {
    			var env = {
    				callback: callback,
    				container: container,
    				selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
    			};

    			_.hooks.run('before-highlightall', env);

    			env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

    			_.hooks.run('before-all-elements-highlight', env);

    			for (var i = 0, element; (element = env.elements[i++]);) {
    				_.highlightElement(element, async === true, env.callback);
    			}
    		},

    		/**
    		 * Highlights the code inside a single element.
    		 *
    		 * The following hooks will be run:
    		 * 1. `before-sanity-check`
    		 * 2. `before-highlight`
    		 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
    		 * 4. `before-insert`
    		 * 5. `after-highlight`
    		 * 6. `complete`
    		 *
    		 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
    		 * the element's language.
    		 *
    		 * @param {Element} element The element containing the code.
    		 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
    		 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
    		 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
    		 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
    		 *
    		 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
    		 * asynchronous highlighting to work. You can build your own bundle on the
    		 * [Download page](https://prismjs.com/download.html).
    		 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
    		 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
    		 * @memberof Prism
    		 * @public
    		 */
    		highlightElement: function (element, async, callback) {
    			// Find language
    			var language = _.util.getLanguage(element);
    			var grammar = _.languages[language];

    			// Set language on the element, if not present
    			_.util.setLanguage(element, language);

    			// Set language on the parent, for styling
    			var parent = element.parentElement;
    			if (parent && parent.nodeName.toLowerCase() === 'pre') {
    				_.util.setLanguage(parent, language);
    			}

    			var code = element.textContent;

    			var env = {
    				element: element,
    				language: language,
    				grammar: grammar,
    				code: code
    			};

    			function insertHighlightedCode(highlightedCode) {
    				env.highlightedCode = highlightedCode;

    				_.hooks.run('before-insert', env);

    				env.element.innerHTML = env.highlightedCode;

    				_.hooks.run('after-highlight', env);
    				_.hooks.run('complete', env);
    				callback && callback.call(env.element);
    			}

    			_.hooks.run('before-sanity-check', env);

    			// plugins may change/add the parent/element
    			parent = env.element.parentElement;
    			if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
    				parent.setAttribute('tabindex', '0');
    			}

    			if (!env.code) {
    				_.hooks.run('complete', env);
    				callback && callback.call(env.element);
    				return;
    			}

    			_.hooks.run('before-highlight', env);

    			if (!env.grammar) {
    				insertHighlightedCode(_.util.encode(env.code));
    				return;
    			}

    			if (async && _self.Worker) {
    				var worker = new Worker(_.filename);

    				worker.onmessage = function (evt) {
    					insertHighlightedCode(evt.data);
    				};

    				worker.postMessage(JSON.stringify({
    					language: env.language,
    					code: env.code,
    					immediateClose: true
    				}));
    			} else {
    				insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
    			}
    		},

    		/**
    		 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
    		 * and the language definitions to use, and returns a string with the HTML produced.
    		 *
    		 * The following hooks will be run:
    		 * 1. `before-tokenize`
    		 * 2. `after-tokenize`
    		 * 3. `wrap`: On each {@link Token}.
    		 *
    		 * @param {string} text A string with the code to be highlighted.
    		 * @param {Grammar} grammar An object containing the tokens to use.
    		 *
    		 * Usually a language definition like `Prism.languages.markup`.
    		 * @param {string} language The name of the language definition passed to `grammar`.
    		 * @returns {string} The highlighted HTML.
    		 * @memberof Prism
    		 * @public
    		 * @example
    		 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
    		 */
    		highlight: function (text, grammar, language) {
    			var env = {
    				code: text,
    				grammar: grammar,
    				language: language
    			};
    			_.hooks.run('before-tokenize', env);
    			if (!env.grammar) {
    				throw new Error('The language "' + env.language + '" has no grammar.');
    			}
    			env.tokens = _.tokenize(env.code, env.grammar);
    			_.hooks.run('after-tokenize', env);
    			return Token.stringify(_.util.encode(env.tokens), env.language);
    		},

    		/**
    		 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
    		 * and the language definitions to use, and returns an array with the tokenized code.
    		 *
    		 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
    		 *
    		 * This method could be useful in other contexts as well, as a very crude parser.
    		 *
    		 * @param {string} text A string with the code to be highlighted.
    		 * @param {Grammar} grammar An object containing the tokens to use.
    		 *
    		 * Usually a language definition like `Prism.languages.markup`.
    		 * @returns {TokenStream} An array of strings and tokens, a token stream.
    		 * @memberof Prism
    		 * @public
    		 * @example
    		 * let code = `var foo = 0;`;
    		 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
    		 * tokens.forEach(token => {
    		 *     if (token instanceof Prism.Token && token.type === 'number') {
    		 *         console.log(`Found numeric literal: ${token.content}`);
    		 *     }
    		 * });
    		 */
    		tokenize: function (text, grammar) {
    			var rest = grammar.rest;
    			if (rest) {
    				for (var token in rest) {
    					grammar[token] = rest[token];
    				}

    				delete grammar.rest;
    			}

    			var tokenList = new LinkedList();
    			addAfter(tokenList, tokenList.head, text);

    			matchGrammar(text, tokenList, grammar, tokenList.head, 0);

    			return toArray(tokenList);
    		},

    		/**
    		 * @namespace
    		 * @memberof Prism
    		 * @public
    		 */
    		hooks: {
    			all: {},

    			/**
    			 * Adds the given callback to the list of callbacks for the given hook.
    			 *
    			 * The callback will be invoked when the hook it is registered for is run.
    			 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
    			 *
    			 * One callback function can be registered to multiple hooks and the same hook multiple times.
    			 *
    			 * @param {string} name The name of the hook.
    			 * @param {HookCallback} callback The callback function which is given environment variables.
    			 * @public
    			 */
    			add: function (name, callback) {
    				var hooks = _.hooks.all;

    				hooks[name] = hooks[name] || [];

    				hooks[name].push(callback);
    			},

    			/**
    			 * Runs a hook invoking all registered callbacks with the given environment variables.
    			 *
    			 * Callbacks will be invoked synchronously and in the order in which they were registered.
    			 *
    			 * @param {string} name The name of the hook.
    			 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
    			 * @public
    			 */
    			run: function (name, env) {
    				var callbacks = _.hooks.all[name];

    				if (!callbacks || !callbacks.length) {
    					return;
    				}

    				for (var i = 0, callback; (callback = callbacks[i++]);) {
    					callback(env);
    				}
    			}
    		},

    		Token: Token
    	};
    	_self.Prism = _;


    	// Typescript note:
    	// The following can be used to import the Token type in JSDoc:
    	//
    	//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

    	/**
    	 * Creates a new token.
    	 *
    	 * @param {string} type See {@link Token#type type}
    	 * @param {string | TokenStream} content See {@link Token#content content}
    	 * @param {string|string[]} [alias] The alias(es) of the token.
    	 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
    	 * @class
    	 * @global
    	 * @public
    	 */
    	function Token(type, content, alias, matchedStr) {
    		/**
    		 * The type of the token.
    		 *
    		 * This is usually the key of a pattern in a {@link Grammar}.
    		 *
    		 * @type {string}
    		 * @see GrammarToken
    		 * @public
    		 */
    		this.type = type;
    		/**
    		 * The strings or tokens contained by this token.
    		 *
    		 * This will be a token stream if the pattern matched also defined an `inside` grammar.
    		 *
    		 * @type {string | TokenStream}
    		 * @public
    		 */
    		this.content = content;
    		/**
    		 * The alias(es) of the token.
    		 *
    		 * @type {string|string[]}
    		 * @see GrammarToken
    		 * @public
    		 */
    		this.alias = alias;
    		// Copy of the full string this token was created from
    		this.length = (matchedStr || '').length | 0;
    	}

    	/**
    	 * A token stream is an array of strings and {@link Token Token} objects.
    	 *
    	 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
    	 * them.
    	 *
    	 * 1. No adjacent strings.
    	 * 2. No empty strings.
    	 *
    	 *    The only exception here is the token stream that only contains the empty string and nothing else.
    	 *
    	 * @typedef {Array<string | Token>} TokenStream
    	 * @global
    	 * @public
    	 */

    	/**
    	 * Converts the given token or token stream to an HTML representation.
    	 *
    	 * The following hooks will be run:
    	 * 1. `wrap`: On each {@link Token}.
    	 *
    	 * @param {string | Token | TokenStream} o The token or token stream to be converted.
    	 * @param {string} language The name of current language.
    	 * @returns {string} The HTML representation of the token or token stream.
    	 * @memberof Token
    	 * @static
    	 */
    	Token.stringify = function stringify(o, language) {
    		if (typeof o == 'string') {
    			return o;
    		}
    		if (Array.isArray(o)) {
    			var s = '';
    			o.forEach(function (e) {
    				s += stringify(e, language);
    			});
    			return s;
    		}

    		var env = {
    			type: o.type,
    			content: stringify(o.content, language),
    			tag: 'span',
    			classes: ['token', o.type],
    			attributes: {},
    			language: language
    		};

    		var aliases = o.alias;
    		if (aliases) {
    			if (Array.isArray(aliases)) {
    				Array.prototype.push.apply(env.classes, aliases);
    			} else {
    				env.classes.push(aliases);
    			}
    		}

    		_.hooks.run('wrap', env);

    		var attributes = '';
    		for (var name in env.attributes) {
    			attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
    		}

    		return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
    	};

    	/**
    	 * @param {RegExp} pattern
    	 * @param {number} pos
    	 * @param {string} text
    	 * @param {boolean} lookbehind
    	 * @returns {RegExpExecArray | null}
    	 */
    	function matchPattern(pattern, pos, text, lookbehind) {
    		pattern.lastIndex = pos;
    		var match = pattern.exec(text);
    		if (match && lookbehind && match[1]) {
    			// change the match to remove the text matched by the Prism lookbehind group
    			var lookbehindLength = match[1].length;
    			match.index += lookbehindLength;
    			match[0] = match[0].slice(lookbehindLength);
    		}
    		return match;
    	}

    	/**
    	 * @param {string} text
    	 * @param {LinkedList<string | Token>} tokenList
    	 * @param {any} grammar
    	 * @param {LinkedListNode<string | Token>} startNode
    	 * @param {number} startPos
    	 * @param {RematchOptions} [rematch]
    	 * @returns {void}
    	 * @private
    	 *
    	 * @typedef RematchOptions
    	 * @property {string} cause
    	 * @property {number} reach
    	 */
    	function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
    		for (var token in grammar) {
    			if (!grammar.hasOwnProperty(token) || !grammar[token]) {
    				continue;
    			}

    			var patterns = grammar[token];
    			patterns = Array.isArray(patterns) ? patterns : [patterns];

    			for (var j = 0; j < patterns.length; ++j) {
    				if (rematch && rematch.cause == token + ',' + j) {
    					return;
    				}

    				var patternObj = patterns[j];
    				var inside = patternObj.inside;
    				var lookbehind = !!patternObj.lookbehind;
    				var greedy = !!patternObj.greedy;
    				var alias = patternObj.alias;

    				if (greedy && !patternObj.pattern.global) {
    					// Without the global flag, lastIndex won't work
    					var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
    					patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
    				}

    				/** @type {RegExp} */
    				var pattern = patternObj.pattern || patternObj;

    				for ( // iterate the token list and keep track of the current token/string position
    					var currentNode = startNode.next, pos = startPos;
    					currentNode !== tokenList.tail;
    					pos += currentNode.value.length, currentNode = currentNode.next
    				) {

    					if (rematch && pos >= rematch.reach) {
    						break;
    					}

    					var str = currentNode.value;

    					if (tokenList.length > text.length) {
    						// Something went terribly wrong, ABORT, ABORT!
    						return;
    					}

    					if (str instanceof Token) {
    						continue;
    					}

    					var removeCount = 1; // this is the to parameter of removeBetween
    					var match;

    					if (greedy) {
    						match = matchPattern(pattern, pos, text, lookbehind);
    						if (!match || match.index >= text.length) {
    							break;
    						}

    						var from = match.index;
    						var to = match.index + match[0].length;
    						var p = pos;

    						// find the node that contains the match
    						p += currentNode.value.length;
    						while (from >= p) {
    							currentNode = currentNode.next;
    							p += currentNode.value.length;
    						}
    						// adjust pos (and p)
    						p -= currentNode.value.length;
    						pos = p;

    						// the current node is a Token, then the match starts inside another Token, which is invalid
    						if (currentNode.value instanceof Token) {
    							continue;
    						}

    						// find the last node which is affected by this match
    						for (
    							var k = currentNode;
    							k !== tokenList.tail && (p < to || typeof k.value === 'string');
    							k = k.next
    						) {
    							removeCount++;
    							p += k.value.length;
    						}
    						removeCount--;

    						// replace with the new match
    						str = text.slice(pos, p);
    						match.index -= pos;
    					} else {
    						match = matchPattern(pattern, 0, str, lookbehind);
    						if (!match) {
    							continue;
    						}
    					}

    					// eslint-disable-next-line no-redeclare
    					var from = match.index;
    					var matchStr = match[0];
    					var before = str.slice(0, from);
    					var after = str.slice(from + matchStr.length);

    					var reach = pos + str.length;
    					if (rematch && reach > rematch.reach) {
    						rematch.reach = reach;
    					}

    					var removeFrom = currentNode.prev;

    					if (before) {
    						removeFrom = addAfter(tokenList, removeFrom, before);
    						pos += before.length;
    					}

    					removeRange(tokenList, removeFrom, removeCount);

    					var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
    					currentNode = addAfter(tokenList, removeFrom, wrapped);

    					if (after) {
    						addAfter(tokenList, currentNode, after);
    					}

    					if (removeCount > 1) {
    						// at least one Token object was removed, so we have to do some rematching
    						// this can only happen if the current pattern is greedy

    						/** @type {RematchOptions} */
    						var nestedRematch = {
    							cause: token + ',' + j,
    							reach: reach
    						};
    						matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

    						// the reach might have been extended because of the rematching
    						if (rematch && nestedRematch.reach > rematch.reach) {
    							rematch.reach = nestedRematch.reach;
    						}
    					}
    				}
    			}
    		}
    	}

    	/**
    	 * @typedef LinkedListNode
    	 * @property {T} value
    	 * @property {LinkedListNode<T> | null} prev The previous node.
    	 * @property {LinkedListNode<T> | null} next The next node.
    	 * @template T
    	 * @private
    	 */

    	/**
    	 * @template T
    	 * @private
    	 */
    	function LinkedList() {
    		/** @type {LinkedListNode<T>} */
    		var head = { value: null, prev: null, next: null };
    		/** @type {LinkedListNode<T>} */
    		var tail = { value: null, prev: head, next: null };
    		head.next = tail;

    		/** @type {LinkedListNode<T>} */
    		this.head = head;
    		/** @type {LinkedListNode<T>} */
    		this.tail = tail;
    		this.length = 0;
    	}

    	/**
    	 * Adds a new node with the given value to the list.
    	 *
    	 * @param {LinkedList<T>} list
    	 * @param {LinkedListNode<T>} node
    	 * @param {T} value
    	 * @returns {LinkedListNode<T>} The added node.
    	 * @template T
    	 */
    	function addAfter(list, node, value) {
    		// assumes that node != list.tail && values.length >= 0
    		var next = node.next;

    		var newNode = { value: value, prev: node, next: next };
    		node.next = newNode;
    		next.prev = newNode;
    		list.length++;

    		return newNode;
    	}
    	/**
    	 * Removes `count` nodes after the given node. The given node will not be removed.
    	 *
    	 * @param {LinkedList<T>} list
    	 * @param {LinkedListNode<T>} node
    	 * @param {number} count
    	 * @template T
    	 */
    	function removeRange(list, node, count) {
    		var next = node.next;
    		for (var i = 0; i < count && next !== list.tail; i++) {
    			next = next.next;
    		}
    		node.next = next;
    		next.prev = node;
    		list.length -= i;
    	}
    	/**
    	 * @param {LinkedList<T>} list
    	 * @returns {T[]}
    	 * @template T
    	 */
    	function toArray(list) {
    		var array = [];
    		var node = list.head.next;
    		while (node !== list.tail) {
    			array.push(node.value);
    			node = node.next;
    		}
    		return array;
    	}


    	if (!_self.document) {
    		if (!_self.addEventListener) {
    			// in Node.js
    			return _;
    		}

    		if (!_.disableWorkerMessageHandler) {
    			// In worker
    			_self.addEventListener('message', function (evt) {
    				var message = JSON.parse(evt.data);
    				var lang = message.language;
    				var code = message.code;
    				var immediateClose = message.immediateClose;

    				_self.postMessage(_.highlight(code, _.languages[lang], lang));
    				if (immediateClose) {
    					_self.close();
    				}
    			}, false);
    		}

    		return _;
    	}

    	// Get current script and highlight
    	var script = _.util.currentScript();

    	if (script) {
    		_.filename = script.src;

    		if (script.hasAttribute('data-manual')) {
    			_.manual = true;
    		}
    	}

    	function highlightAutomaticallyCallback() {
    		if (!_.manual) {
    			_.highlightAll();
    		}
    	}

    	if (!_.manual) {
    		// If the document state is "loading", then we'll use DOMContentLoaded.
    		// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
    		// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
    		// might take longer one animation frame to execute which can create a race condition where only some plugins have
    		// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
    		// See https://github.com/PrismJS/prism/issues/2102
    		var readyState = document.readyState;
    		if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
    			document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
    		} else {
    			if (window.requestAnimationFrame) {
    				window.requestAnimationFrame(highlightAutomaticallyCallback);
    			} else {
    				window.setTimeout(highlightAutomaticallyCallback, 16);
    			}
    		}
    	}

    	return _;

    }(_self));

    if (module.exports) {
    	module.exports = Prism;
    }

    // hack for components to work correctly in node.js
    if (typeof commonjsGlobal !== 'undefined') {
    	commonjsGlobal.Prism = Prism;
    }

    // some additional documentation/types

    /**
     * The expansion of a simple `RegExp` literal to support additional properties.
     *
     * @typedef GrammarToken
     * @property {RegExp} pattern The regular expression of the token.
     * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
     * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
     * @property {boolean} [greedy=false] Whether the token is greedy.
     * @property {string|string[]} [alias] An optional alias or list of aliases.
     * @property {Grammar} [inside] The nested grammar of this token.
     *
     * The `inside` grammar will be used to tokenize the text value of each token of this kind.
     *
     * This can be used to make nested and even recursive language definitions.
     *
     * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
     * each another.
     * @global
     * @public
     */

    /**
     * @typedef Grammar
     * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
     * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
     * @global
     * @public
     */

    /**
     * A function which will invoked after an element was successfully highlighted.
     *
     * @callback HighlightCallback
     * @param {Element} element The element successfully highlighted.
     * @returns {void}
     * @global
     * @public
     */

    /**
     * @callback HookCallback
     * @param {Object<string, any>} env The environment variables of the hook.
     * @returns {void}
     * @global
     * @public
     */
    });

    Prism.languages.markup = {
    	'comment': {
    		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
    		greedy: true
    	},
    	'prolog': {
    		pattern: /<\?[\s\S]+?\?>/,
    		greedy: true
    	},
    	'doctype': {
    		// https://www.w3.org/TR/xml/#NT-doctypedecl
    		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    		greedy: true,
    		inside: {
    			'internal-subset': {
    				pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
    				lookbehind: true,
    				greedy: true,
    				inside: null // see below
    			},
    			'string': {
    				pattern: /"[^"]*"|'[^']*'/,
    				greedy: true
    			},
    			'punctuation': /^<!|>$|[[\]]/,
    			'doctype-tag': /^DOCTYPE/i,
    			'name': /[^\s<>'"]+/
    		}
    	},
    	'cdata': {
    		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    		greedy: true
    	},
    	'tag': {
    		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
    		greedy: true,
    		inside: {
    			'tag': {
    				pattern: /^<\/?[^\s>\/]+/,
    				inside: {
    					'punctuation': /^<\/?/,
    					'namespace': /^[^\s>\/:]+:/
    				}
    			},
    			'special-attr': [],
    			'attr-value': {
    				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
    				inside: {
    					'punctuation': [
    						{
    							pattern: /^=/,
    							alias: 'attr-equals'
    						},
    						{
    							pattern: /^(\s*)["']|["']$/,
    							lookbehind: true
    						}
    					]
    				}
    			},
    			'punctuation': /\/?>/,
    			'attr-name': {
    				pattern: /[^\s>\/]+/,
    				inside: {
    					'namespace': /^[^\s>\/:]+:/
    				}
    			}

    		}
    	},
    	'entity': [
    		{
    			pattern: /&[\da-z]{1,8};/i,
    			alias: 'named-entity'
    		},
    		/&#x?[\da-f]{1,8};/i
    	]
    };

    Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
    	Prism.languages.markup['entity'];
    Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

    // Plugin to make entity title show the real entity, idea by Roman Komarov
    Prism.hooks.add('wrap', function (env) {

    	if (env.type === 'entity') {
    		env.attributes['title'] = env.content.replace(/&amp;/, '&');
    	}
    });

    Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
    	/**
    	 * Adds an inlined language to markup.
    	 *
    	 * An example of an inlined language is CSS with `<style>` tags.
    	 *
    	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
    	 * case insensitive.
    	 * @param {string} lang The language key.
    	 * @example
    	 * addInlined('style', 'css');
    	 */
    	value: function addInlined(tagName, lang) {
    		var includedCdataInside = {};
    		includedCdataInside['language-' + lang] = {
    			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
    			lookbehind: true,
    			inside: Prism.languages[lang]
    		};
    		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

    		var inside = {
    			'included-cdata': {
    				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    				inside: includedCdataInside
    			}
    		};
    		inside['language-' + lang] = {
    			pattern: /[\s\S]+/,
    			inside: Prism.languages[lang]
    		};

    		var def = {};
    		def[tagName] = {
    			pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
    			lookbehind: true,
    			greedy: true,
    			inside: inside
    		};

    		Prism.languages.insertBefore('markup', 'cdata', def);
    	}
    });
    Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
    	/**
    	 * Adds an pattern to highlight languages embedded in HTML attributes.
    	 *
    	 * An example of an inlined language is CSS with `style` attributes.
    	 *
    	 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
    	 * case insensitive.
    	 * @param {string} lang The language key.
    	 * @example
    	 * addAttribute('style', 'css');
    	 */
    	value: function (attrName, lang) {
    		Prism.languages.markup.tag.inside['special-attr'].push({
    			pattern: RegExp(
    				/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
    				'i'
    			),
    			lookbehind: true,
    			inside: {
    				'attr-name': /^[^\s=]+/,
    				'attr-value': {
    					pattern: /=[\s\S]+/,
    					inside: {
    						'value': {
    							pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
    							lookbehind: true,
    							alias: [lang, 'language-' + lang],
    							inside: Prism.languages[lang]
    						},
    						'punctuation': [
    							{
    								pattern: /^=/,
    								alias: 'attr-equals'
    							},
    							/"|'/
    						]
    					}
    				}
    			}
    		});
    	}
    });

    Prism.languages.html = Prism.languages.markup;
    Prism.languages.mathml = Prism.languages.markup;
    Prism.languages.svg = Prism.languages.markup;

    Prism.languages.xml = Prism.languages.extend('markup', {});
    Prism.languages.ssml = Prism.languages.xml;
    Prism.languages.atom = Prism.languages.xml;
    Prism.languages.rss = Prism.languages.xml;

    var dependencies = createCommonjsModule(function (module) {

    /**
     * @typedef {Object<string, ComponentCategory>} Components
     * @typedef {Object<string, ComponentEntry | string>} ComponentCategory
     *
     * @typedef ComponentEntry
     * @property {string} [title] The title of the component.
     * @property {string} [owner] The GitHub user name of the owner.
     * @property {boolean} [noCSS=false] Whether the component doesn't have style sheets which should also be loaded.
     * @property {string | string[]} [alias] An optional list of aliases for the id of the component.
     * @property {Object<string, string>} [aliasTitles] An optional map from an alias to its title.
     *
     * Aliases which are not in this map will the get title of the component.
     * @property {string | string[]} [optional]
     * @property {string | string[]} [require]
     * @property {string | string[]} [modify]
     */

    var getLoader = (function () {

    	/**
    	 * A function which does absolutely nothing.
    	 *
    	 * @type {any}
    	 */
    	var noop = function () { };

    	/**
    	 * Invokes the given callback for all elements of the given value.
    	 *
    	 * If the given value is an array, the callback will be invokes for all elements. If the given value is `null` or
    	 * `undefined`, the callback will not be invoked. In all other cases, the callback will be invoked with the given
    	 * value as parameter.
    	 *
    	 * @param {null | undefined | T | T[]} value
    	 * @param {(value: T, index: number) => void} callbackFn
    	 * @returns {void}
    	 * @template T
    	 */
    	function forEach(value, callbackFn) {
    		if (Array.isArray(value)) {
    			value.forEach(callbackFn);
    		} else if (value != null) {
    			callbackFn(value, 0);
    		}
    	}

    	/**
    	 * Returns a new set for the given string array.
    	 *
    	 * @param {string[]} array
    	 * @returns {StringSet}
    	 *
    	 * @typedef {Object<string, true>} StringSet
    	 */
    	function toSet(array) {
    		/** @type {StringSet} */
    		var set = {};
    		for (var i = 0, l = array.length; i < l; i++) {
    			set[array[i]] = true;
    		}
    		return set;
    	}

    	/**
    	 * Creates a map of every components id to its entry.
    	 *
    	 * @param {Components} components
    	 * @returns {EntryMap}
    	 *
    	 * @typedef {{ readonly [id: string]: Readonly<ComponentEntry> | undefined }} EntryMap
    	 */
    	function createEntryMap(components) {
    		/** @type {Object<string, Readonly<ComponentEntry>>} */
    		var map = {};

    		for (var categoryName in components) {
    			var category = components[categoryName];
    			for (var id in category) {
    				if (id != 'meta') {
    					/** @type {ComponentEntry | string} */
    					var entry = category[id];
    					map[id] = typeof entry == 'string' ? { title: entry } : entry;
    				}
    			}
    		}

    		return map;
    	}

    	/**
    	 * Creates a full dependencies map which includes all types of dependencies and their transitive dependencies.
    	 *
    	 * @param {EntryMap} entryMap
    	 * @returns {DependencyResolver}
    	 *
    	 * @typedef {(id: string) => StringSet} DependencyResolver
    	 */
    	function createDependencyResolver(entryMap) {
    		/** @type {Object<string, StringSet>} */
    		var map = {};
    		var _stackArray = [];

    		/**
    		 * Adds the dependencies of the given component to the dependency map.
    		 *
    		 * @param {string} id
    		 * @param {string[]} stack
    		 */
    		function addToMap(id, stack) {
    			if (id in map) {
    				return;
    			}

    			stack.push(id);

    			// check for circular dependencies
    			var firstIndex = stack.indexOf(id);
    			if (firstIndex < stack.length - 1) {
    				throw new Error('Circular dependency: ' + stack.slice(firstIndex).join(' -> '));
    			}

    			/** @type {StringSet} */
    			var dependencies = {};

    			var entry = entryMap[id];
    			if (entry) {
    				/**
    				 * This will add the direct dependency and all of its transitive dependencies to the set of
    				 * dependencies of `entry`.
    				 *
    				 * @param {string} depId
    				 * @returns {void}
    				 */
    				function handleDirectDependency(depId) {
    					if (!(depId in entryMap)) {
    						throw new Error(id + ' depends on an unknown component ' + depId);
    					}
    					if (depId in dependencies) {
    						// if the given dependency is already in the set of deps, then so are its transitive deps
    						return;
    					}

    					addToMap(depId, stack);
    					dependencies[depId] = true;
    					for (var transitiveDepId in map[depId]) {
    						dependencies[transitiveDepId] = true;
    					}
    				}

    				forEach(entry.require, handleDirectDependency);
    				forEach(entry.optional, handleDirectDependency);
    				forEach(entry.modify, handleDirectDependency);
    			}

    			map[id] = dependencies;

    			stack.pop();
    		}

    		return function (id) {
    			var deps = map[id];
    			if (!deps) {
    				addToMap(id, _stackArray);
    				deps = map[id];
    			}
    			return deps;
    		};
    	}

    	/**
    	 * Returns a function which resolves the aliases of its given id of alias.
    	 *
    	 * @param {EntryMap} entryMap
    	 * @returns {(idOrAlias: string) => string}
    	 */
    	function createAliasResolver(entryMap) {
    		/** @type {Object<string, string> | undefined} */
    		var map;

    		return function (idOrAlias) {
    			if (idOrAlias in entryMap) {
    				return idOrAlias;
    			} else {
    				// only create the alias map if necessary
    				if (!map) {
    					map = {};

    					for (var id in entryMap) {
    						var entry = entryMap[id];
    						forEach(entry && entry.alias, function (alias) {
    							if (alias in map) {
    								throw new Error(alias + ' cannot be alias for both ' + id + ' and ' + map[alias]);
    							}
    							if (alias in entryMap) {
    								throw new Error(alias + ' cannot be alias of ' + id + ' because it is a component.');
    							}
    							map[alias] = id;
    						});
    					}
    				}
    				return map[idOrAlias] || idOrAlias;
    			}
    		};
    	}

    	/**
    	 * @typedef LoadChainer
    	 * @property {(before: T, after: () => T) => T} series
    	 * @property {(values: T[]) => T} parallel
    	 * @template T
    	 */

    	/**
    	 * Creates an implicit DAG from the given components and dependencies and call the given `loadComponent` for each
    	 * component in topological order.
    	 *
    	 * @param {DependencyResolver} dependencyResolver
    	 * @param {StringSet} ids
    	 * @param {(id: string) => T} loadComponent
    	 * @param {LoadChainer<T>} [chainer]
    	 * @returns {T}
    	 * @template T
    	 */
    	function loadComponentsInOrder(dependencyResolver, ids, loadComponent, chainer) {
    		var series = chainer ? chainer.series : undefined;
    		var parallel = chainer ? chainer.parallel : noop;

    		/** @type {Object<string, T>} */
    		var cache = {};

    		/**
    		 * A set of ids of nodes which are not depended upon by any other node in the graph.
    		 *
    		 * @type {StringSet}
    		 */
    		var ends = {};

    		/**
    		 * Loads the given component and its dependencies or returns the cached value.
    		 *
    		 * @param {string} id
    		 * @returns {T}
    		 */
    		function handleId(id) {
    			if (id in cache) {
    				return cache[id];
    			}

    			// assume that it's an end
    			// if it isn't, it will be removed later
    			ends[id] = true;

    			// all dependencies of the component in the given ids
    			var dependsOn = [];
    			for (var depId in dependencyResolver(id)) {
    				if (depId in ids) {
    					dependsOn.push(depId);
    				}
    			}

    			/**
    			 * The value to be returned.
    			 *
    			 * @type {T}
    			 */
    			var value;

    			if (dependsOn.length === 0) {
    				value = loadComponent(id);
    			} else {
    				var depsValue = parallel(dependsOn.map(function (depId) {
    					var value = handleId(depId);
    					// none of the dependencies can be ends
    					delete ends[depId];
    					return value;
    				}));
    				if (series) {
    					// the chainer will be responsibly for calling the function calling loadComponent
    					value = series(depsValue, function () { return loadComponent(id); });
    				} else {
    					// we don't have a chainer, so we call loadComponent ourselves
    					loadComponent(id);
    				}
    			}

    			// cache and return
    			return cache[id] = value;
    		}

    		for (var id in ids) {
    			handleId(id);
    		}

    		/** @type {T[]} */
    		var endValues = [];
    		for (var endId in ends) {
    			endValues.push(cache[endId]);
    		}
    		return parallel(endValues);
    	}

    	/**
    	 * Returns whether the given object has any keys.
    	 *
    	 * @param {object} obj
    	 */
    	function hasKeys(obj) {
    		for (var key in obj) {
    			return true;
    		}
    		return false;
    	}

    	/**
    	 * Returns an object which provides methods to get the ids of the components which have to be loaded (`getIds`) and
    	 * a way to efficiently load them in synchronously and asynchronous contexts (`load`).
    	 *
    	 * The set of ids to be loaded is a superset of `load`. If some of these ids are in `loaded`, the corresponding
    	 * components will have to reloaded.
    	 *
    	 * The ids in `load` and `loaded` may be in any order and can contain duplicates.
    	 *
    	 * @param {Components} components
    	 * @param {string[]} load
    	 * @param {string[]} [loaded=[]] A list of already loaded components.
    	 *
    	 * If a component is in this list, then all of its requirements will also be assumed to be in the list.
    	 * @returns {Loader}
    	 *
    	 * @typedef Loader
    	 * @property {() => string[]} getIds A function to get all ids of the components to load.
    	 *
    	 * The returned ids will be duplicate-free, alias-free and in load order.
    	 * @property {LoadFunction} load A functional interface to load components.
    	 *
    	 * @typedef {<T> (loadComponent: (id: string) => T, chainer?: LoadChainer<T>) => T} LoadFunction
    	 * A functional interface to load components.
    	 *
    	 * The `loadComponent` function will be called for every component in the order in which they have to be loaded.
    	 *
    	 * The `chainer` is useful for asynchronous loading and its `series` and `parallel` functions can be thought of as
    	 * `Promise#then` and `Promise.all`.
    	 *
    	 * @example
    	 * load(id => { loadComponent(id); }); // returns undefined
    	 *
    	 * await load(
    	 *     id => loadComponentAsync(id), // returns a Promise for each id
    	 *     {
    	 *         series: async (before, after) => {
    	 *             await before;
    	 *             await after();
    	 *         },
    	 *         parallel: async (values) => {
    	 *             await Promise.all(values);
    	 *         }
    	 *     }
    	 * );
    	 */
    	function getLoader(components, load, loaded) {
    		var entryMap = createEntryMap(components);
    		var resolveAlias = createAliasResolver(entryMap);

    		load = load.map(resolveAlias);
    		loaded = (loaded || []).map(resolveAlias);

    		var loadSet = toSet(load);
    		var loadedSet = toSet(loaded);

    		// add requirements

    		load.forEach(addRequirements);
    		function addRequirements(id) {
    			var entry = entryMap[id];
    			forEach(entry && entry.require, function (reqId) {
    				if (!(reqId in loadedSet)) {
    					loadSet[reqId] = true;
    					addRequirements(reqId);
    				}
    			});
    		}

    		// add components to reload

    		// A component x in `loaded` has to be reloaded if
    		//  1) a component in `load` modifies x.
    		//  2) x depends on a component in `load`.
    		// The above two condition have to be applied until nothing changes anymore.

    		var dependencyResolver = createDependencyResolver(entryMap);

    		/** @type {StringSet} */
    		var loadAdditions = loadSet;
    		/** @type {StringSet} */
    		var newIds;
    		while (hasKeys(loadAdditions)) {
    			newIds = {};

    			// condition 1)
    			for (var loadId in loadAdditions) {
    				var entry = entryMap[loadId];
    				forEach(entry && entry.modify, function (modId) {
    					if (modId in loadedSet) {
    						newIds[modId] = true;
    					}
    				});
    			}

    			// condition 2)
    			for (var loadedId in loadedSet) {
    				if (!(loadedId in loadSet)) {
    					for (var depId in dependencyResolver(loadedId)) {
    						if (depId in loadSet) {
    							newIds[loadedId] = true;
    							break;
    						}
    					}
    				}
    			}

    			loadAdditions = newIds;
    			for (var newId in loadAdditions) {
    				loadSet[newId] = true;
    			}
    		}

    		/** @type {Loader} */
    		var loader = {
    			getIds: function () {
    				var ids = [];
    				loader.load(function (id) {
    					ids.push(id);
    				});
    				return ids;
    			},
    			load: function (loadComponent, chainer) {
    				return loadComponentsInOrder(dependencyResolver, loadSet, loadComponent, chainer);
    			}
    		};

    		return loader;
    	}

    	return getLoader;

    }());

    {
    	module.exports = getLoader;
    }
    });

    const components = {"languages":{"markup":{"alias":["html","xml","svg","mathml","ssml","atom","rss"]},"css":{},"clike":{},"javascript":{"alias":"js","require":"clike"},"abap":{},"abnf":{},"actionscript":{"require":"javascript"},"ada":{},"agda":{},"al":{},"antlr4":{"alias":"g4"},"apacheconf":{},"apex":{"require":["clike","sql"]},"apl":{},"applescript":{},"aql":{},"arduino":{"require":"cpp"},"arff":{},"asciidoc":{"alias":"adoc"},"aspnet":{"require":["markup","csharp"]},"asm6502":{},"autohotkey":{},"autoit":{},"bash":{"alias":"shell"},"basic":{},"batch":{},"bbcode":{"alias":"shortcode"},"birb":{"require":"clike"},"bison":{"require":"c"},"bnf":{"alias":"rbnf"},"brainfuck":{},"brightscript":{},"bro":{},"bsl":{"alias":"oscript"},"c":{"require":"clike"},"csharp":{"alias":["cs","dotnet"],"require":"clike"},"cpp":{"require":"c"},"cil":{},"clojure":{},"cmake":{},"coffeescript":{"alias":"coffee","require":"javascript"},"concurnas":{"alias":"conc"},"csp":{},"crystal":{"require":"ruby"},"css-extras":{"require":"css"},"cypher":{},"d":{"require":"clike"},"dart":{"require":"clike"},"dataweave":{},"dax":{},"dhall":{},"diff":{},"django":{"alias":"jinja2","require":"markup-templating"},"dns-zone-file":{"alias":"dns-zone"},"docker":{"alias":"dockerfile"},"ebnf":{},"editorconfig":{},"eiffel":{},"ejs":{"alias":"eta","require":["javascript","markup-templating"]},"elixir":{},"elm":{},"etlua":{"require":["lua","markup-templating"]},"erb":{"require":["ruby","markup-templating"]},"erlang":{},"excel-formula":{"alias":["xlsx","xls"]},"fsharp":{"require":"clike"},"factor":{},"firestore-security-rules":{"require":"clike"},"flow":{"require":"javascript"},"fortran":{},"ftl":{"require":"markup-templating"},"gml":{"alias":"gamemakerlanguage","require":"clike"},"gcode":{},"gdscript":{},"gedcom":{},"gherkin":{},"git":{},"glsl":{"require":"c"},"go":{"require":"clike"},"graphql":{},"groovy":{"require":"clike"},"haml":{"require":"ruby"},"handlebars":{"require":"markup-templating"},"haskell":{"alias":"hs"},"haxe":{"require":"clike"},"hcl":{},"hlsl":{"require":"c"},"http":{},"hpkp":{},"hsts":{},"ichigojam":{},"icon":{},"ignore":{"alias":["gitignore","hgignore","npmignore"]},"inform7":{},"ini":{},"io":{},"j":{},"java":{"require":"clike"},"javadoc":{"require":["markup","java","javadoclike"]},"javadoclike":{},"javastacktrace":{},"jolie":{"require":"clike"},"jq":{},"jsdoc":{"require":["javascript","javadoclike","typescript"]},"js-extras":{"require":"javascript"},"json":{"alias":"webmanifest"},"json5":{"require":"json"},"jsonp":{"require":"json"},"jsstacktrace":{},"js-templates":{"require":"javascript"},"julia":{},"keyman":{},"kotlin":{"alias":["kt","kts"],"require":"clike"},"latex":{"alias":["tex","context"]},"latte":{"require":["clike","markup-templating","php"]},"less":{"require":"css"},"lilypond":{"alias":"ly","require":"scheme"},"liquid":{},"lisp":{"alias":["emacs","elisp","emacs-lisp"]},"livescript":{},"llvm":{},"lolcode":{},"lua":{},"makefile":{},"markdown":{"alias":"md","require":"markup"},"markup-templating":{"require":"markup"},"matlab":{},"mel":{},"mizar":{},"mongodb":{"require":"javascript"},"monkey":{},"moonscript":{"alias":"moon"},"n1ql":{},"n4js":{"alias":"n4jsd","require":"javascript"},"nand2tetris-hdl":{},"naniscript":{"alias":"nani"},"nasm":{},"neon":{},"nginx":{"require":"clike"},"nim":{},"nix":{},"nsis":{},"objectivec":{"alias":"objc","require":"c"},"ocaml":{},"opencl":{"require":"c"},"oz":{},"parigp":{},"parser":{"require":"markup"},"pascal":{"alias":"objectpascal"},"pascaligo":{},"pcaxis":{"alias":"px"},"peoplecode":{"alias":"pcode"},"perl":{},"php":{"require":"markup-templating"},"phpdoc":{"require":["php","javadoclike"]},"php-extras":{"require":"php"},"plsql":{"require":"sql"},"powerquery":{"alias":["pq","mscript"]},"powershell":{},"processing":{"require":"clike"},"prolog":{},"promql":{},"properties":{},"protobuf":{"require":"clike"},"pug":{"require":["markup","javascript"]},"puppet":{},"pure":{},"purebasic":{"alias":"pbfasm","require":"clike"},"purescript":{"alias":"purs","require":"haskell"},"python":{"alias":"py"},"q":{},"qml":{"require":"javascript"},"qore":{"require":"clike"},"r":{},"racket":{"alias":"rkt","require":"scheme"},"jsx":{"require":["markup","javascript"]},"tsx":{"require":["jsx","typescript"]},"reason":{"require":"clike"},"regex":{},"renpy":{"alias":"rpy"},"rest":{},"rip":{},"roboconf":{},"robotframework":{"alias":"robot"},"ruby":{"alias":"rb","require":"clike"},"rust":{},"sas":{},"sass":{"require":"css"},"scss":{"require":"css"},"scala":{"require":"java"},"scheme":{},"shell-session":{"alias":["sh-session","shellsession"],"require":"bash"},"smali":{},"smalltalk":{},"smarty":{"require":"markup-templating"},"sml":{"alias":"smlnj"},"solidity":{"alias":"sol","require":"clike"},"solution-file":{"alias":"sln"},"soy":{"require":"markup-templating"},"sparql":{"alias":"rq","require":"turtle"},"splunk-spl":{},"sqf":{"require":"clike"},"sql":{},"stan":{},"iecst":{},"stylus":{},"swift":{"require":"clike"},"t4-templating":{},"t4-cs":{"alias":"t4","require":["t4-templating","csharp"]},"t4-vb":{"require":["t4-templating","vbnet"]},"tap":{"require":"yaml"},"tcl":{},"tt2":{"require":["clike","markup-templating"]},"textile":{"require":"markup"},"toml":{},"turtle":{"alias":"trig"},"twig":{"require":"markup"},"typescript":{"alias":"ts","require":"javascript"},"typoscript":{"alias":"tsconfig"},"unrealscript":{"alias":["uscript","uc"]},"vala":{"require":"clike"},"vbnet":{"require":"basic"},"velocity":{"require":"markup"},"verilog":{},"vhdl":{},"vim":{},"visual-basic":{"alias":["vb","vba"]},"warpscript":{},"wasm":{},"wiki":{"require":"markup"},"xeora":{"alias":"xeoracube","require":"markup"},"xml-doc":{"require":"markup"},"xojo":{},"xquery":{"require":"markup"},"yaml":{"alias":"yml"},"yang":{},"zig":{}}};

    // set prism to manual mode
    if (typeof window !== "undefined") {
      window.Prism = window.Prism || {};
      prismCore.manual = true;
    }

    const defaults = {
      root: null,
      rootMargin: "100px",
      threshold: 0,
      componentsUrl: "https://unpkg.com/prismjs@1.22.0/components",
      componentsUrls: {},
    };

    /**
     * Svelte action for lazy render code blocks with prism.js.
     *
     * @param {DOMELement} node
     * @param {object} params
     * @param {DOMElement} params.root = null
     * @param {string} params.rootMargin = "100px"
     * @param {number} params.threshold = 0
     * @param {string} params.componentsUrl = "https://unpkg.com/prismjs@1.22.0/components"
     */
    function prism(node, params) {
      //merge params with defaults
      const options = {
        ...defaults,
        ...params,
      };

      /**
       * Lazy loads prism.js language component and highlights target.
       * Classname needs to be set to 'language-[lang]' (eg. 'language-javascript')
       *
       * @param {DOMElement} target
       * @param {string} componentsUrl  URL to prism.js component folder.
       */
      const highlightCode = async function (target) {
        if (!target.dataset.isHighlighted) {
          const ids = getLanguagesFromClass(target);

          if (ids.length > 0) {
            try {
              await loadLanguageAsync(ids);
              prismCore.highlightElement(target);
              target.dataset.isHighlighted = true;
            } catch (error) {
              console.warn(error);
            }
          }
        }
      };

      /**
       * Returns prism.js language name from class name. (eg. 'language-javascript')
       * Also includes languages from inside markdown code.
       *
       * @param {DOMElement} item
       * @returns {[string]}  Returns language names.
       */
      function getLanguagesFromClass(item) {
        let languages = [];
        const matches = item.className.match(/[lang|language]-(\w+)/);
        const language = matches ? matches[1] : false; //eg. class="language-css" => css

        if (language) {
          languages.push(language);
        }

        if (language === "markdown") {
          //get languages used inside markdown code blocks
          let additional = item.innerHTML.match(/(```)(\w+)/gm);
          additional = additional
            ? additional.map((item) => item.replace("```", ""))
            : [];
          languages = [...languages, ...additional];
        }

        return languages;
      }

      /**
       * Async load prism.js language files.
       *
       * @param {[string]} language ids
       * @returns {Promise}
       */
      function loadLanguageAsync(ids) {
        const loader = dependencies(components, ids);
        const promise = loader.load(
          (id) => {
            if (!Object.keys(window.Prism.languages).includes(id)) {
              let url = "";
              if (Object.keys(options.componentsUrls).includes(id)) {
                url = options.componentsUrls[id];
              } else {
                url = `${options.componentsUrl}/prism-${id}.min.js`;
              }

              return import(/* @vite-ignore */ `${url}`).catch((error) => {
                console.warn(error);
              });
            }
          },
          {
            series: async (before, after) => {
              await before;
              await after();
            },
            parallel: async (values) => {
              await Promise.all(values);
            },
          }
        );

        return promise;
      }

      /**
       * Callback for IntersectionObserver.
       *
       * @param {Array.<Event>]} events
       */
      function onIntersect(events) {
        events.forEach((e) => {
          if (e.isIntersecting) {
            highlightCode(e.target);
          }
        });
      }

      //wait for onMount on parent
      let observer;

      tick().then(() => {
        //add observer to code blocks
        const codeblocks = node.querySelectorAll("code");
        observer = new IntersectionObserver(onIntersect, { ...options });

        [...codeblocks].forEach((codeblock) => {
          observer.observe(codeblock);
        });
      });

      return {
        destroy() {
          observer.disconnect();
        },
      };
    }

    /* src/components/Page.svelte generated by Svelte v3.56.0 */
    const file = "src/components/Page.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let t6;
    	let p1;
    	let a2;
    	let t8;
    	let h20;
    	let t10;
    	let code0;
    	let t12;
    	let p2;
    	let t13;
    	let code1;
    	let t15;
    	let code2;
    	let t17;
    	let t18;
    	let pre0;
    	let code3;
    	let t20;
    	let h21;
    	let t22;
    	let p3;
    	let t23;
    	let code4;
    	let t25;
    	let code5;
    	let t27;
    	let code6;
    	let t29;
    	let t30;
    	let p4;
    	let t31;
    	let a3;
    	let t33;
    	let t34;
    	let p5;
    	let b0;
    	let t36;
    	let b1;
    	let t38;
    	let code7;
    	let t40;
    	let t41;
    	let pre1;
    	let code8;
    	let t44;
    	let h22;
    	let t46;
    	let p6;
    	let t47;
    	let code9;
    	let t49;
    	let a4;
    	let t51;
    	let t52;
    	let p7;
    	let t53;
    	let b2;
    	let t55;
    	let code10;
    	let t57;
    	let code11;
    	let t59;
    	let t60;
    	let p8;
    	let t61;
    	let a5;
    	let t63;
    	let t64;
    	let pre2;
    	let t65;
    	let code12;
    	let t69;
    	let t70;
    	let h23;
    	let t72;
    	let p9;
    	let t73;
    	let a6;
    	let t75;
    	let t76;
    	let p10;
    	let t78;
    	let div;
    	let t80;
    	let pre3;
    	let t81;
    	let code13;
    	let t85;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "svelte-prism-action";
    			t1 = space();
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t3 = text(" action for lazy loading ");
    			a1 = element("a");
    			a1.textContent = "Prism.js";
    			t5 = text(" code highlighting.");
    			t6 = space();
    			p1 = element("p");
    			a2 = element("a");
    			a2.textContent = "Code on GitHub";
    			t8 = space();
    			h20 = element("h2");
    			h20.textContent = "Install";
    			t10 = space();
    			code0 = element("code");
    			code0.textContent = "$ npm install svelte-prism-action";
    			t12 = space();
    			p2 = element("p");
    			t13 = text("Include a Prism.js CSS theme in your svelte component or use the ");
    			code1 = element("code");
    			code1.textContent = "<head>";
    			t15 = text(" section of your ");
    			code2 = element("code");
    			code2.textContent = "index.html";
    			t17 = text(".");
    			t18 = space();
    			pre0 = element("pre");
    			code3 = element("code");
    			code3.textContent = `${`<link href="https://unpkg.com/prismjs@1.22.0/themes/prism.css" rel="stylesheet" />`}`;
    			t20 = space();
    			h21 = element("h2");
    			h21.textContent = "Usage";
    			t22 = space();
    			p3 = element("p");
    			t23 = text("Import prism from svelte-prism-action. Add the action to a component with ");
    			code4 = element("code");
    			code4.textContent = "use:prism";
    			t25 = text(". All ");
    			code5 = element("code");
    			code5.textContent = "<code>";
    			t27 = text(" elements with a ");
    			code6 = element("code");
    			code6.textContent = "class=\"language-...\"";
    			t29 = text(" will get highlighted once they have entered the viewport.");
    			t30 = space();
    			p4 = element("p");
    			t31 = text("For available language tags see ");
    			a3 = element("a");
    			a3.textContent = "https://prismjs.com/#supported-languages";
    			t33 = text(" .");
    			t34 = space();
    			p5 = element("p");
    			b0 = element("b");
    			b0.textContent = "HINT";
    			t36 = text(" If you are writing your codeblocks directly into a svelte component you need to ");
    			b1 = element("b");
    			b1.textContent = "escape special characters";
    			t38 = text(" (eg. curley brackets). Another way is to wrap the code inside ");
    			code7 = element("code");
    			code7.textContent = `${`\{\`\`\}`}`;
    			t40 = text(".");
    			t41 = space();
    			pre1 = element("pre");
    			code8 = element("code");

    			code8.textContent = `${`
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
  `;

    			t44 = space();
    			h22 = element("h2");
    			h22.textContent = "Options";
    			t46 = space();
    			p6 = element("p");
    			t47 = text("You can use ");
    			code9 = element("code");
    			code9.textContent = "componentsUrl";
    			t49 = text(" to set the URL from where to import the Prism.js language files. By default it uses ");
    			a4 = element("a");
    			a4.textContent = "unpkg cdn";
    			t51 = text(", but you can use a local resource instead.");
    			t52 = space();
    			p7 = element("p");
    			t53 = text("To lazy load ");
    			b2 = element("b");
    			b2.textContent = "third party language";
    			t55 = text(" files (eg. ");
    			code10 = element("code");
    			code10.textContent = "prism-svelte";
    			t57 = text(") or define a different file per language you can use ");
    			code11 = element("code");
    			code11.textContent = "componentsUrls";
    			t59 = text(" object with language id as key and the URL as the value.");
    			t60 = space();
    			p8 = element("p");
    			t61 = text("You can also change the IntersectionObserver options. For more information on what they do see ");
    			a5 = element("a");
    			a5.textContent = "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces";
    			t63 = text(" .");
    			t64 = space();
    			pre2 = element("pre");
    			t65 = text("    ");
    			code12 = element("code");

    			code12.textContent = `
${`<main use:prism={{
  root: null,
  rootMargin: "100px",
  threshold: 0,
  componentsUrl: "https://unpkg.com/prismjs@1.22.0/components",
  componentsUrls: {
    svelte: "https://cdn.jsdelivr.net/npm/prism-svelte@0.5.0/index.js"
  }
}}> 
...
</main>`}
    `;

    			t69 = text("\n  ");
    			t70 = space();
    			h23 = element("h2");
    			h23.textContent = "Lazy Loading";
    			t72 = space();
    			p9 = element("p");
    			t73 = text("The language files get lazy loaded. So you don't have to worry which files to include in your project. By default ");
    			a6 = element("a");
    			a6.textContent = "unpkg CDN";
    			t75 = text(" is used. But you can set this to whatever you like with the `componentsUrl` option.");
    			t76 = space();
    			p10 = element("p");
    			p10.textContent = "Please scroll down to test lazy loading.";
    			t78 = space();
    			div = element("div");
    			div.textContent = " ";
    			t80 = space();
    			pre3 = element("pre");
    			t81 = text("    ");
    			code13 = element("code");

    			code13.textContent = `
${`
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
    `;

    			t85 = text("\n  ");
    			add_location(h1, file, 6, 2, 187);
    			attr_dev(a0, "href", "https://svelte.dev");
    			add_location(a0, file, 7, 5, 221);
    			attr_dev(a1, "href", "https://prismjs.com");
    			add_location(a1, file, 7, 69, 285);
    			add_location(p0, file, 7, 2, 218);
    			attr_dev(a2, "href", "https://github.com/thurti/svelte-prism-action");
    			add_location(a2, file, 9, 5, 357);
    			add_location(p1, file, 9, 2, 354);
    			add_location(h20, file, 11, 2, 439);
    			attr_dev(code0, "id", "test_inline");
    			attr_dev(code0, "class", "lang-bash");
    			add_location(code0, file, 13, 2, 459);
    			attr_dev(code1, "lang", "html");
    			add_location(code1, file, 16, 69, 617);
    			attr_dev(code2, "class", "lang-html");
    			add_location(code2, file, 16, 123, 671);
    			add_location(p2, file, 15, 2, 544);
    			attr_dev(code3, "id", "test_block");
    			attr_dev(code3, "class", "lang-html");
    			add_location(code3, file, 18, 7, 728);
    			add_location(pre0, file, 18, 2, 723);
    			add_location(h21, file, 20, 2, 871);
    			attr_dev(code4, "class", "lang-html");
    			add_location(code4, file, 22, 79, 966);
    			attr_dev(code5, "class", "lang-html");
    			add_location(code5, file, 22, 125, 1012);
    			attr_dev(code6, "class", "lang-html");
    			add_location(code6, file, 22, 185, 1072);
    			add_location(p3, file, 22, 2, 889);
    			attr_dev(a3, "href", "https://prismjs.com/#supported-languages");
    			add_location(a3, file, 24, 37, 1224);
    			add_location(p4, file, 24, 2, 1189);
    			add_location(b0, file, 26, 5, 1332);
    			add_location(b1, file, 26, 97, 1424);
    			add_location(code7, file, 26, 192, 1519);
    			add_location(p5, file, 26, 2, 1329);
    			attr_dev(code8, "id", "test_svelte");
    			attr_dev(code8, "class", "lang-svelte");
    			add_location(code8, file, 28, 7, 1558);
    			add_location(pre1, file, 28, 2, 1553);
    			add_location(h22, file, 64, 2, 2205);
    			attr_dev(code9, "class", "lang-js");
    			add_location(code9, file, 65, 17, 2239);
    			attr_dev(a4, "href", "https://unpkg.com/");
    			add_location(a4, file, 65, 144, 2366);
    			add_location(p6, file, 65, 2, 2224);
    			add_location(b2, file, 67, 18, 2475);
    			attr_dev(code10, "class", "lang-js");
    			add_location(code10, file, 67, 57, 2514);
    			attr_dev(code11, "class", "lang-js");
    			add_location(code11, file, 67, 153, 2610);
    			add_location(p7, file, 67, 2, 2459);
    			attr_dev(a5, "href", "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Interfaces");
    			add_location(a5, file, 69, 100, 2817);
    			add_location(p8, file, 69, 2, 2719);
    			attr_dev(code12, "class", "lang-javascript");
    			add_location(code12, file, 72, 4, 3022);
    			add_location(pre2, file, 71, 2, 3012);
    			add_location(h23, file, 87, 2, 3329);
    			attr_dev(a6, "href", "https://unpkg.com");
    			add_location(a6, file, 89, 118, 3475);
    			add_location(p9, file, 88, 2, 3353);
    			add_location(p10, file, 91, 2, 3610);
    			set_style(div, "height", "1000px");
    			add_location(div, file, 92, 2, 3660);
    			attr_dev(code13, "id", "test_markdown");
    			attr_dev(code13, "class", "lang-markdown");
    			add_location(code13, file, 95, 4, 3713);
    			add_location(pre3, file, 94, 2, 3703);
    			add_location(main, file, 4, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(p0, a0);
    			append_dev(p0, t3);
    			append_dev(p0, a1);
    			append_dev(p0, t5);
    			append_dev(main, t6);
    			append_dev(main, p1);
    			append_dev(p1, a2);
    			append_dev(main, t8);
    			append_dev(main, h20);
    			append_dev(main, t10);
    			append_dev(main, code0);
    			append_dev(main, t12);
    			append_dev(main, p2);
    			append_dev(p2, t13);
    			append_dev(p2, code1);
    			append_dev(p2, t15);
    			append_dev(p2, code2);
    			append_dev(p2, t17);
    			append_dev(main, t18);
    			append_dev(main, pre0);
    			append_dev(pre0, code3);
    			append_dev(main, t20);
    			append_dev(main, h21);
    			append_dev(main, t22);
    			append_dev(main, p3);
    			append_dev(p3, t23);
    			append_dev(p3, code4);
    			append_dev(p3, t25);
    			append_dev(p3, code5);
    			append_dev(p3, t27);
    			append_dev(p3, code6);
    			append_dev(p3, t29);
    			append_dev(main, t30);
    			append_dev(main, p4);
    			append_dev(p4, t31);
    			append_dev(p4, a3);
    			append_dev(p4, t33);
    			append_dev(main, t34);
    			append_dev(main, p5);
    			append_dev(p5, b0);
    			append_dev(p5, t36);
    			append_dev(p5, b1);
    			append_dev(p5, t38);
    			append_dev(p5, code7);
    			append_dev(p5, t40);
    			append_dev(main, t41);
    			append_dev(main, pre1);
    			append_dev(pre1, code8);
    			append_dev(main, t44);
    			append_dev(main, h22);
    			append_dev(main, t46);
    			append_dev(main, p6);
    			append_dev(p6, t47);
    			append_dev(p6, code9);
    			append_dev(p6, t49);
    			append_dev(p6, a4);
    			append_dev(p6, t51);
    			append_dev(main, t52);
    			append_dev(main, p7);
    			append_dev(p7, t53);
    			append_dev(p7, b2);
    			append_dev(p7, t55);
    			append_dev(p7, code10);
    			append_dev(p7, t57);
    			append_dev(p7, code11);
    			append_dev(p7, t59);
    			append_dev(main, t60);
    			append_dev(main, p8);
    			append_dev(p8, t61);
    			append_dev(p8, a5);
    			append_dev(p8, t63);
    			append_dev(main, t64);
    			append_dev(main, pre2);
    			append_dev(pre2, t65);
    			append_dev(pre2, code12);
    			append_dev(pre2, t69);
    			append_dev(main, t70);
    			append_dev(main, h23);
    			append_dev(main, t72);
    			append_dev(main, p9);
    			append_dev(p9, t73);
    			append_dev(p9, a6);
    			append_dev(p9, t75);
    			append_dev(main, t76);
    			append_dev(main, p10);
    			append_dev(main, t78);
    			append_dev(main, div);
    			append_dev(main, t80);
    			append_dev(main, pre3);
    			append_dev(pre3, t81);
    			append_dev(pre3, code13);
    			append_dev(pre3, t85);

    			if (!mounted) {
    				dispose = action_destroyer(prism.call(null, main, {
    					componentsUrls: {
    						svelte: "https://cdn.jsdelivr.net/npm/prism-svelte@0.5.0/index.js"
    					}
    				}));

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Page', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ prism });
    	return [];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.56.0 */

    // (9:0) {#if open}
    function create_if_block(ctx) {
    	let page;
    	let current;
    	page = new Page({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(9:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let open = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Page, open });

    	$$self.$inject_state = $$props => {
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
