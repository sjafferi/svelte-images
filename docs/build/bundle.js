
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    const seen_callbacks = new Set();
    function flush() {
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    /* src/Images/ClickOutside.svelte generated by Svelte v3.18.1 */
    const file = "src/Images/ClickOutside.svelte";

    function create_fragment(ctx) {
    	let t;
    	let div;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", /*className*/ ctx[0]);
    			add_location(div, file, 26, 0, 656);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[8](div);
    			current = true;
    			dispose = listen_dev(document.body, "click", /*onClickOutside*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 64) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    			}

    			if (!current || dirty & /*className*/ 1) {
    				attr_dev(div, "class", /*className*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[8](null);
    			dispose();
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
    	let { exclude = [] } = $$props;
    	let { className } = $$props;
    	let child;
    	const dispatch = createEventDispatcher();

    	function isExcluded(target) {
    		var parent = target;

    		while (parent) {
    			if (exclude.indexOf(parent) >= 0 || parent === child) {
    				return true;
    			}

    			parent = parent.parentNode;
    		}

    		return false;
    	}

    	function onClickOutside(event) {
    		if (!isExcluded(event.target)) {
    			event.preventDefault();
    			dispatch("clickoutside");
    		}
    	}

    	const writable_props = ["exclude", "className"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClickOutside> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, child = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("exclude" in $$props) $$invalidate(3, exclude = $$props.exclude);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { exclude, className, child };
    	};

    	$$self.$inject_state = $$props => {
    		if ("exclude" in $$props) $$invalidate(3, exclude = $$props.exclude);
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("child" in $$props) $$invalidate(1, child = $$props.child);
    	};

    	return [
    		className,
    		child,
    		onClickOutside,
    		exclude,
    		dispatch,
    		isExcluded,
    		$$scope,
    		$$slots,
    		div_binding
    	];
    }

    class ClickOutside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { exclude: 3, className: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClickOutside",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*className*/ ctx[0] === undefined && !("className" in props)) {
    			console.warn("<ClickOutside> was created without expected prop 'className'");
    		}
    	}

    	get exclude() {
    		throw new Error("<ClickOutside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<ClickOutside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<ClickOutside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<ClickOutside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Images/Carousel.svelte generated by Svelte v3.18.1 */

    const { window: window_1 } = globals;
    const file$1 = "src/Images/Carousel.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (160:6) {#each images as image, i}
    function create_each_block(ctx) {
    	let div;
    	let img;
    	let i = /*i*/ ctx[19];
    	let t;
    	let img_levels = [/*image*/ ctx[17], { alt: /*image*/ ctx[17].alt || "" }];
    	let img_data = {};

    	for (let i = 0; i < img_levels.length; i += 1) {
    		img_data = assign(img_data, img_levels[i]);
    	}

    	const assign_img = () => /*img_binding*/ ctx[16](img, i);
    	const unassign_img = () => /*img_binding*/ ctx[16](null, i);

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			set_attributes(img, img_data);
    			toggle_class(img, "svelte-1vuxo0t", true);
    			add_location(img, file$1, 161, 10, 3617);
    			attr_dev(div, "class", "img-container svelte-1vuxo0t");
    			add_location(div, file$1, 160, 8, 3579);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			assign_img();
    			append_dev(div, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			set_attributes(img, get_spread_update(img_levels, [
    				dirty & /*images*/ 2 && /*image*/ ctx[17],
    				dirty & /*images*/ 2 && { alt: /*image*/ ctx[17].alt || "" }
    			]));

    			if (i !== /*i*/ ctx[19]) {
    				unassign_img();
    				i = /*i*/ ctx[19];
    				assign_img();
    			}

    			toggle_class(img, "svelte-1vuxo0t", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			unassign_img();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(160:6) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (156:4) <ClickOutside       className="click-outside-wrapper"       on:clickoutside={handleClose}       exclude={[left_nav_button, right_nav_button, ...image_elements]}>
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let each_value = /*images*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images, image_elements*/ 18) {
    				each_value = /*images*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(156:4) <ClickOutside       className=\\\"click-outside-wrapper\\\"       on:clickoutside={handleClose}       exclude={[left_nav_button, right_nav_button, ...image_elements]}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let button0;
    	let svg0;
    	let path0;
    	let t2;
    	let button1;
    	let svg1;
    	let path1;
    	let t3;
    	let div1;
    	let div1_style_value;
    	let current;
    	let dispose;

    	const clickoutside = new ClickOutside({
    			props: {
    				className: "click-outside-wrapper",
    				exclude: [
    					/*left_nav_button*/ ctx[2],
    					/*right_nav_button*/ ctx[3],
    					.../*image_elements*/ ctx[4]
    				],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	clickoutside.$on("clickoutside", /*handleClose*/ ctx[9]);

    	const block = {
    		c: function create() {
    			t0 = text(/*curr_idx*/ ctx[0]);
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t3 = space();
    			div1 = element("div");
    			create_component(clickoutside.$$.fragment);
    			attr_dev(path0, "d", "M15.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.406-4.594 4.594z");
    			add_location(path0, file$1, 142, 8, 2949);
    			attr_dev(svg0, "role", "presentation");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "class", "svelte-1vuxo0t");
    			add_location(svg0, file$1, 141, 6, 2895);
    			attr_dev(button0, "class", "svelte-1vuxo0t");
    			add_location(button0, file$1, 140, 4, 2836);
    			attr_dev(path1, "d", "M9.984 6l6 6-6 6-1.406-1.406 4.594-4.594-4.594-4.594z");
    			add_location(path1, file$1, 148, 8, 3179);
    			attr_dev(svg1, "role", "presentation");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "class", "svelte-1vuxo0t");
    			add_location(svg1, file$1, 147, 6, 3125);
    			attr_dev(button1, "class", "svelte-1vuxo0t");
    			add_location(button1, file$1, 146, 4, 3064);
    			attr_dev(div0, "class", "nav svelte-1vuxo0t");
    			add_location(div0, file$1, 139, 2, 2814);
    			attr_dev(div1, "class", "carousel svelte-1vuxo0t");
    			attr_dev(div1, "style", div1_style_value = `transform: translate3d(${/*translateX*/ ctx[5]}px, 0, 0);`);
    			add_location(div1, file$1, 152, 2, 3284);
    			attr_dev(div2, "class", "container svelte-1vuxo0t");
    			add_location(div2, file$1, 138, 0, 2788);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			/*button0_binding*/ ctx[14](button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			/*button1_binding*/ ctx[15](button1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			mount_component(clickoutside, div1, null);
    			current = true;

    			dispose = [
    				listen_dev(window_1, "resize", /*handleResize*/ ctx[8], false, false, false),
    				listen_dev(button0, "click", /*left*/ ctx[7], false, false, false),
    				listen_dev(button1, "click", /*right*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*curr_idx*/ 1) set_data_dev(t0, /*curr_idx*/ ctx[0]);
    			const clickoutside_changes = {};

    			if (dirty & /*left_nav_button, right_nav_button, image_elements*/ 28) clickoutside_changes.exclude = [
    				/*left_nav_button*/ ctx[2],
    				/*right_nav_button*/ ctx[3],
    				.../*image_elements*/ ctx[4]
    			];

    			if (dirty & /*$$scope, images, image_elements*/ 1048594) {
    				clickoutside_changes.$$scope = { dirty, ctx };
    			}

    			clickoutside.$set(clickoutside_changes);

    			if (!current || dirty & /*translateX*/ 32 && div1_style_value !== (div1_style_value = `transform: translate3d(${/*translateX*/ ctx[5]}px, 0, 0);`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clickoutside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clickoutside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			/*button0_binding*/ ctx[14](null);
    			/*button1_binding*/ ctx[15](null);
    			destroy_component(clickoutside);
    			run_all(dispose);
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
    	let { images } = $$props;
    	let { close } = $$props;
    	let { curr_idx = 0 } = $$props;
    	let left_nav_button;
    	let right_nav_button;
    	const image_elements = new Array(images.length);
    	let translateX = -curr_idx * window.innerWidth;

    	function increment(num) {
    		return num >= images.length - 1 ? 0 : num + 1;
    	}

    	function decrement(num) {
    		return num == 0 ? images.length - 1 : num - 1;
    	}

    	function right() {
    		$$invalidate(0, curr_idx = increment(curr_idx));
    		$$invalidate(5, translateX = -curr_idx * window.innerWidth);
    	}

    	function left() {
    		$$invalidate(0, curr_idx = decrement(curr_idx));
    		$$invalidate(5, translateX = -curr_idx * window.innerWidth);
    	}

    	function handleResize() {
    		$$invalidate(5, translateX = -curr_idx * window.innerWidth);
    	}

    	const debouncedClose = debounce(close, 100, true);

    	function handleClose() {
    		debouncedClose();
    	}

    	const writable_props = ["images", "close", "curr_idx"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	function button0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, left_nav_button = $$value);
    		});
    	}

    	function button1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, right_nav_button = $$value);
    		});
    	}

    	function img_binding($$value, i) {
    		if (image_elements[i] === $$value) return;

    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			image_elements[i] = $$value;
    			$$invalidate(4, image_elements);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("close" in $$props) $$invalidate(10, close = $$props.close);
    		if ("curr_idx" in $$props) $$invalidate(0, curr_idx = $$props.curr_idx);
    	};

    	$$self.$capture_state = () => {
    		return {
    			images,
    			close,
    			curr_idx,
    			left_nav_button,
    			right_nav_button,
    			translateX
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("close" in $$props) $$invalidate(10, close = $$props.close);
    		if ("curr_idx" in $$props) $$invalidate(0, curr_idx = $$props.curr_idx);
    		if ("left_nav_button" in $$props) $$invalidate(2, left_nav_button = $$props.left_nav_button);
    		if ("right_nav_button" in $$props) $$invalidate(3, right_nav_button = $$props.right_nav_button);
    		if ("translateX" in $$props) $$invalidate(5, translateX = $$props.translateX);
    	};

    	return [
    		curr_idx,
    		images,
    		left_nav_button,
    		right_nav_button,
    		image_elements,
    		translateX,
    		right,
    		left,
    		handleResize,
    		handleClose,
    		close,
    		increment,
    		decrement,
    		debouncedClose,
    		button0_binding,
    		button1_binding,
    		img_binding
    	];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { images: 1, close: 10, curr_idx: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*images*/ ctx[1] === undefined && !("images" in props)) {
    			console.warn("<Carousel> was created without expected prop 'images'");
    		}

    		if (/*close*/ ctx[10] === undefined && !("close" in props)) {
    			console.warn("<Carousel> was created without expected prop 'close'");
    		}
    	}

    	get images() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get curr_idx() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set curr_idx(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Images/Images.svelte generated by Svelte v3.18.1 */
    const file$2 = "src/Images/Images.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (36:2) {#each images as image, i}
    function create_each_block$1(ctx) {
    	let img;
    	let dispose;

    	let img_levels = [
    		{
    			style: /*numCols*/ ctx[2] != undefined
    			? `width: ${100 / /*numCols*/ ctx[2] - 6}%;`
    			: "max-width: 200px;"
    		},
    		/*image*/ ctx[7],
    		{
    			src: /*image*/ ctx[7].thumbnail || /*image*/ ctx[7].src
    		},
    		{ alt: /*image*/ ctx[7].alt || "" }
    	];

    	let img_data = {};

    	for (let i = 0; i < img_levels.length; i += 1) {
    		img_data = assign(img_data, img_levels[i]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*i*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_attributes(img, img_data);
    			toggle_class(img, "svelte-18y9yg1", true);
    			add_location(img, file$2, 36, 4, 704);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			dispose = listen_dev(img, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			set_attributes(img, get_spread_update(img_levels, [
    				dirty & /*numCols, undefined*/ 4 && {
    					style: /*numCols*/ ctx[2] != undefined
    					? `width: ${100 / /*numCols*/ ctx[2] - 6}%;`
    					: "max-width: 200px;"
    				},
    				dirty & /*images*/ 1 && /*image*/ ctx[7],
    				dirty & /*images*/ 1 && {
    					src: /*image*/ ctx[7].thumbnail || /*image*/ ctx[7].src
    				},
    				dirty & /*images*/ 1 && { alt: /*image*/ ctx[7].alt || "" }
    			]));

    			toggle_class(img, "svelte-18y9yg1", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:2) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let each_value = /*images*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "gallery svelte-18y9yg1");
    			set_style(div, "--gutter", /*gutter*/ ctx[1]);
    			add_location(div, file$2, 34, 0, 621);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*numCols, undefined, images, popModal*/ 13) {
    				each_value = /*images*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*gutter*/ 2) {
    				set_style(div, "--gutter", /*gutter*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { images = [] } = $$props;
    	let { gutter = 2 } = $$props;
    	let { numCols } = $$props;
    	const { open, close } = getContext("simple-modal");

    	const popModal = idx => setTimeout(
    		() => {
    			open(Carousel, { images, curr_idx: idx, close });
    		},
    		0
    	);

    	const writable_props = ["images", "gutter", "numCols"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Images> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => popModal(i);

    	$$self.$set = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("gutter" in $$props) $$invalidate(1, gutter = $$props.gutter);
    		if ("numCols" in $$props) $$invalidate(2, numCols = $$props.numCols);
    	};

    	$$self.$capture_state = () => {
    		return { images, gutter, numCols };
    	};

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    		if ("gutter" in $$props) $$invalidate(1, gutter = $$props.gutter);
    		if ("numCols" in $$props) $$invalidate(2, numCols = $$props.numCols);
    	};

    	return [images, gutter, numCols, popModal, open, close, click_handler];
    }

    class Images extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { images: 0, gutter: 1, numCols: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Images",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*numCols*/ ctx[2] === undefined && !("numCols" in props)) {
    			console.warn("<Images> was created without expected prop 'numCols'");
    		}
    	}

    	get images() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gutter() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gutter(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numCols() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numCols(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Images/Modal.svelte generated by Svelte v3.18.1 */

    const { Object: Object_1 } = globals;
    const file$3 = "src/Images/Modal.svelte";

    // (103:2) {#if isOpen}
    function create_if_block(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let dispose;
    	const switch_instance_spread_levels = [/*props*/ ctx[5]];
    	var switch_value = /*Component*/ ctx[4];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "content svelte-1e954pe");
    			attr_dev(div0, "style", /*cssContent*/ ctx[10]);
    			add_location(div0, file$3, 114, 10, 2959);
    			attr_dev(div1, "class", "window svelte-1e954pe");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[9]);
    			add_location(div1, file$3, 110, 8, 2828);
    			attr_dev(div2, "class", "window-wrap svelte-1e954pe");
    			add_location(div2, file$3, 109, 6, 2777);
    			attr_dev(div3, "class", "bg svelte-1e954pe");
    			attr_dev(div3, "style", /*cssBg*/ ctx[8]);
    			add_location(div3, file$3, 103, 4, 2615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div2_binding*/ ctx[30](div2);
    			/*div3_binding*/ ctx[31](div3);
    			current = true;
    			dispose = listen_dev(div3, "click", /*handleOuterClick*/ ctx[13], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*props*/ 32)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[5])])
    			: {};

    			if (switch_value !== (switch_value = /*Component*/ ctx[4])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*cssContent*/ 1024) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[10]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 512) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 256) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*transitionWindow*/ ctx[2], /*transitionWindowProps*/ ctx[3], true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*transitionBg*/ ctx[0], /*transitionBgProps*/ ctx[1], true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*transitionWindow*/ ctx[2], /*transitionWindowProps*/ ctx[3], false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*transitionBg*/ ctx[0], /*transitionBgProps*/ ctx[1], false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[30](null);
    			/*div3_binding*/ ctx[31](null);
    			if (detaching && div3_transition) div3_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(103:2) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t;
    	let current;
    	let dispose;
    	let if_block = /*isOpen*/ ctx[11] && create_if_block(ctx);
    	const default_slot_template = /*$$slots*/ ctx[29].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[28], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-1e954pe");
    			add_location(div, file$3, 101, 0, 2590);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    			dispose = listen_dev(window, "keyup", /*handleKeyup*/ ctx[12], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*isOpen*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 268435456) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[28], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[28], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { key = "simple-modal" } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;
    	let { styleBg = { top: 0, left: 0 } } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { setContext: setContext$1 = setContext } = $$props;
    	let Component = null;
    	let props = null;
    	let background;
    	let wrap;
    	let customStyleBg = {};
    	let customStyleWindow = {};
    	let customStyleContent = {};
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");

    	const open = (NewComponent, newProps = {}, style = { bg: {}, window: {}, content: {} }) => {
    		$$invalidate(4, Component = NewComponent);
    		$$invalidate(5, props = newProps);
    		$$invalidate(21, customStyleBg = style.bg || {});
    		$$invalidate(22, customStyleWindow = style.window || {});
    		$$invalidate(23, customStyleContent = style.content || {});
    	};

    	const close = () => {
    		$$invalidate(4, Component = null);
    		$$invalidate(5, props = null);
    		$$invalidate(21, customStyleBg = {});
    		$$invalidate(22, customStyleWindow = {});
    		$$invalidate(23, customStyleContent = {});
    	};

    	const handleKeyup = ({ key }) => {
    		if (closeOnEsc && Component && key === "Escape") {
    			event.preventDefault();
    			close();
    		}
    	};

    	const handleOuterClick = event => {
    		if (closeOnOuterClick && (event.target === background || event.target === wrap)) {
    			event.preventDefault();
    			close();
    		}
    	};

    	setContext$1(key, { open, close });

    	const writable_props = [
    		"key",
    		"closeOnEsc",
    		"closeOnOuterClick",
    		"transitionBg",
    		"transitionBgProps",
    		"transitionWindow",
    		"transitionWindowProps",
    		"styleBg",
    		"styleWindow",
    		"styleContent",
    		"setContext"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(7, wrap = $$value);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(6, background = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("key" in $$props) $$invalidate(14, key = $$props.key);
    		if ("closeOnEsc" in $$props) $$invalidate(15, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(16, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("transitionBg" in $$props) $$invalidate(0, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(1, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(2, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(3, transitionWindowProps = $$props.transitionWindowProps);
    		if ("styleBg" in $$props) $$invalidate(17, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(18, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(19, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(20, setContext$1 = $$props.setContext);
    		if ("$$scope" in $$props) $$invalidate(28, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			key,
    			closeOnEsc,
    			closeOnOuterClick,
    			transitionBg,
    			transitionBgProps,
    			transitionWindow,
    			transitionWindowProps,
    			styleBg,
    			styleWindow,
    			styleContent,
    			setContext: setContext$1,
    			Component,
    			props,
    			background,
    			wrap,
    			customStyleBg,
    			customStyleWindow,
    			customStyleContent,
    			cssBg,
    			cssWindow,
    			cssContent,
    			isOpen
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(14, key = $$props.key);
    		if ("closeOnEsc" in $$props) $$invalidate(15, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(16, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("transitionBg" in $$props) $$invalidate(0, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(1, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(2, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(3, transitionWindowProps = $$props.transitionWindowProps);
    		if ("styleBg" in $$props) $$invalidate(17, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(18, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(19, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(20, setContext$1 = $$props.setContext);
    		if ("Component" in $$props) $$invalidate(4, Component = $$props.Component);
    		if ("props" in $$props) $$invalidate(5, props = $$props.props);
    		if ("background" in $$props) $$invalidate(6, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(7, wrap = $$props.wrap);
    		if ("customStyleBg" in $$props) $$invalidate(21, customStyleBg = $$props.customStyleBg);
    		if ("customStyleWindow" in $$props) $$invalidate(22, customStyleWindow = $$props.customStyleWindow);
    		if ("customStyleContent" in $$props) $$invalidate(23, customStyleContent = $$props.customStyleContent);
    		if ("cssBg" in $$props) $$invalidate(8, cssBg = $$props.cssBg);
    		if ("cssWindow" in $$props) $$invalidate(9, cssWindow = $$props.cssWindow);
    		if ("cssContent" in $$props) $$invalidate(10, cssContent = $$props.cssContent);
    		if ("isOpen" in $$props) $$invalidate(11, isOpen = $$props.isOpen);
    	};

    	let cssBg;
    	let cssWindow;
    	let cssContent;
    	let isOpen;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*styleBg, customStyleBg*/ 2228224) {
    			 $$invalidate(8, cssBg = toCssString(Object.assign({}, styleBg, customStyleBg)));
    		}

    		if ($$self.$$.dirty[0] & /*styleWindow, customStyleWindow*/ 4456448) {
    			 $$invalidate(9, cssWindow = toCssString(Object.assign({}, styleWindow, customStyleWindow)));
    		}

    		if ($$self.$$.dirty[0] & /*styleContent, customStyleContent*/ 8912896) {
    			 $$invalidate(10, cssContent = toCssString(Object.assign({}, styleContent, customStyleContent)));
    		}

    		if ($$self.$$.dirty[0] & /*Component*/ 16) {
    			 $$invalidate(11, isOpen = !!Component);
    		}
    	};

    	return [
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		Component,
    		props,
    		background,
    		wrap,
    		cssBg,
    		cssWindow,
    		cssContent,
    		isOpen,
    		handleKeyup,
    		handleOuterClick,
    		key,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		setContext$1,
    		customStyleBg,
    		customStyleWindow,
    		customStyleContent,
    		camelCaseToDash,
    		toCssString,
    		open,
    		close,
    		$$scope,
    		$$slots,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				key: 14,
    				closeOnEsc: 15,
    				closeOnOuterClick: 16,
    				transitionBg: 0,
    				transitionBgProps: 1,
    				transitionWindow: 2,
    				transitionWindowProps: 3,
    				styleBg: 17,
    				styleWindow: 18,
    				styleContent: 19,
    				setContext: 20
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Images/index.svelte generated by Svelte v3.18.1 */
    const file$4 = "src/Images/index.svelte";

    // (11:2) <Modal>
    function create_default_slot$1(ctx) {
    	let current;
    	const images_spread_levels = [/*$$props*/ ctx[0]];
    	let images_props = {};

    	for (let i = 0; i < images_spread_levels.length; i += 1) {
    		images_props = assign(images_props, images_spread_levels[i]);
    	}

    	const images = new Images({ props: images_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(images.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(images, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const images_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(images_spread_levels, [get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			images.$set(images_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(images.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(images.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(images, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(11:2) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current;

    	const modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(modal.$$.fragment);
    			attr_dev(div, "class", "svelte-images-container");
    			add_location(div, file$4, 9, 0, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(modal, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(modal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Images_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Images_1",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.18.1 */
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let current;

    	const images_1 = new Images_1({
    			props: {
    				images: /*images*/ ctx[0],
    				gutter: 5,
    				numCols: 3
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(images_1.$$.fragment);
    			attr_dev(main, "class", "svelte-14tdwmw");
    			add_location(main, file$5, 13, 0, 205);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(images_1, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(images_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(images_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(images_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self) {
    	const images = [...Array(6).keys()].map(i => ({ src: `./images/${i + 1}.jpg` }));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [images];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
