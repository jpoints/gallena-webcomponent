
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var components = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    const active_docs = new Set();
    let active = 0;
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
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
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
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
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
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                const { on_mount } = this.$$;
                this.$$.on_disconnect = on_mount.map(run).filter(is_function);
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            disconnectedCallback() {
                run_all(this.$$.on_disconnect);
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
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
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.6' }, detail), true));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    /* src\gallery\Gallery.svelte generated by Svelte v3.42.6 */

    const { console: console_1$7 } = globals;
    const file$k = "src\\gallery\\Gallery.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (63:8) {#each data as item,index}
    function create_each_block_1(ctx) {
    	let div8;
    	let div7;
    	let div0;
    	let button0;
    	let span0;
    	let t0;
    	let div5;
    	let div1;
    	let p0;
    	let t1_value = /*item*/ ctx[9].title + "";
    	let t1;
    	let t2;
    	let div2;
    	let p1;
    	let t3_value = /*item*/ ctx[9].description + "";
    	let t3;
    	let t4;
    	let div4;
    	let div3;
    	let p2;
    	let t5_value = /*item*/ ctx[9].title + "";
    	let t5;
    	let t6;
    	let br;
    	let t7;
    	let t8_value = /*item*/ ctx[9].description + "";
    	let t8;
    	let t9;
    	let div6;
    	let button1;
    	let span1;
    	let t10;
    	let div8_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t0 = space();
    			div5 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			p2 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			br = element("br");
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			div6 = element("div");
    			button1 = element("button");
    			span1 = element("span");
    			t10 = space();
    			attr_dev(span0, "class", "fas fa-angle-left");
    			add_location(span0, file$k, 67, 32, 2013);
    			attr_dev(button0, "class", "rounded-full bg-white w-12 h-12 border-black border-2");
    			add_location(button0, file$k, 66, 24, 1889);
    			attr_dev(div0, "class", "flex justify-center items-center w-13");
    			add_location(div0, file$k, 65, 20, 1812);
    			attr_dev(p0, "class", "p-5 hidden md:block bg-secondary text-white");
    			add_location(p0, file$k, 72, 28, 2276);
    			attr_dev(div1, "class", "w-auto mb-2");
    			add_location(div1, file$k, 71, 24, 2221);
    			attr_dev(p1, "class", "bg-black hidden md:block bg-opacity-70 text-white p-5");
    			add_location(p1, file$k, 75, 28, 2460);
    			attr_dev(div2, "class", "w-auto mb-5");
    			add_location(div2, file$k, 74, 24, 2405);
    			add_location(br, file$k, 79, 113, 2815);
    			attr_dev(p2, "class", "bg-black bg-opacity-70 text-white p-5 w-full text-center");
    			add_location(p2, file$k, 79, 32, 2734);
    			attr_dev(div3, "class", "w-auto text-sm");
    			add_location(div3, file$k, 78, 28, 2672);
    			attr_dev(div4, "class", "flex flex-col md:hidden");
    			add_location(div4, file$k, 77, 24, 2605);
    			attr_dev(div5, "class", "w-full flex flex-col justify-end items-start");
    			add_location(div5, file$k, 70, 20, 2137);
    			attr_dev(span1, "class", "fas fa-angle-right");
    			add_location(span1, file$k, 85, 32, 3162);
    			attr_dev(button1, "class", "rounded-full bg-white w-12 h-12 border-black border-2");
    			add_location(button1, file$k, 84, 24, 3038);
    			attr_dev(div6, "class", "flex justify-center items-center w-13");
    			add_location(div6, file$k, 83, 20, 2961);
    			attr_dev(div7, "class", "flex justify-center h-full w-full");
    			add_location(div7, file$k, 64, 16, 1743);

    			attr_dev(div8, "class", div8_class_value = "child " + (/*location*/ ctx[1] === /*index*/ ctx[13]
    			? 'fadeIn'
    			: 'fadeOut'));

    			set_style(div8, "background-image", "url(" + /*item*/ ctx[9].url + ")");
    			set_style(div8, "background-size", "cover");
    			add_location(div8, file$k, 63, 8, 1597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div7, t0);
    			append_dev(div7, div5);
    			append_dev(div5, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(div5, t2);
    			append_dev(div5, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, p2);
    			append_dev(p2, t5);
    			append_dev(p2, t6);
    			append_dev(p2, br);
    			append_dev(p2, t7);
    			append_dev(p2, t8);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, button1);
    			append_dev(button1, span1);
    			append_dev(div8, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*prevItem*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*nextItem*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*item*/ ctx[9].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 1 && t3_value !== (t3_value = /*item*/ ctx[9].description + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*data*/ 1 && t5_value !== (t5_value = /*item*/ ctx[9].title + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*data*/ 1 && t8_value !== (t8_value = /*item*/ ctx[9].description + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*location*/ 2 && div8_class_value !== (div8_class_value = "child " + (/*location*/ ctx[1] === /*index*/ ctx[13]
    			? 'fadeIn'
    			: 'fadeOut'))) {
    				attr_dev(div8, "class", div8_class_value);
    			}

    			if (dirty & /*data*/ 1) {
    				set_style(div8, "background-image", "url(" + /*item*/ ctx[9].url + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(63:8) {#each data as item,index}",
    		ctx
    	});

    	return block;
    }

    // (96:8) {#each data as item,i}
    function create_each_block$4(ctx) {
    	let li;
    	let button;
    	let button_class_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*i*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t = space();

    			attr_dev(button, "class", button_class_value = "rounded-full w-3 h-3 m-1 " + (/*location*/ ctx[1] === /*i*/ ctx[11]
    			? 'bg-primary'
    			: 'bg-secondary'));

    			add_location(button, file$k, 97, 16, 3460);
    			add_location(li, file$k, 96, 12, 3438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*location*/ 2 && button_class_value !== (button_class_value = "rounded-full w-3 h-3 m-1 " + (/*location*/ ctx[1] === /*i*/ ctx[11]
    			? 'bg-primary'
    			: 'bg-secondary'))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(96:8) {#each data as item,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let div;
    	let t2;
    	let ul;
    	let each_value_1 = /*data*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.c = noop;
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", /omni-cms/app.css");
    			add_location(link0, file$k, 58, 0, 1394);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "/fontawesome/css/all.min.css");
    			add_location(link1, file$k, 59, 0, 1437);
    			attr_dev(div, "class", "parent h-48 md:h-96 bg-black");
    			add_location(div, file$k, 61, 4, 1509);
    			attr_dev(ul, "class", "flex w-full justify-center");
    			add_location(ul, file$k, 94, 4, 3353);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*location, data, nextItem, prevItem*/ 15) {
    				each_value_1 = /*data*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*location, setItem, data*/ 19) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-gallery', slots, []);
    	let location = 0;
    	let { data = [] } = $$props;
    	let { path = null } = $$props;
    	let timer = setTimer();

    	onMount(async () => {
    		console.log("ergerg", path);

    		if (path) {
    			let response = await fetch(path);
    			$$invalidate(0, data = await response.json());
    		} else {
    			$$invalidate(0, data = data.replace(/\}\,\]$/, "}]"));
    			console.log("--->", data);

    			try {
    				$$invalidate(0, data = JSON.parse(data));
    			} catch(error) {
    				$$invalidate(0, data = []);
    				console.log("not json", error);
    				throw error;
    			}
    		}

    		data[0];
    	});

    	function setTimer() {
    		return setInterval(
    			function () {
    				$$invalidate(1, location = (location + 1) % data.length);
    			},
    			15000
    		);
    	}

    	function nextItem() {
    		$$invalidate(1, location = (location + 1) % data.length);
    		clearInterval(timer);
    		timer = setTimer();
    	}

    	function prevItem() {
    		$$invalidate(1, location = (location + data.length - 1) % data.length);
    		clearInterval(timer);
    		timer = setTimer();
    	}

    	function setItem(current) {
    		console.log("test", current);
    		$$invalidate(1, location = current);
    		clearInterval(timer);
    		timer = setTimer();
    	}

    	const writable_props = ['data', 'path'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$7.warn(`<mc-gallery> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => setItem(i);

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('path' in $$props) $$invalidate(5, path = $$props.path);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		location,
    		data,
    		path,
    		timer,
    		setTimer,
    		nextItem,
    		prevItem,
    		setItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(1, location = $$props.location);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('path' in $$props) $$invalidate(5, path = $$props.path);
    		if ('timer' in $$props) timer = $$props.timer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, location, nextItem, prevItem, setItem, path, click_handler];
    }

    class Gallery extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.parent{display:grid}.fadeOut{visibility:hidden;opacity:0;z-index:0;transition:visibility 0s linear 1000ms, opacity 1000ms}.fadeIn{visibility:visible;opacity:1;z-index:0;transition:visibility 0s linear 0s, opacity 3000ms}.child{grid-area:1 / 1 / 2 / 2}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$k,
    			create_fragment$k,
    			safe_not_equal,
    			{ data: 0, path: 5 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["data", "path"];
    	}

    	get data() {
    		return this.$$.ctx[0];
    	}

    	set data(data) {
    		this.$$set({ data });
    		flush();
    	}

    	get path() {
    		return this.$$.ctx[5];
    	}

    	set path(path) {
    		this.$$set({ path });
    		flush();
    	}
    }

    customElements.define("mc-gallery", Gallery);

    /* src\gallery\Gallery2.svelte generated by Svelte v3.42.6 */

    const { console: console_1$6 } = globals;
    const file$j = "src\\gallery\\Gallery2.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (89:8) {#each data as item,i}
    function create_each_block$3(ctx) {
    	let li;
    	let button;
    	let button_class_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*i*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t = space();

    			attr_dev(button, "class", button_class_value = "rounded-full w-3 h-3 m-1 " + (/*location*/ ctx[1] === /*i*/ ctx[13]
    			? 'bg-primary'
    			: 'bg-white'));

    			add_location(button, file$j, 90, 16, 3301);
    			add_location(li, file$j, 89, 12, 3279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*location*/ 2 && button_class_value !== (button_class_value = "rounded-full w-3 h-3 m-1 " + (/*location*/ ctx[1] === /*i*/ ctx[13]
    			? 'bg-primary'
    			: 'bg-white'))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(89:8) {#each data as item,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let div6;
    	let div5;
    	let div0;
    	let button0;
    	let span0;
    	let t2;
    	let div3;
    	let div1;
    	let p0;
    	let t3_value = /*current*/ ctx[2].title + "";
    	let t3;
    	let t4;
    	let div2;
    	let p1;
    	let t5_value = /*current*/ ctx[2].description + "";
    	let t5;
    	let div3_class_value;
    	let t6;
    	let div4;
    	let button1;
    	let span1;
    	let t7;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div4 = element("div");
    			button1 = element("button");
    			span1 = element("span");
    			t7 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.c = noop;
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", /omni-cms/app.css");
    			add_location(link0, file$j, 61, 0, 1681);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "/fontawesome/css/all.min.css");
    			add_location(link1, file$j, 62, 0, 1724);
    			attr_dev(span0, "class", "fas fa-angle-left");
    			add_location(span0, file$j, 69, 32, 2135);
    			attr_dev(button0, "class", "text-white text-lg w-12 h-full bg-primary");
    			add_location(button0, file$j, 68, 24, 2023);
    			attr_dev(div0, "class", "flex justify-center items-center w-13 bg-white");
    			add_location(div0, file$j, 67, 20, 1937);
    			attr_dev(p0, "class", "p-5 bg-secondary text-white");
    			add_location(p0, file$j, 74, 28, 2501);
    			attr_dev(div1, "class", "w-auto mb-2 ml-10");
    			add_location(div1, file$j, 73, 23, 2440);
    			attr_dev(p1, "class", "bg-black bg-opacity-70 text-white p-5");
    			add_location(p1, file$j, 77, 28, 2678);
    			attr_dev(div2, "class", "w-auto mb-5 ml-10");
    			add_location(div2, file$j, 76, 24, 2617);
    			attr_dev(div3, "class", div3_class_value = "w-full flex flex-col justify-end items-start transition-opacity " + /*opacity*/ ctx[3]);
    			set_style(div3, "background-image", "url(" + /*current*/ ctx[2].url + ")");
    			set_style(div3, "background-size", "cover");
    			add_location(div3, file$j, 72, 20, 2259);
    			attr_dev(span1, "class", "fas fa-angle-right");
    			add_location(span1, file$j, 82, 32, 3032);
    			attr_dev(button1, "class", "text-white text-lg w-12 h-full bg-primary");
    			add_location(button1, file$j, 81, 24, 2920);
    			attr_dev(div4, "class", "flex justify-center items-center w-13 bg-white");
    			add_location(div4, file$j, 80, 20, 2834);
    			attr_dev(div5, "class", "flex justify-center h-full w-full");
    			add_location(div5, file$j, 66, 16, 1868);
    			attr_dev(div6, "class", "h-48 w-full md:w-full md:h-96 bg-black");
    			add_location(div6, file$j, 65, 4, 1798);
    			attr_dev(ul, "class", "flex w-full justify-center bg-secondary p-1");
    			add_location(ul, file$j, 87, 4, 3177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, button1);
    			append_dev(button1, span1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*prevItem*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*nextItem*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*current*/ 4 && t3_value !== (t3_value = /*current*/ ctx[2].title + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*current*/ 4 && t5_value !== (t5_value = /*current*/ ctx[2].description + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*opacity*/ 8 && div3_class_value !== (div3_class_value = "w-full flex flex-col justify-end items-start transition-opacity " + /*opacity*/ ctx[3])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (dirty & /*current*/ 4) {
    				set_style(div3, "background-image", "url(" + /*current*/ ctx[2].url + ")");
    			}

    			if (dirty & /*location, setItem, data*/ 67) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sleep$3(ms = 0) {
    	return new Promise(cue => setTimeout(cue, ms));
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-gallery2', slots, []);
    	let { data = "[]" } = $$props;
    	let { src = null } = $$props;
    	let current;
    	let opacity = "opacity-1";
    	let location = 0;
    	let timer = setTimer();

    	onMount(async () => {
    		console.log("this is a path", data);

    		if (src) {
    			console.log("this is a path");
    			let response = await fetch(src);
    			$$invalidate(0, data = await response.json());
    		} else {
    			$$invalidate(0, data = JSON.parse(data));
    		}

    		$$invalidate(2, current = data[0]);
    	});

    	function setTimer() {
    		return setInterval(
    			async function () {
    				$$invalidate(3, opacity = `opacity-0 duration-1000 ease-linear`);
    				await sleep$3(1050);
    				$$invalidate(1, location = (location + 1) % data.length);
    				$$invalidate(3, opacity = `opacity-1 duration-1000 ease-linear`);
    			},
    			15000
    		);
    	}

    	async function nextItem() {
    		$$invalidate(3, opacity = `opacity-0 duration-1000 ease-linear`);
    		await sleep$3(1050);
    		$$invalidate(1, location = (location + 1) % data.length);
    		$$invalidate(3, opacity = `opacity-1 duration-1000 ease-linear`);
    	}

    	async function prevItem() {
    		$$invalidate(3, opacity = `opacity-0 duration-1000 ease-linear`);
    		await sleep$3(1050);
    		$$invalidate(1, location = (location + data.length - 1) % data.length);
    		$$invalidate(3, opacity = `opacity-1 duration-1000 ease-linear`);
    	}

    	function setItem(current) {
    		console.log("test", current);
    		$$invalidate(1, location = current);
    		clearInterval(timer);
    		timer = setTimer();
    	}

    	const writable_props = ['data', 'src'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<mc-gallery2> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => setItem(i);

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('src' in $$props) $$invalidate(7, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		data,
    		src,
    		current,
    		opacity,
    		location,
    		timer,
    		setTimer,
    		nextItem,
    		prevItem,
    		setItem,
    		sleep: sleep$3
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('src' in $$props) $$invalidate(7, src = $$props.src);
    		if ('current' in $$props) $$invalidate(2, current = $$props.current);
    		if ('opacity' in $$props) $$invalidate(3, opacity = $$props.opacity);
    		if ('location' in $$props) $$invalidate(1, location = $$props.location);
    		if ('timer' in $$props) timer = $$props.timer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, location*/ 3) {
    			$$invalidate(2, current = data[location]);
    		}
    	};

    	return [
    		data,
    		location,
    		current,
    		opacity,
    		nextItem,
    		prevItem,
    		setItem,
    		src,
    		click_handler
    	];
    }

    class Gallery2 extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$j,
    			create_fragment$j,
    			safe_not_equal,
    			{ data: 0, src: 7 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["data", "src"];
    	}

    	get data() {
    		return this.$$.ctx[0];
    	}

    	set data(data) {
    		this.$$set({ data });
    		flush();
    	}

    	get src() {
    		return this.$$.ctx[7];
    	}

    	set src(src) {
    		this.$$set({ src });
    		flush();
    	}
    }

    customElements.define("mc-gallery2", Gallery2);

    /* src\gallery\GalleryInfo.svelte generated by Svelte v3.42.6 */

    const file$i = "src\\gallery\\GalleryInfo.svelte";

    function create_fragment$i(ctx) {
    	let link;
    	let t0;
    	let div2;
    	let div0;
    	let p0;
    	let t1;
    	let t2;
    	let div1;
    	let p1;
    	let t3;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			p1 = element("p");
    			t3 = text(/*description*/ ctx[1]);
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$i, 7, 0, 118);
    			attr_dev(p0, "class", "p-5 bg-secondary text-white");
    			add_location(p0, file$i, 11, 8, 262);
    			attr_dev(div0, "class", "w-auto mb-2");
    			add_location(div0, file$i, 10, 4, 227);
    			attr_dev(p1, "class", "bg-black bg-opacity-70 text-white p-5");
    			add_location(p1, file$i, 14, 8, 365);
    			attr_dev(div1, "class", "w-auto mb-5");
    			add_location(div1, file$i, 13, 4, 330);
    			attr_dev(div2, "class", "w-full flex flex-col justify-end items-start");
    			add_location(div2, file$i, 9, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);
    			if (dirty & /*description*/ 2) set_data_dev(t3, /*description*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-galleryinfo', slots, []);
    	let { title } = $$props;
    	let { description } = $$props;
    	const writable_props = ['title', 'description'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-galleryinfo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({ title, description });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, description];
    }

    class GalleryInfo extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$i,
    			create_fragment$i,
    			safe_not_equal,
    			{ title: 0, description: 1 },
    			null
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<mc-galleryinfo> was created without expected prop 'title'");
    		}

    		if (/*description*/ ctx[1] === undefined && !('description' in props)) {
    			console.warn("<mc-galleryinfo> was created without expected prop 'description'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["title", "description"];
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$$set({ title });
    		flush();
    	}

    	get description() {
    		return this.$$.ctx[1];
    	}

    	set description(description) {
    		this.$$set({ description });
    		flush();
    	}
    }

    customElements.define("mc-galleryinfo", GalleryInfo);

    /* src\gallery\GalleryInsert.svelte generated by Svelte v3.42.6 */

    const { console: console_1$5 } = globals;
    const file$h = "src\\gallery\\GalleryInsert.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (70:8) {#each data as item,i}
    function create_each_block$2(ctx) {
    	let li;
    	let button;
    	let button_class_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*i*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t = space();

    			attr_dev(button, "class", button_class_value = "rounded-full w-3 h-3 m-1 " + (/*location*/ ctx[1] === /*i*/ ctx[14]
    			? 'bg-primary'
    			: 'bg-white'));

    			add_location(button, file$h, 71, 16, 1978);
    			add_location(li, file$h, 70, 12, 1956);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*location*/ 2 && button_class_value !== (button_class_value = "rounded-full w-3 h-3 m-1 " + (/*location*/ ctx[1] === /*i*/ ctx[14]
    			? 'bg-primary'
    			: 'bg-white'))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(70:8) {#each data as item,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let ul;
    	let t2;
    	let div5;
    	let div4;
    	let div0;
    	let button0;
    	let span0;
    	let t3;
    	let div2;
    	let div1;
    	let t5;
    	let slot;
    	let t6;
    	let div3;
    	let button1;
    	let span1;
    	let mounted;
    	let dispose;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "rabbits";
    			t5 = space();
    			slot = element("slot");
    			t6 = space();
    			div3 = element("div");
    			button1 = element("button");
    			span1 = element("span");
    			this.c = noop;
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", /omni-cms/app.css");
    			add_location(link0, file$h, 64, 0, 1738);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "/fontawesome/css/all.min.css");
    			add_location(link1, file$h, 65, 0, 1781);
    			attr_dev(ul, "class", "flex w-full justify-center bg-secondary p-1");
    			add_location(ul, file$h, 68, 3, 1854);
    			attr_dev(span0, "class", "fas fa-angle-left");
    			add_location(span0, file$h, 79, 32, 2474);
    			attr_dev(button0, "class", "text-white text-lg w-12 h-full bg-primary");
    			add_location(button0, file$h, 78, 24, 2362);
    			attr_dev(div0, "class", "flex justify-center items-center w-13 bg-white");
    			add_location(div0, file$h, 77, 20, 2276);
    			add_location(div1, file$h, 83, 24, 2648);
    			add_location(slot, file$h, 84, 24, 2692);
    			add_location(div2, file$h, 82, 20, 2598);
    			attr_dev(span1, "class", "fas fa-angle-right");
    			add_location(span1, file$h, 88, 32, 2953);
    			attr_dev(button1, "class", "text-white text-lg w-12 h-full bg-primary");
    			add_location(button1, file$h, 87, 24, 2841);
    			attr_dev(div3, "class", "flex justify-center items-center w-13 bg-white");
    			add_location(div3, file$h, 86, 20, 2755);
    			attr_dev(div4, "class", "flex justify-center h-full w-full");
    			add_location(div4, file$h, 76, 16, 2207);
    			attr_dev(div5, "class", "h-48 md:h-96 bg-black");
    			add_location(div5, file$h, 75, 4, 2154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div2, t5);
    			append_dev(div2, slot);
    			/*div2_binding*/ ctx[7](div2);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(button1, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*prevItem*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*nextItem*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*location, setItem, data*/ 35) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div5);
    			/*div2_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sleep$2(ms = 0) {
    	return new Promise(cue => setTimeout(cue, ms));
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-galleryinsert', slots, []);
    	let location = 0;
    	let { data = [] } = $$props;
    	console.log(data);
    	let current;
    	let opacity = "opacity-1";
    	let timer = setTimer();
    	let slides;

    	onMount(async () => {
    		//data = JSON.parse(data);
    		current = data[location];

    		console.log(slides.children);
    		console.log(slides.querySelector("slot"));
    		let test = slides.querySelector("slot");
    		let test2 = test.shadowRoot;
    		console.log(test2);
    	});

    	function setTimer() {
    		return setInterval(
    			async function () {
    				opacity = `opacity-0 duration-1000 ease-linear`;
    				await sleep$2(1050);
    				$$invalidate(1, location = (location + 1) % data.length);
    				opacity = `opacity-1 duration-1000 ease-linear`;
    			},
    			10000
    		);
    	}

    	async function nextItem() {
    		clearInterval(timer);
    		opacity = `opacity-0 duration-1000 ease-linear`;
    		await sleep$2(1050);
    		$$invalidate(1, location = (location + 1) % data.length);
    		timer = setTimer();
    		opacity = `opacity-1 duration-1000 ease-linear`;
    		console.log(slides.children);
    		console.log(slides.querySelector("slot"));
    	}

    	function prevItem() {
    		$$invalidate(1, location = (location + data.length - 1) % data.length);
    		clearInterval(timer);
    		timer = setTimer();
    	}

    	function setItem(current) {
    		console.log("test", current);
    		$$invalidate(1, location = current);
    		clearInterval(timer);
    		timer = setTimer();
    	}

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<mc-galleryinsert> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => setItem(i);

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			slides = $$value;
    			$$invalidate(2, slides);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		location,
    		data,
    		current,
    		opacity,
    		timer,
    		slides,
    		setTimer,
    		nextItem,
    		prevItem,
    		setItem,
    		sleep: sleep$2
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(1, location = $$props.location);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('current' in $$props) current = $$props.current;
    		if ('opacity' in $$props) opacity = $$props.opacity;
    		if ('timer' in $$props) timer = $$props.timer;
    		if ('slides' in $$props) $$invalidate(2, slides = $$props.slides);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, location*/ 3) {
    			current = data[location];
    		}
    	};

    	return [
    		data,
    		location,
    		slides,
    		nextItem,
    		prevItem,
    		setItem,
    		click_handler,
    		div2_binding
    	];
    }

    class GalleryInsert extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$h,
    			create_fragment$h,
    			safe_not_equal,
    			{ data: 0 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["data"];
    	}

    	get data() {
    		return this.$$.ctx[0];
    	}

    	set data(data) {
    		this.$$set({ data });
    		flush();
    	}
    }

    customElements.define("mc-galleryinsert", GalleryInsert);

    /* src\navbar\Navbar.svelte generated by Svelte v3.42.6 */

    const file$g = "src\\navbar\\Navbar.svelte";

    function create_fragment$g(ctx) {
    	let link;
    	let t0;
    	let section;
    	let div31;
    	let mc_navdropdown0;
    	let ul0;
    	let mc_navlink0;
    	let a0;
    	let t2;
    	let mc_navlink1;
    	let a1;
    	let t4;
    	let mc_navlink2;
    	let a2;
    	let t6;
    	let mc_navlink3;
    	let a3;
    	let t8;
    	let mc_navlink4;
    	let a4;
    	let t10;
    	let ul7;
    	let mc_navdropdown1;
    	let div6;
    	let div0;
    	let t12;
    	let div5;
    	let div2;
    	let div1;
    	let t14;
    	let div4;
    	let div3;
    	let t15;
    	let ul1;
    	let li0;
    	let a5;
    	let t17;
    	let li1;
    	let a6;
    	let t19;
    	let li2;
    	let a7;
    	let t21;
    	let li3;
    	let a8;
    	let t23;
    	let li4;
    	let a9;
    	let t25;
    	let li5;
    	let a10;
    	let t27;
    	let li6;
    	let a11;
    	let t29;
    	let mc_navdropdown2;
    	let div13;
    	let div7;
    	let t31;
    	let div12;
    	let div9;
    	let div8;
    	let t33;
    	let div11;
    	let div10;
    	let t35;
    	let ul2;
    	let li7;
    	let a12;
    	let t37;
    	let li8;
    	let a13;
    	let t39;
    	let li9;
    	let a14;
    	let t41;
    	let li10;
    	let a15;
    	let t43;
    	let li11;
    	let a16;
    	let t45;
    	let mc_navdropdown3;
    	let div20;
    	let div14;
    	let t47;
    	let div19;
    	let div16;
    	let div15;
    	let t49;
    	let ul3;
    	let li12;
    	let a17;
    	let t51;
    	let li13;
    	let a18;
    	let t53;
    	let li14;
    	let a19;
    	let t55;
    	let div18;
    	let div17;
    	let t57;
    	let ul4;
    	let li15;
    	let a20;
    	let t59;
    	let li16;
    	let a21;
    	let t61;
    	let mc_navdropdown4;
    	let div25;
    	let div21;
    	let t63;
    	let div24;
    	let div23;
    	let div22;
    	let t64;
    	let ul5;
    	let li17;
    	let a22;
    	let t66;
    	let li18;
    	let a23;
    	let t68;
    	let li19;
    	let a24;
    	let t70;
    	let li20;
    	let a25;
    	let t72;
    	let li21;
    	let a26;
    	let t74;
    	let mc_navdropdown5;
    	let div30;
    	let div26;
    	let t76;
    	let div29;
    	let div28;
    	let div27;
    	let t77;
    	let ul6;
    	let li22;
    	let a27;
    	let t79;
    	let li23;
    	let a28;
    	let t81;
    	let li24;
    	let a29;
    	let t83;
    	let li25;
    	let a30;
    	let t85;
    	let mc_navlink5;
    	let a31;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			section = element("section");
    			div31 = element("div");
    			mc_navdropdown0 = element("mc-navdropdown");
    			ul0 = element("ul");
    			mc_navlink0 = element("mc-navlink");
    			a0 = element("a");
    			a0.textContent = "About";
    			t2 = space();
    			mc_navlink1 = element("mc-navlink");
    			a1 = element("a");
    			a1.textContent = "Academics";
    			t4 = space();
    			mc_navlink2 = element("mc-navlink");
    			a2 = element("a");
    			a2.textContent = "Admissions";
    			t6 = space();
    			mc_navlink3 = element("mc-navlink");
    			a3 = element("a");
    			a3.textContent = "Athletics";
    			t8 = space();
    			mc_navlink4 = element("mc-navlink");
    			a4 = element("a");
    			a4.textContent = "NEWS";
    			t10 = space();
    			ul7 = element("ul");
    			mc_navdropdown1 = element("mc-navdropdown");
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "About";
    			t12 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "Internationally recognized in both Performing Arts, as well as it's top-ranked College of Computer Science & Engineering, GU offers students the opportunity to collaborate with the world's best and brightest faculty in multiple disciplines, all in an intimate, small-town campus setting.";
    			t14 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t15 = space();
    			ul1 = element("ul");
    			li0 = element("li");
    			a5 = element("a");
    			a5.textContent = "History";
    			t17 = space();
    			li1 = element("li");
    			a6 = element("a");
    			a6.textContent = "President's Page";
    			t19 = space();
    			li2 = element("li");
    			a7 = element("a");
    			a7.textContent = "Mission";
    			t21 = space();
    			li3 = element("li");
    			a8 = element("a");
    			a8.textContent = "Blog";
    			t23 = space();
    			li4 = element("li");
    			a9 = element("a");
    			a9.textContent = "Campus Map";
    			t25 = space();
    			li5 = element("li");
    			a10 = element("a");
    			a10.textContent = "Contact Us";
    			t27 = space();
    			li6 = element("li");
    			a11 = element("a");
    			a11.textContent = "Events";
    			t29 = space();
    			mc_navdropdown2 = element("mc-navdropdown");
    			div13 = element("div");
    			div7 = element("div");
    			div7.textContent = "Academics";
    			t31 = space();
    			div12 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "Every class offered at GU averages a 20:1 student-to-faculty ratio, providing the\r\n                            quality attention necessary for every student’s success. In addition, many faculty\r\n                            members participate in our tutoring program “After Hours”, giving students the extra\r\n                            help they need late into the night.";
    			t33 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div10.textContent = "Current Students";
    			t35 = space();
    			ul2 = element("ul");
    			li7 = element("li");
    			a12 = element("a");
    			a12.textContent = "Course Catalog";
    			t37 = space();
    			li8 = element("li");
    			a13 = element("a");
    			a13.textContent = "Library";
    			t39 = space();
    			li9 = element("li");
    			a14 = element("a");
    			a14.textContent = "Study Abroad";
    			t41 = space();
    			li10 = element("li");
    			a15 = element("a");
    			a15.textContent = "Final Exam Schedule";
    			t43 = space();
    			li11 = element("li");
    			a16 = element("a");
    			a16.textContent = "Faculty Directory";
    			t45 = space();
    			mc_navdropdown3 = element("mc-navdropdown");
    			div20 = element("div");
    			div14 = element("div");
    			div14.textContent = "Admissions";
    			t47 = space();
    			div19 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			div15.textContent = "Future Students";
    			t49 = space();
    			ul3 = element("ul");
    			li12 = element("li");
    			a17 = element("a");
    			a17.textContent = "Undergraduate";
    			t51 = space();
    			li13 = element("li");
    			a18 = element("a");
    			a18.textContent = "Graduate";
    			t53 = space();
    			li14 = element("li");
    			a19 = element("a");
    			a19.textContent = "Transfer Students";
    			t55 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div17.textContent = "Apply Now!";
    			t57 = space();
    			ul4 = element("ul");
    			li15 = element("li");
    			a20 = element("a");
    			a20.textContent = "TrueCost Calculator";
    			t59 = space();
    			li16 = element("li");
    			a21 = element("a");
    			a21.textContent = "Request information";
    			t61 = space();
    			mc_navdropdown4 = element("mc-navdropdown");
    			div25 = element("div");
    			div21 = element("div");
    			div21.textContent = "Athletics";
    			t63 = space();
    			div24 = element("div");
    			div23 = element("div");
    			div22 = element("div");
    			t64 = space();
    			ul5 = element("ul");
    			li17 = element("li");
    			a22 = element("a");
    			a22.textContent = "Gallena Gophers";
    			t66 = space();
    			li18 = element("li");
    			a23 = element("a");
    			a23.textContent = "University Recreation";
    			t68 = space();
    			li19 = element("li");
    			a24 = element("a");
    			a24.textContent = "Prospective Athletes";
    			t70 = space();
    			li20 = element("li");
    			a25 = element("a");
    			a25.textContent = "Tailgating Policy";
    			t72 = space();
    			li21 = element("li");
    			a26 = element("a");
    			a26.textContent = "Ticketing";
    			t74 = space();
    			mc_navdropdown5 = element("mc-navdropdown");
    			div30 = element("div");
    			div26 = element("div");
    			div26.textContent = "Campus Life";
    			t76 = space();
    			div29 = element("div");
    			div28 = element("div");
    			div27 = element("div");
    			t77 = space();
    			ul6 = element("ul");
    			li22 = element("li");
    			a27 = element("a");
    			a27.textContent = "Clubs & Organizations";
    			t79 = space();
    			li23 = element("li");
    			a28 = element("a");
    			a28.textContent = "Housing & Dining";
    			t81 = space();
    			li24 = element("li");
    			a29 = element("a");
    			a29.textContent = "Student Union";
    			t83 = space();
    			li25 = element("li");
    			a30 = element("a");
    			a30.textContent = "Traditions";
    			t85 = space();
    			mc_navlink5 = element("mc-navlink");
    			a31 = element("a");
    			a31.textContent = "NEWS";
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /*css*/ ctx[0]);
    			add_location(link, file$g, 6, 0, 95);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$g, 13, 24, 438);
    			add_location(mc_navlink0, file$g, 12, 20, 400);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$g, 16, 24, 555);
    			add_location(mc_navlink1, file$g, 15, 20, 517);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$g, 19, 24, 676);
    			add_location(mc_navlink2, file$g, 18, 20, 638);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$g, 22, 24, 798);
    			add_location(mc_navlink3, file$g, 21, 20, 760);
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$g, 25, 24, 919);
    			add_location(mc_navlink4, file$g, 24, 20, 881);
    			attr_dev(ul0, "class", "text-secondary text-xl w-full");
    			add_location(ul0, file$g, 11, 17, 336);
    			set_custom_element_data(mc_navdropdown0, "class", "md:hidden list-none");
    			set_custom_element_data(mc_navdropdown0, "title", "Menu");
    			add_location(mc_navdropdown0, file$g, 10, 11, 260);
    			attr_dev(div0, "class", "text-2xl pb-3");
    			add_location(div0, file$g, 32, 20, 1184);
    			attr_dev(div1, "class", "text-md p-2");
    			add_location(div1, file$g, 35, 28, 1345);
    			attr_dev(div2, "class", "w-96");
    			add_location(div2, file$g, 34, 24, 1297);
    			attr_dev(div3, "class", "text-xl underline mb-1");
    			add_location(div3, file$g, 38, 28, 1774);
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$g, 40, 36, 1919);
    			add_location(li0, file$g, 40, 32, 1915);
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$g, 41, 36, 1985);
    			add_location(li1, file$g, 41, 32, 1981);
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$g, 42, 36, 2060);
    			add_location(li2, file$g, 42, 32, 2056);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$g, 43, 36, 2126);
    			add_location(li3, file$g, 43, 32, 2122);
    			attr_dev(a9, "href", "#");
    			add_location(a9, file$g, 44, 36, 2189);
    			add_location(li4, file$g, 44, 32, 2185);
    			attr_dev(a10, "href", "#");
    			add_location(a10, file$g, 45, 36, 2258);
    			add_location(li5, file$g, 45, 32, 2254);
    			attr_dev(a11, "href", "#");
    			add_location(a11, file$g, 46, 36, 2327);
    			add_location(li6, file$g, 46, 32, 2323);
    			attr_dev(ul1, "class", "list-disc text-lg px-3");
    			add_location(ul1, file$g, 39, 28, 1846);
    			attr_dev(div4, "class", "w-64 mx-2");
    			add_location(div4, file$g, 37, 24, 1721);
    			attr_dev(div5, "class", "flex flex-row");
    			add_location(div5, file$g, 33, 20, 1244);
    			attr_dev(div6, "class", "flex flex-col w-full");
    			add_location(div6, file$g, 31, 16, 1128);
    			set_custom_element_data(mc_navdropdown1, "title", "ABOUT");
    			add_location(mc_navdropdown1, file$g, 30, 12, 1080);
    			attr_dev(div7, "class", "text-2xl pb-3");
    			add_location(div7, file$g, 54, 20, 2626);
    			attr_dev(div8, "class", "text-md p-2");
    			add_location(div8, file$g, 57, 28, 2791);
    			attr_dev(div9, "class", "w-96");
    			add_location(div9, file$g, 56, 24, 2743);
    			attr_dev(div10, "class", "text-xl underline mb-1");
    			add_location(div10, file$g, 63, 28, 3305);
    			attr_dev(a12, "href", "#");
    			add_location(a12, file$g, 65, 36, 3466);
    			add_location(li7, file$g, 65, 32, 3462);
    			attr_dev(a13, "href", "#");
    			add_location(a13, file$g, 66, 36, 3539);
    			add_location(li8, file$g, 66, 32, 3535);
    			attr_dev(a14, "href", "#");
    			add_location(a14, file$g, 67, 36, 3605);
    			add_location(li9, file$g, 67, 32, 3601);
    			attr_dev(a15, "href", "#");
    			add_location(a15, file$g, 68, 36, 3676);
    			add_location(li10, file$g, 68, 32, 3672);
    			attr_dev(a16, "href", "#");
    			add_location(a16, file$g, 69, 36, 3754);
    			add_location(li11, file$g, 69, 32, 3750);
    			attr_dev(ul2, "class", "list-disc text-lg px-5");
    			add_location(ul2, file$g, 64, 28, 3393);
    			attr_dev(div11, "class", "w-64 mx-2");
    			add_location(div11, file$g, 62, 24, 3252);
    			attr_dev(div12, "class", "flex flex-row");
    			add_location(div12, file$g, 55, 20, 2690);
    			attr_dev(div13, "class", "flex flex-col w-full");
    			add_location(div13, file$g, 53, 16, 2570);
    			set_custom_element_data(mc_navdropdown2, "title", "ACADEMICS");
    			add_location(mc_navdropdown2, file$g, 52, 12, 2518);
    			attr_dev(div14, "class", "text-2xl pb-3");
    			add_location(div14, file$g, 77, 20, 4065);
    			attr_dev(div15, "class", "text-xl underline mb-1");
    			add_location(div15, file$g, 80, 28, 4236);
    			attr_dev(a17, "href", "#");
    			add_location(a17, file$g, 82, 36, 4396);
    			add_location(li12, file$g, 82, 32, 4392);
    			attr_dev(a18, "href", "#");
    			add_location(a18, file$g, 83, 36, 4468);
    			add_location(li13, file$g, 83, 32, 4464);
    			attr_dev(a19, "href", "#");
    			add_location(a19, file$g, 84, 36, 4535);
    			add_location(li14, file$g, 84, 32, 4531);
    			attr_dev(ul3, "class", "list-disc text-lg px-5");
    			add_location(ul3, file$g, 81, 28, 4323);
    			attr_dev(div16, "class", "w-64 mx-2");
    			add_location(div16, file$g, 79, 24, 4183);
    			attr_dev(div17, "class", "text-xl underline mb-1");
    			add_location(div17, file$g, 88, 28, 4719);
    			attr_dev(a20, "href", "#");
    			add_location(a20, file$g, 90, 36, 4874);
    			add_location(li15, file$g, 90, 32, 4870);
    			attr_dev(a21, "href", "#");
    			add_location(a21, file$g, 91, 36, 4952);
    			add_location(li16, file$g, 91, 32, 4948);
    			attr_dev(ul4, "class", "list-disc text-lg px-5");
    			add_location(ul4, file$g, 89, 28, 4801);
    			attr_dev(div18, "class", "w-64 mx-2");
    			add_location(div18, file$g, 87, 24, 4666);
    			attr_dev(div19, "class", "flex flex-row");
    			add_location(div19, file$g, 78, 20, 4130);
    			attr_dev(div20, "class", "flex flex-col w-full");
    			add_location(div20, file$g, 76, 16, 4009);
    			set_custom_element_data(mc_navdropdown3, "title", "ADMISSIONS");
    			add_location(mc_navdropdown3, file$g, 75, 12, 3956);
    			attr_dev(div21, "class", "text-2xl pb-3");
    			add_location(div21, file$g, 99, 20, 5264);
    			attr_dev(div22, "class", "text-xl underline mb-1");
    			add_location(div22, file$g, 102, 28, 5434);
    			attr_dev(a22, "href", "#");
    			add_location(a22, file$g, 104, 36, 5579);
    			add_location(li17, file$g, 104, 32, 5575);
    			attr_dev(a23, "href", "#");
    			add_location(a23, file$g, 105, 36, 5653);
    			add_location(li18, file$g, 105, 32, 5649);
    			attr_dev(a24, "href", "#");
    			add_location(a24, file$g, 106, 36, 5733);
    			add_location(li19, file$g, 106, 32, 5729);
    			attr_dev(a25, "href", "#");
    			add_location(a25, file$g, 107, 36, 5812);
    			add_location(li20, file$g, 107, 32, 5808);
    			attr_dev(a26, "href", "#");
    			add_location(a26, file$g, 108, 36, 5888);
    			add_location(li21, file$g, 108, 32, 5884);
    			attr_dev(ul5, "class", "list-disc text-lg px-5");
    			add_location(ul5, file$g, 103, 28, 5506);
    			attr_dev(div23, "class", "w-64 mx-2");
    			add_location(div23, file$g, 101, 24, 5381);
    			attr_dev(div24, "class", "flex flex-row");
    			add_location(div24, file$g, 100, 20, 5328);
    			attr_dev(div25, "class", "flex flex-col w-full");
    			add_location(div25, file$g, 98, 16, 5208);
    			set_custom_element_data(mc_navdropdown4, "title", "ATHLETICS");
    			add_location(mc_navdropdown4, file$g, 97, 12, 5156);
    			attr_dev(div26, "class", "text-2xl pb-3");
    			add_location(div26, file$g, 115, 20, 6164);
    			attr_dev(div27, "class", "text-xl underline mb-1");
    			add_location(div27, file$g, 118, 28, 6336);
    			attr_dev(a27, "href", "#");
    			add_location(a27, file$g, 120, 36, 6481);
    			add_location(li22, file$g, 120, 32, 6477);
    			attr_dev(a28, "href", "#");
    			add_location(a28, file$g, 121, 36, 6561);
    			add_location(li23, file$g, 121, 32, 6557);
    			attr_dev(a29, "href", "#");
    			add_location(a29, file$g, 122, 36, 6636);
    			add_location(li24, file$g, 122, 32, 6632);
    			attr_dev(a30, "href", "#");
    			add_location(a30, file$g, 123, 36, 6708);
    			add_location(li25, file$g, 123, 32, 6704);
    			attr_dev(ul6, "class", "list-disc text-lg px-5");
    			add_location(ul6, file$g, 119, 28, 6408);
    			attr_dev(div28, "class", "w-64 mx-2");
    			add_location(div28, file$g, 117, 24, 6283);
    			attr_dev(div29, "class", "flex flex-row");
    			add_location(div29, file$g, 116, 20, 6230);
    			attr_dev(div30, "class", "flex flex-col w-full");
    			add_location(div30, file$g, 114, 16, 6108);
    			set_custom_element_data(mc_navdropdown5, "title", "CAMPUS LIFE");
    			add_location(mc_navdropdown5, file$g, 113, 12, 6054);
    			attr_dev(a31, "href", "#");
    			attr_dev(a31, "class", "text-white");
    			add_location(a31, file$g, 129, 16, 6905);
    			add_location(mc_navlink5, file$g, 128, 12, 6875);
    			attr_dev(ul7, "class", "hidden md:flex");
    			add_location(ul7, file$g, 29, 8, 1039);
    			attr_dev(div31, "class", "flex flex-row items-center mx-auto max-w-7xl");
    			add_location(div31, file$g, 9, 2, 189);
    			attr_dev(section, "class", "bg-secondary text-white w-full");
    			add_location(section, file$g, 8, 0, 137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div31);
    			append_dev(div31, mc_navdropdown0);
    			append_dev(mc_navdropdown0, ul0);
    			append_dev(ul0, mc_navlink0);
    			append_dev(mc_navlink0, a0);
    			append_dev(ul0, t2);
    			append_dev(ul0, mc_navlink1);
    			append_dev(mc_navlink1, a1);
    			append_dev(ul0, t4);
    			append_dev(ul0, mc_navlink2);
    			append_dev(mc_navlink2, a2);
    			append_dev(ul0, t6);
    			append_dev(ul0, mc_navlink3);
    			append_dev(mc_navlink3, a3);
    			append_dev(ul0, t8);
    			append_dev(ul0, mc_navlink4);
    			append_dev(mc_navlink4, a4);
    			append_dev(div31, t10);
    			append_dev(div31, ul7);
    			append_dev(ul7, mc_navdropdown1);
    			append_dev(mc_navdropdown1, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div4, t15);
    			append_dev(div4, ul1);
    			append_dev(ul1, li0);
    			append_dev(li0, a5);
    			append_dev(ul1, t17);
    			append_dev(ul1, li1);
    			append_dev(li1, a6);
    			append_dev(ul1, t19);
    			append_dev(ul1, li2);
    			append_dev(li2, a7);
    			append_dev(ul1, t21);
    			append_dev(ul1, li3);
    			append_dev(li3, a8);
    			append_dev(ul1, t23);
    			append_dev(ul1, li4);
    			append_dev(li4, a9);
    			append_dev(ul1, t25);
    			append_dev(ul1, li5);
    			append_dev(li5, a10);
    			append_dev(ul1, t27);
    			append_dev(ul1, li6);
    			append_dev(li6, a11);
    			append_dev(ul7, t29);
    			append_dev(ul7, mc_navdropdown2);
    			append_dev(mc_navdropdown2, div13);
    			append_dev(div13, div7);
    			append_dev(div13, t31);
    			append_dev(div13, div12);
    			append_dev(div12, div9);
    			append_dev(div9, div8);
    			append_dev(div12, t33);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div11, t35);
    			append_dev(div11, ul2);
    			append_dev(ul2, li7);
    			append_dev(li7, a12);
    			append_dev(ul2, t37);
    			append_dev(ul2, li8);
    			append_dev(li8, a13);
    			append_dev(ul2, t39);
    			append_dev(ul2, li9);
    			append_dev(li9, a14);
    			append_dev(ul2, t41);
    			append_dev(ul2, li10);
    			append_dev(li10, a15);
    			append_dev(ul2, t43);
    			append_dev(ul2, li11);
    			append_dev(li11, a16);
    			append_dev(ul7, t45);
    			append_dev(ul7, mc_navdropdown3);
    			append_dev(mc_navdropdown3, div20);
    			append_dev(div20, div14);
    			append_dev(div20, t47);
    			append_dev(div20, div19);
    			append_dev(div19, div16);
    			append_dev(div16, div15);
    			append_dev(div16, t49);
    			append_dev(div16, ul3);
    			append_dev(ul3, li12);
    			append_dev(li12, a17);
    			append_dev(ul3, t51);
    			append_dev(ul3, li13);
    			append_dev(li13, a18);
    			append_dev(ul3, t53);
    			append_dev(ul3, li14);
    			append_dev(li14, a19);
    			append_dev(div19, t55);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div18, t57);
    			append_dev(div18, ul4);
    			append_dev(ul4, li15);
    			append_dev(li15, a20);
    			append_dev(ul4, t59);
    			append_dev(ul4, li16);
    			append_dev(li16, a21);
    			append_dev(ul7, t61);
    			append_dev(ul7, mc_navdropdown4);
    			append_dev(mc_navdropdown4, div25);
    			append_dev(div25, div21);
    			append_dev(div25, t63);
    			append_dev(div25, div24);
    			append_dev(div24, div23);
    			append_dev(div23, div22);
    			append_dev(div23, t64);
    			append_dev(div23, ul5);
    			append_dev(ul5, li17);
    			append_dev(li17, a22);
    			append_dev(ul5, t66);
    			append_dev(ul5, li18);
    			append_dev(li18, a23);
    			append_dev(ul5, t68);
    			append_dev(ul5, li19);
    			append_dev(li19, a24);
    			append_dev(ul5, t70);
    			append_dev(ul5, li20);
    			append_dev(li20, a25);
    			append_dev(ul5, t72);
    			append_dev(ul5, li21);
    			append_dev(li21, a26);
    			append_dev(ul7, t74);
    			append_dev(ul7, mc_navdropdown5);
    			append_dev(mc_navdropdown5, div30);
    			append_dev(div30, div26);
    			append_dev(div30, t76);
    			append_dev(div30, div29);
    			append_dev(div29, div28);
    			append_dev(div28, div27);
    			append_dev(div28, t77);
    			append_dev(div28, ul6);
    			append_dev(ul6, li22);
    			append_dev(li22, a27);
    			append_dev(ul6, t79);
    			append_dev(ul6, li23);
    			append_dev(li23, a28);
    			append_dev(ul6, t81);
    			append_dev(ul6, li24);
    			append_dev(li24, a29);
    			append_dev(ul6, t83);
    			append_dev(ul6, li25);
    			append_dev(li25, a30);
    			append_dev(ul7, t85);
    			append_dev(ul7, mc_navlink5);
    			append_dev(mc_navlink5, a31);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*css*/ 1) {
    				attr_dev(link, "href", /*css*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-navbar', slots, []);
    	let { css = /omni-cms/app.css" } = $$props;
    	const writable_props = ['css'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('css' in $$props) $$invalidate(0, css = $$props.css);
    	};

    	$$self.$capture_state = () => ({ css });

    	$$self.$inject_state = $$props => {
    		if ('css' in $$props) $$invalidate(0, css = $$props.css);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [css];
    }

    class Navbar extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$g,
    			create_fragment$g,
    			safe_not_equal,
    			{ css: 0 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["css"];
    	}

    	get css() {
    		return this.$$.ctx[0];
    	}

    	set css(css) {
    		this.$$set({ css });
    		flush();
    	}
    }

    customElements.define("mc-navbar", Navbar);

    /* src\navbar\Navbar2.svelte generated by Svelte v3.42.6 */

    const file$f = "src\\navbar\\Navbar2.svelte";

    function create_fragment$f(ctx) {
    	let link;
    	let t0;
    	let section;
    	let div;
    	let mc_navdropdown;
    	let slot0;
    	let t1;
    	let slot1;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			section = element("section");
    			div = element("div");
    			mc_navdropdown = element("mc-navdropdown");
    			slot0 = element("slot");
    			t1 = space();
    			slot1 = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$f, 5, 0, 62);
    			attr_dev(slot0, "name", "mobile");
    			add_location(slot0, file$f, 11, 16, 298);
    			set_custom_element_data(mc_navdropdown, "class", "md:hidden list-none");
    			set_custom_element_data(mc_navdropdown, "title", "Menu");
    			add_location(mc_navdropdown, file$f, 10, 12, 223);
    			attr_dev(slot1, "name", "desktop");
    			attr_dev(slot1, "class", "hidden md:flex");
    			add_location(slot1, file$f, 13, 12, 370);
    			attr_dev(div, "class", "flex flex-row items-center mx-auto");
    			add_location(div, file$f, 9, 2, 161);
    			attr_dev(section, "class", "bg-secondary text-white w-full");
    			add_location(section, file$f, 8, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, mc_navdropdown);
    			append_dev(mc_navdropdown, slot0);
    			append_dev(div, t1);
    			append_dev(div, slot1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-navbar2', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-navbar2> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar2 extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$f,
    			create_fragment$f,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("mc-navbar2", Navbar2);

    /** Dispatch event on click outside of node */
    function clickOutside(node) {
      
        const handleClick = event => {
          if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
              new CustomEvent('click_outside', node)
            );
          }
        };
        document.addEventListener('click', handleClick, true);


        const handleEscape = event => {
            if (node && !node.contains(event.target) && !event.defaultPrevented) {
              node.dispatchEvent(
                new CustomEvent('press_escape', node)
              );
            }
          };
        document.addEventListener('keydown', function(event){
            if(event.key === "Escape"){
                handleEscape(event);
            }
        },true);
        
        const handleEnter = event => {
            if (node && !node.contains(event.target) && !event.defaultPrevented) {
              node.dispatchEvent(
                new CustomEvent('press_enter', node)
              );
            }
          };
        document.addEventListener('keydown', function(event){
            if(event.key === "Enter"){
                handleEnter(event);
            }
        },true);    
        
        return {
          destroy() {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleEscape, true);
          }
        }
      }

    /* src\navbar\Navdropdown.svelte generated by Svelte v3.42.6 */

    const { console: console_1$4 } = globals;
    const file$e = "src\\navbar\\Navdropdown.svelte";

    function create_fragment$e(ctx) {
    	let li;
    	let div0;
    	let button_1;
    	let t0;
    	let t1;
    	let span;
    	let span_class_value;
    	let t2;
    	let div1;
    	let slot;
    	let div1_class_value;
    	let li_class_value;
    	let t3;
    	let link0;
    	let t4;
    	let link1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			button_1 = element("button");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			span = element("span");
    			t2 = space();
    			div1 = element("div");
    			slot = element("slot");
    			t3 = space();
    			link0 = element("link");
    			t4 = space();
    			link1 = element("link");
    			this.c = noop;
    			attr_dev(span, "class", span_class_value = "fas text-sm text-white " + (/*active*/ ctx[2] ? 'fa-angle-down' : 'fa-angle-up'));
    			add_location(span, file$e, 35, 12, 961);
    			attr_dev(button_1, "class", "border-solid border-b-2 border-transparent text-white w-36 w-full text-center");
    			add_location(button_1, file$e, 33, 8, 811);
    			attr_dev(div0, "class", "h-full block");
    			add_location(div0, file$e, 32, 1, 754);
    			attr_dev(slot, "class", "w-full shadow");
    			add_location(slot, file$e, 39, 8, 1303);
    			attr_dev(div1, "class", div1_class_value = "absolute top-14 -left-2 bg-white text-primary z-30 p-5 border-secondary border-4 " + (/*active*/ ctx[2] ? null : 'hidden'));
    			add_location(div1, file$e, 38, 4, 1085);
    			attr_dev(li, "class", li_class_value = "relative h-full p-4 " + (/*active*/ ctx[2] ? 'border-white bg-primary' : null) + " hover:bg-primary");
    			add_location(li, file$e, 31, 0, 629);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", /*css*/ ctx[1]);
    			add_location(link0, file$e, 43, 0, 1361);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "/fontawesome/css/all.min.css");
    			add_location(link1, file$e, 44, 0, 1401);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(div0, button_1);
    			append_dev(button_1, t0);
    			append_dev(button_1, t1);
    			append_dev(button_1, span);
    			/*button_1_binding*/ ctx[7](button_1);
    			append_dev(li, t2);
    			append_dev(li, div1);
    			append_dev(div1, slot);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, link1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*setActive*/ ctx[4], false, false, false),
    					action_destroyer(clickOutside.call(null, div1)),
    					listen_dev(div1, "click_outside", /*handleClickOutside*/ ctx[5], false, false, false),
    					listen_dev(div1, "press_escape", /*handleEscape*/ ctx[6], false, false, false),
    					listen_dev(li, "blur", /*handleClickOutside*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*active*/ 4 && span_class_value !== (span_class_value = "fas text-sm text-white " + (/*active*/ ctx[2] ? 'fa-angle-down' : 'fa-angle-up'))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*active*/ 4 && div1_class_value !== (div1_class_value = "absolute top-14 -left-2 bg-white text-primary z-30 p-5 border-secondary border-4 " + (/*active*/ ctx[2] ? null : 'hidden'))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*active*/ 4 && li_class_value !== (li_class_value = "relative h-full p-4 " + (/*active*/ ctx[2] ? 'border-white bg-primary' : null) + " hover:bg-primary")) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (dirty & /*css*/ 2) {
    				attr_dev(link0, "href", /*css*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			/*button_1_binding*/ ctx[7](null);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(link1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-navdropdown', slots, []);
    	let active = false;
    	let button;
    	let { title = "Menu" } = $$props;
    	let { css = /omni-cms/app.css" } = $$props;

    	function setActive() {
    		console.log(active);
    		$$invalidate(2, active = !active);
    		console.log(active);
    	}

    	function handleClickOutside(event) {
    		console.log("hello");

    		if (active) {
    			$$invalidate(2, active = false);
    		}
    	}

    	function handleEscape(event) {
    		if (active) {
    			$$invalidate(2, active = false);
    			button.focus();
    		}
    	}

    	const writable_props = ['title', 'css'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<mc-navdropdown> was created with unknown prop '${key}'`);
    	});

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			button = $$value;
    			$$invalidate(3, button);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('css' in $$props) $$invalidate(1, css = $$props.css);
    	};

    	$$self.$capture_state = () => ({
    		clickOutside,
    		active,
    		button,
    		title,
    		css,
    		setActive,
    		handleClickOutside,
    		handleEscape
    	});

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('button' in $$props) $$invalidate(3, button = $$props.button);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('css' in $$props) $$invalidate(1, css = $$props.css);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		css,
    		active,
    		button,
    		setActive,
    		handleClickOutside,
    		handleEscape,
    		button_1_binding
    	];
    }

    class Navdropdown extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{ title: 0, css: 1 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["title", "css"];
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$$set({ title });
    		flush();
    	}

    	get css() {
    		return this.$$.ctx[1];
    	}

    	set css(css) {
    		this.$$set({ css });
    		flush();
    	}
    }

    customElements.define("mc-navdropdown", Navdropdown);

    /* src\navbar\NavLink.svelte generated by Svelte v3.42.6 */

    const file$d = "src\\navbar\\NavLink.svelte";

    function create_fragment$d(ctx) {
    	let li;
    	let slot;
    	let t;
    	let link;

    	const block = {
    		c: function create() {
    			li = element("li");
    			slot = element("slot");
    			t = space();
    			link = element("link");
    			this.c = noop;
    			add_location(slot, file$d, 6, 8, 121);
    			attr_dev(li, "class", "relative h-full p-4 hover:bg-primary");
    			add_location(li, file$d, 5, 0, 62);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$d, 9, 0, 145);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, slot);
    			insert_dev(target, t, anchor);
    			insert_dev(target, link, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-navlink', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-navlink> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NavLink extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$d,
    			create_fragment$d,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("mc-navlink", NavLink);

    /* src\FeaturedNews.svelte generated by Svelte v3.42.6 */

    const { console: console_1$3 } = globals;
    const file$c = "src\\FeaturedNews.svelte";

    function create_fragment$c(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let div19;
    	let div2;
    	let div0;
    	let t3;
    	let div1;
    	let button0;
    	let span0;
    	let t4;
    	let button1;
    	let span1;
    	let t5;
    	let div18;
    	let div7;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t11;
    	let div6;
    	let a0;
    	let div7_class_value;
    	let t13;
    	let div12;
    	let div8;
    	let t15;
    	let div9;
    	let t17;
    	let div10;
    	let t19;
    	let div11;
    	let a1;
    	let div12_class_value;
    	let t21;
    	let div17;
    	let div13;
    	let t23;
    	let div14;
    	let t25;
    	let div15;
    	let t27;
    	let div16;
    	let a2;
    	let div17_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			div19 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Featured News";
    			t3 = space();
    			div1 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t4 = space();
    			button1 = element("button");
    			span1 = element("span");
    			t5 = space();
    			div18 = element("div");
    			div7 = element("div");
    			div3 = element("div");
    			div3.textContent = "Study Abroad Information";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "July 01, 2016";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "All Gallena friends and family are welcome to join us on campus for our annual semester abroad discussion.";
    			t11 = space();
    			div6 = element("div");
    			a0 = element("a");
    			a0.textContent = "Read Article";
    			t13 = space();
    			div12 = element("div");
    			div8 = element("div");
    			div8.textContent = "Rabbit";
    			t15 = space();
    			div9 = element("div");
    			div9.textContent = "July 01, 2016";
    			t17 = space();
    			div10 = element("div");
    			div10.textContent = "Jumps over the fence";
    			t19 = space();
    			div11 = element("div");
    			a1 = element("a");
    			a1.textContent = "Read Article";
    			t21 = space();
    			div17 = element("div");
    			div13 = element("div");
    			div13.textContent = "Dog is here";
    			t23 = space();
    			div14 = element("div");
    			div14.textContent = "July 01, 2016";
    			t25 = space();
    			div15 = element("div");
    			div15.textContent = "All Gallena friends and family are welcome to join us on campus for our annual semester abroad discussion.";
    			t27 = space();
    			div16 = element("div");
    			a2 = element("a");
    			a2.textContent = "Read Article";
    			this.c = noop;
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", /omni-cms/app.css");
    			add_location(link0, file$c, 21, 0, 469);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "fontawesome/css/all.min.css");
    			add_location(link1, file$c, 22, 0, 512);
    			attr_dev(div0, "class", "text-2xl py-5 w-4/5");
    			add_location(div0, file$c, 26, 8, 661);
    			attr_dev(span0, "class", "far fa-arrow-alt-circle-left");
    			add_location(span0, file$c, 31, 16, 915);
    			attr_dev(button0, "class", "hover:text-secondary p-2");
    			add_location(button0, file$c, 30, 12, 836);
    			attr_dev(span1, "class", "far fa-arrow-alt-circle-right");
    			add_location(span1, file$c, 34, 16, 1081);
    			attr_dev(button1, "class", "hover:text-secondary p-2");
    			add_location(button1, file$c, 33, 12, 1002);
    			attr_dev(div1, "class", "py-5 w-1/5 text-3xl text-primary flex justify-end items-right");
    			add_location(div1, file$c, 29, 8, 747);
    			attr_dev(div2, "class", "flex");
    			add_location(div2, file$c, 25, 4, 633);
    			attr_dev(div3, "class", "text-xl");
    			add_location(div3, file$c, 40, 12, 1302);
    			add_location(div4, file$c, 41, 12, 1367);
    			attr_dev(div5, "class", "text-lg py-5");
    			add_location(div5, file$c, 42, 12, 1405);
    			attr_dev(a0, "href", "/test1.html");
    			add_location(a0, file$c, 43, 33, 1579);
    			attr_dev(div6, "class", "text-lg");
    			add_location(div6, file$c, 43, 12, 1558);
    			attr_dev(div7, "class", div7_class_value = "child bg-white " + (/*current*/ ctx[0] === 'a' ? 'fadeIn' : 'fadeOut'));
    			add_location(div7, file$c, 39, 8, 1219);
    			attr_dev(div8, "class", "text-xl");
    			add_location(div8, file$c, 46, 12, 1732);
    			add_location(div9, file$c, 47, 12, 1779);
    			attr_dev(div10, "class", "text-lg py-5");
    			add_location(div10, file$c, 48, 12, 1817);
    			attr_dev(a1, "href", "/test2.html");
    			add_location(a1, file$c, 49, 33, 1904);
    			attr_dev(div11, "class", "text-lg");
    			add_location(div11, file$c, 49, 12, 1883);
    			attr_dev(div12, "class", div12_class_value = "child bg-white " + (/*current*/ ctx[0] === 'b' ? 'fadeIn' : 'fadeOut'));
    			add_location(div12, file$c, 45, 8, 1649);
    			attr_dev(div13, "class", "text-xl");
    			add_location(div13, file$c, 52, 12, 2057);
    			add_location(div14, file$c, 53, 12, 2109);
    			attr_dev(div15, "class", "text-lg py-5");
    			add_location(div15, file$c, 54, 12, 2147);
    			attr_dev(a2, "href", "/test3.html");
    			add_location(a2, file$c, 55, 33, 2321);
    			attr_dev(div16, "class", "text-lg");
    			add_location(div16, file$c, 55, 12, 2300);
    			attr_dev(div17, "class", div17_class_value = "child bg-white " + (/*current*/ ctx[0] === 'c' ? 'fadeIn' : 'fadeOut'));
    			add_location(div17, file$c, 51, 8, 1974);
    			attr_dev(div18, "class", "parent");
    			add_location(div18, file$c, 38, 4, 1189);
    			attr_dev(div19, "class", "bg-gray-100 p-5 h-96 w-full shadow-lg");
    			add_location(div19, file$c, 24, 0, 576);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div19, anchor);
    			append_dev(div19, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(button0, span0);
    			append_dev(div1, t4);
    			append_dev(div1, button1);
    			append_dev(button1, span1);
    			append_dev(div19, t5);
    			append_dev(div19, div18);
    			append_dev(div18, div7);
    			append_dev(div7, div3);
    			append_dev(div7, t7);
    			append_dev(div7, div4);
    			append_dev(div7, t9);
    			append_dev(div7, div5);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, a0);
    			append_dev(div18, t13);
    			append_dev(div18, div12);
    			append_dev(div12, div8);
    			append_dev(div12, t15);
    			append_dev(div12, div9);
    			append_dev(div12, t17);
    			append_dev(div12, div10);
    			append_dev(div12, t19);
    			append_dev(div12, div11);
    			append_dev(div11, a1);
    			append_dev(div18, t21);
    			append_dev(div18, div17);
    			append_dev(div17, div13);
    			append_dev(div17, t23);
    			append_dev(div17, div14);
    			append_dev(div17, t25);
    			append_dev(div17, div15);
    			append_dev(div17, t27);
    			append_dev(div17, div16);
    			append_dev(div16, a2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*prevItem*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*nextItem*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*current*/ 1 && div7_class_value !== (div7_class_value = "child bg-white " + (/*current*/ ctx[0] === 'a' ? 'fadeIn' : 'fadeOut'))) {
    				attr_dev(div7, "class", div7_class_value);
    			}

    			if (dirty & /*current*/ 1 && div12_class_value !== (div12_class_value = "child bg-white " + (/*current*/ ctx[0] === 'b' ? 'fadeIn' : 'fadeOut'))) {
    				attr_dev(div12, "class", div12_class_value);
    			}

    			if (dirty & /*current*/ 1 && div17_class_value !== (div17_class_value = "child bg-white " + (/*current*/ ctx[0] === 'c' ? 'fadeIn' : 'fadeOut'))) {
    				attr_dev(div17, "class", div17_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div19);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-featurednews', slots, []);
    	let test = ["a", "b", "c"];
    	let location = 0;
    	let current = test[location];

    	function nextItem() {
    		location = (location + 1) % test.length;
    		$$invalidate(0, current = test[location]);
    		console.log(current);
    	}

    	function prevItem() {
    		location = (location + test.length - 1) % test.length;
    		$$invalidate(0, current = test[location]);
    		console.log(current);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<mc-featurednews> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		test,
    		location,
    		current,
    		nextItem,
    		prevItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('test' in $$props) test = $$props.test;
    		if ('location' in $$props) location = $$props.location;
    		if ('current' in $$props) $$invalidate(0, current = $$props.current);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [current, nextItem, prevItem];
    }

    class FeaturedNews extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.parent{display:grid}.fadeOut{visibility:hidden;opacity:0;z-index:0;transition:visibility 0s linear 1000ms, opacity 1000ms}.fadeIn{visibility:visible;opacity:1;z-index:0;transition:visibility 0s linear 0s, opacity 1000ms}.child{grid-area:1 / 1 / 2 / 2}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$c,
    			create_fragment$c,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("mc-featurednews", FeaturedNews);

    /* src\NewsItems.svelte generated by Svelte v3.42.6 */

    const { console: console_1$2 } = globals;
    const file$b = "src\\NewsItems.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (89:4) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading";
    			add_location(p, file$b, 89, 8, 3344);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(89:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if loaded}
    function create_if_block$1(ctx) {
    	let ul;
    	let each_value = /*feed*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$b, 72, 8, 2701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*feed, Date*/ 2) {
    				each_value = /*feed*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(72:4) {#if loaded}",
    		ctx
    	});

    	return block;
    }

    // (74:12) {#each feed as item}
    function create_each_block$1(ctx) {
    	let li;
    	let div5;
    	let div0;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t0;
    	let div4;
    	let div1;
    	let a0;
    	let t1_value = /*item*/ ctx[7].title + "";
    	let t1;
    	let a0_href_value;
    	let t2;
    	let div2;
    	let t3_value = new Date(Date.parse(/*item*/ ctx[7].pubDate)).toLocaleDateString() + "";
    	let t3;
    	let t4;
    	let div3;
    	let a1;
    	let t5;
    	let a1_href_value;
    	let t6;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div5 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			a0 = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			a1 = element("a");
    			t5 = text("Read article");
    			t6 = space();
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[7].media[0].title);
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[7].media[0].content)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$b, 77, 7, 2874);
    			attr_dev(div0, "class", "w-2/5 p-2");
    			add_location(div0, file$b, 76, 6, 2842);
    			attr_dev(a0, "href", a0_href_value = /*item*/ ctx[7].link);
    			add_location(a0, file$b, 80, 28, 3039);
    			attr_dev(div1, "class", "text-lg");
    			add_location(div1, file$b, 80, 7, 3018);
    			add_location(div2, file$b, 81, 7, 3092);
    			attr_dev(a1, "href", a1_href_value = /*item*/ ctx[7].link);
    			add_location(a1, file$b, 82, 29, 3191);
    			attr_dev(div3, "class", "self-end");
    			add_location(div3, file$b, 82, 7, 3169);
    			attr_dev(div4, "class", "flex flex-col justify-center w-3/5");
    			add_location(div4, file$b, 79, 6, 2961);
    			attr_dev(div5, "class", "flex flex-row m-2 shadow bg-white p-2");
    			add_location(div5, file$b, 75, 20, 2783);
    			add_location(li, file$b, 74, 16, 2757);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div5);
    			append_dev(div5, div0);
    			append_dev(div0, img);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, a0);
    			append_dev(a0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, a1);
    			append_dev(a1, t5);
    			append_dev(li, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*feed*/ 2 && img_alt_value !== (img_alt_value = /*item*/ ctx[7].media[0].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*feed*/ 2 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[7].media[0].content)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*feed*/ 2 && t1_value !== (t1_value = /*item*/ ctx[7].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*feed*/ 2 && a0_href_value !== (a0_href_value = /*item*/ ctx[7].link)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*feed*/ 2 && t3_value !== (t3_value = new Date(Date.parse(/*item*/ ctx[7].pubDate)).toLocaleDateString() + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*feed*/ 2 && a1_href_value !== (a1_href_value = /*item*/ ctx[7].link)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(74:12) {#each feed as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let link;

    	function select_block_type(ctx, dirty) {
    		if (/*loaded*/ ctx[2]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			link = element("link");
    			this.c = noop;
    			attr_dev(div0, "class", "text-2xl m-2");
    			add_location(div0, file$b, 70, 4, 2634);
    			attr_dev(div1, "class", "bg-gray-100 m-2 shadow-lg p-5");
    			add_location(div1, file$b, 69, 0, 2585);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$b, 93, 0, 3381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if_block.m(div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-newsitems', slots, []);
    	let { path } = $$props;
    	let { title } = $$props;
    	let { category = "" } = $$props;
    	let { total = 2 } = $$props;
    	let feed = [];
    	let loaded = false;

    	async function getXML2json(path) {
    		let articles = [];
    		let article = {};
    		article.media = [];
    		let mediacontent = {};

    		await fetch(path).then(res => res.text()).then(text => new window.DOMParser().parseFromString(text, "text/xml")).then(data => {
    			let channel = data.getElementsByTagName('channel');
    			let items = Array.prototype.slice.call(channel[0].children);

    			items.forEach(item => {
    				if (item.tagName === 'item') {
    					let kids = Array.prototype.slice.call(item.children);

    					kids.forEach(kid => {
    						if (kid.tagName === 'media:content') {
    							let media = Array.prototype.slice.call(kid.children);
    							mediacontent = { "content": kid.getAttribute("url") };
    							console.log(kid);

    							media.forEach(mediaitem => {
    								let tag = mediaitem.tagName.split(":")[1];
    								mediacontent[tag] = mediaitem.textContent;
    							});

    							article.media.push(mediacontent);
    						} else if (kid.tagName === 'category') {
    							console.log(kid);
    							article['category'] = `${article['category']},${kid.textContent}`;
    							console.log(article['category']);
    						} else {
    							article[kid.tagName] = kid.textContent;
    						}
    					});

    					articles.push(article);
    					article = {};
    					article.media = [];
    				}
    			});
    		});

    		return articles.filter(o => {
    			if (o.category) {
    				return o.category.includes(category);
    			}
    		}).slice(0, total);
    	}

    	onMount(async () => {
    		$$invalidate(1, feed = await getXML2json(path));
    		$$invalidate(2, loaded = true);
    		console.log(feed);
    	});

    	const writable_props = ['path', 'title', 'category', 'total'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<mc-newsitems> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('category' in $$props) $$invalidate(4, category = $$props.category);
    		if ('total' in $$props) $$invalidate(5, total = $$props.total);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		path,
    		title,
    		category,
    		total,
    		feed,
    		loaded,
    		getXML2json
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('category' in $$props) $$invalidate(4, category = $$props.category);
    		if ('total' in $$props) $$invalidate(5, total = $$props.total);
    		if ('feed' in $$props) $$invalidate(1, feed = $$props.feed);
    		if ('loaded' in $$props) $$invalidate(2, loaded = $$props.loaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, feed, loaded, path, category, total];
    }

    class NewsItems extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{ path: 3, title: 0, category: 4, total: 5 },
    			null
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*path*/ ctx[3] === undefined && !('path' in props)) {
    			console_1$2.warn("<mc-newsitems> was created without expected prop 'path'");
    		}

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console_1$2.warn("<mc-newsitems> was created without expected prop 'title'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["path", "title", "category", "total"];
    	}

    	get path() {
    		return this.$$.ctx[3];
    	}

    	set path(path) {
    		this.$$set({ path });
    		flush();
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$$set({ title });
    		flush();
    	}

    	get category() {
    		return this.$$.ctx[4];
    	}

    	set category(category) {
    		this.$$set({ category });
    		flush();
    	}

    	get total() {
    		return this.$$.ctx[5];
    	}

    	set total(total) {
    		this.$$set({ total });
    		flush();
    	}
    }

    customElements.define("mc-newsitems", NewsItems);

    /* src\TabExample\Tabs.svelte generated by Svelte v3.42.6 */

    const { console: console_1$1 } = globals;
    const file$a = "src\\TabExample\\Tabs.svelte";

    function create_fragment$a(ctx) {
    	let link;
    	let t;
    	let slot;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$a, 54, 0, 1772);
    			add_location(slot, file$a, 55, 0, 1815);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, slot, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(slot);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-tabs', slots, []);
    	const component = get_current_component();
    	var reg = { tab: [], panel: [] };

    	onMount(async () => {
    		var firstElement = component.querySelector("mc-tab");

    		component.addEventListener(
    			'register',
    			function (e) {
    				reg.tab.push(e.target);

    				if (firstElement.getAttribute("name") === e.target.getAttribute("name")) {
    					e.target.setAttribute("active", "true");
    				}

    				e.stopPropagation();
    			},
    			false
    		);

    		component.addEventListener(
    			'register-panel',
    			function (e) {
    				reg.panel.push(e.target);

    				if (firstElement.getAttribute("name") === e.target.getAttribute("name")) {
    					e.target.setAttribute("active", "true");
    				}

    				e.stopPropagation();
    			},
    			false
    		);

    		component.addEventListener(
    			'active-tab',
    			function (e) {
    				let index = e.target.getAttribute("name");

    				reg.tab.forEach(element => {
    					if (element.getAttribute("name") !== index) {
    						console.log(element);
    						element.setAttribute("active", "false");
    					}
    				});

    				reg.panel.forEach(element => {
    					if (element.getAttribute("name") === index) {
    						console.log(element);
    						element.setAttribute("active", "true");
    					} else {
    						element.setAttribute("active", "false");
    					}
    				});

    				e.stopPropagation();
    			},
    			false
    		);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<mc-tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		component,
    		reg
    	});

    	$$self.$inject_state = $$props => {
    		if ('reg' in $$props) reg = $$props.reg;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Tabs extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("mc-tabs", Tabs);

    /* src\TabExample\Tab.svelte generated by Svelte v3.42.6 */
    const file$9 = "src\\TabExample\\Tab.svelte";

    function create_fragment$9(ctx) {
    	let link;
    	let t;
    	let button;
    	let slot;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			button = element("button");
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$9, 31, 0, 870);
    			add_location(slot, file$9, 33, 1, 1053);
    			attr_dev(button, "class", button_class_value = "transition-colors h-24 w-64 block " + /*customClass*/ ctx[1] + " " + (/*active*/ ctx[0] === "true" ? "bg-primary" : ""));
    			attr_dev(button, "name", "test");
    			add_location(button, file$9, 32, 0, 913);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, slot);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*setActive*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*customClass, active*/ 3 && button_class_value !== (button_class_value = "transition-colors h-24 w-64 block " + /*customClass*/ ctx[1] + " " + (/*active*/ ctx[0] === "true" ? "bg-primary" : ""))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-tab', slots, []);
    	const component = get_current_component();
    	let { test = "before" } = $$props;
    	let { active = "false" } = $$props;
    	let { class: customClass } = $$props;
    	let { name } = $$props;
    	let content;

    	onMount(async () => {
    		await tick(); //I want this to fire after other components load
    		component.setAttribute("name", name);
    		component.setAttribute("active", active);

    		const event = new Event('register',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	});

    	function setActive() {
    		$$invalidate(0, active = "true");

    		const event = new Event('active-tab',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	}

    	const writable_props = ['test', 'active', 'class', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-tab> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('test' in $$props) $$invalidate(3, test = $$props.test);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('class' in $$props) $$invalidate(1, customClass = $$props.class);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		tick,
    		component,
    		test,
    		active,
    		customClass,
    		name,
    		content,
    		setActive
    	});

    	$$self.$inject_state = $$props => {
    		if ('test' in $$props) $$invalidate(3, test = $$props.test);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('customClass' in $$props) $$invalidate(1, customClass = $$props.customClass);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    		if ('content' in $$props) content = $$props.content;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, customClass, setActive, test, name];
    }

    class Tab extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{ test: 3, active: 0, class: 1, name: 4 },
    			null
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*customClass*/ ctx[1] === undefined && !('class' in props)) {
    			console.warn("<mc-tab> was created without expected prop 'class'");
    		}

    		if (/*name*/ ctx[4] === undefined && !('name' in props)) {
    			console.warn("<mc-tab> was created without expected prop 'name'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["test", "active", "class", "name"];
    	}

    	get test() {
    		return this.$$.ctx[3];
    	}

    	set test(test) {
    		this.$$set({ test });
    		flush();
    	}

    	get active() {
    		return this.$$.ctx[0];
    	}

    	set active(active) {
    		this.$$set({ active });
    		flush();
    	}

    	get class() {
    		return this.$$.ctx[1];
    	}

    	set class(customClass) {
    		this.$$set({ class: customClass });
    		flush();
    	}

    	get name() {
    		return this.$$.ctx[4];
    	}

    	set name(name) {
    		this.$$set({ name });
    		flush();
    	}
    }

    customElements.define("mc-tab", Tab);

    /* src\TabExample\TabPanel.svelte generated by Svelte v3.42.6 */
    const file$8 = "src\\TabExample\\TabPanel.svelte";

    function create_fragment$8(ctx) {
    	let link;
    	let t;
    	let slot;
    	let slot_class_value;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$8, 28, 0, 822);
    			attr_dev(slot, "class", slot_class_value = /*active*/ ctx[0] === "true" ? "" : "hidden");
    			add_location(slot, file$8, 29, 0, 865);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, slot, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 1 && slot_class_value !== (slot_class_value = /*active*/ ctx[0] === "true" ? "" : "hidden")) {
    				attr_dev(slot, "class", slot_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(slot);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-panel', slots, []);
    	const component = get_current_component();
    	let { test = "before" } = $$props;
    	let { active = "false" } = $$props;
    	let { name = "" } = $$props;
    	let content;

    	onMount(async () => {
    		await tick(); //I want this to fire after other components load
    		component.setAttribute("name", name);
    		component.setAttribute("active", active);

    		const event = new Event('register-panel',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	});

    	function setActive() {
    		$$invalidate(0, active = "true");

    		const event = new Event('active',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	}

    	const writable_props = ['test', 'active', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-panel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('test' in $$props) $$invalidate(1, test = $$props.test);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		tick,
    		component,
    		test,
    		active,
    		name,
    		content,
    		setActive
    	});

    	$$self.$inject_state = $$props => {
    		if ('test' in $$props) $$invalidate(1, test = $$props.test);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('content' in $$props) content = $$props.content;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, test, name];
    }

    class TabPanel extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{ test: 1, active: 0, name: 2 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["test", "active", "name"];
    	}

    	get test() {
    		return this.$$.ctx[1];
    	}

    	set test(test) {
    		this.$$set({ test });
    		flush();
    	}

    	get active() {
    		return this.$$.ctx[0];
    	}

    	set active(active) {
    		this.$$set({ active });
    		flush();
    	}

    	get name() {
    		return this.$$.ctx[2];
    	}

    	set name(name) {
    		this.$$set({ name });
    		flush();
    	}
    }

    customElements.define("mc-panel", TabPanel);

    /* src\Card.svelte generated by Svelte v3.42.6 */

    const file$7 = "src\\Card.svelte";

    function create_fragment$7(ctx) {
    	let link;
    	let t;
    	let div;
    	let slot;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			div = element("div");
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$7, 6, 0, 65);
    			add_location(slot, file$7, 9, 4, 174);
    			attr_dev(div, "class", "shadow-xl rounded w-full bg-blue-200 p-5 m-5");
    			add_location(div, file$7, 8, 0, 110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, slot);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-card', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-card> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Card extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("mc-card", Card);

    /* src\GallerySection\GallerySection.svelte generated by Svelte v3.42.6 */
    const file$6 = "src\\GallerySection\\GallerySection.svelte";

    function create_fragment$6(ctx) {
    	let link;
    	let t;
    	let slot;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$6, 62, 0, 2145);
    			add_location(slot, file$6, 63, 0, 2188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, slot, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(slot);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-gallery-section', slots, []);
    	const component = get_current_component();
    	let location = 0;
    	var reg = { slides: [], tabber: [] };

    	onMount(async () => {
    		component.querySelector("mc-tab");

    		component.addEventListener(
    			'register-slide',
    			function (e) {
    				reg.slides.push(e.target);

    				if (reg.slides.length === 1) {
    					e.target.setAttribute("active", true);
    				}

    				e.stopPropagation();
    			},
    			false
    		);

    		component.addEventListener(
    			'register-tabber',
    			function (e) {
    				reg.tabber.push(e.target);
    				e.stopPropagation();
    			},
    			false
    		);

    		component.addEventListener(
    			'next-slide',
    			function (e) {
    				reg.slides[location].setAttribute("active", "false");
    				location = (location + 1) % reg.slides.length;
    				reg.slides[location].setAttribute("active", true);

    				reg.tabber.forEach(element => {
    					element.setAttribute("active", location);
    				});

    				e.stopPropagation();
    			},
    			false
    		);

    		component.addEventListener(
    			'prev-slide',
    			function (e) {
    				reg.slides[location].setAttribute("active", "false");
    				location = (location + reg.slides.length - 1) % reg.slides.length;
    				reg.slides[location].setAttribute("active", true);

    				reg.tabber.forEach(element => {
    					element.setAttribute("active", location);
    				});

    				e.stopPropagation();
    			},
    			false
    		);

    		component.addEventListener(
    			'goto-slide',
    			function (e) {
    				reg.slides[location].setAttribute("active", "false");
    				location = e.detail;
    				reg.slides[e.detail].setAttribute("active", true);

    				reg.tabber.forEach(element => {
    					reg.tabber[location].setAttribute("active", location);
    				});

    				e.stopPropagation();
    			},
    			false
    		);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-gallery-section> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		component,
    		location,
    		reg
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) location = $$props.location;
    		if ('reg' in $$props) reg = $$props.reg;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class GallerySection extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("mc-gallery-section", GallerySection);

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\GallerySection\Slide.svelte generated by Svelte v3.42.6 */

    const { console: console_1 } = globals;
    const file$5 = "src\\GallerySection\\Slide.svelte";

    // (44:4) {#if active === "true"}
    function create_if_block(ctx) {
    	let div;
    	let slot;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			slot = element("slot");
    			add_location(slot, file$5, 45, 8, 1221);
    			attr_dev(div, "class", "w-full h-full");
    			add_location(div, file$5, 44, 4, 1119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, slot);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fade, { x: -140, duration: 800 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, { duration: 800, y: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(44:4) {#if active === \\\"true\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let link;
    	let t;
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] === "true" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$5, 41, 0, 1041);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0] === "true") {
    				if (if_block) {
    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
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
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function sleep$1(ms = 0) {
    	return new Promise(cue => setTimeout(cue, ms));
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-slide', slots, []);
    	const component = get_current_component();
    	let { test = "before" } = $$props;
    	let { active = "false" } = $$props;
    	let { class: customClass } = $$props;
    	let { name } = $$props;
    	let content;
    	console.log(active, "hello");

    	onMount(async () => {
    		await tick(); //I want this to fire after other components load
    		component.setAttribute("name", name);
    		component.setAttribute("active", active);

    		const event = new Event('register-slide',
    		{
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	});

    	const writable_props = ['test', 'active', 'class', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<mc-slide> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('test' in $$props) $$invalidate(1, test = $$props.test);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('class' in $$props) $$invalidate(2, customClass = $$props.class);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		tick,
    		fade,
    		fly,
    		component,
    		test,
    		active,
    		customClass,
    		name,
    		content,
    		sleep: sleep$1
    	});

    	$$self.$inject_state = $$props => {
    		if ('test' in $$props) $$invalidate(1, test = $$props.test);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('customClass' in $$props) $$invalidate(2, customClass = $$props.customClass);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('content' in $$props) content = $$props.content;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active*/ 1) ;

    		if ($$self.$$.dirty & /*active*/ 1) {
    			if (active === "false") {
    				component.classList.remove("z-10");
    			}
    		}

    		if ($$self.$$.dirty & /*active*/ 1) {
    			if (active === "true") {
    				component.classList.add("z-10");
    			}
    		}
    	};

    	return [active, test, customClass, name];
    }

    class Slide extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{ test: 1, active: 0, class: 2, name: 3 },
    			null
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*customClass*/ ctx[2] === undefined && !('class' in props)) {
    			console_1.warn("<mc-slide> was created without expected prop 'class'");
    		}

    		if (/*name*/ ctx[3] === undefined && !('name' in props)) {
    			console_1.warn("<mc-slide> was created without expected prop 'name'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["test", "active", "class", "name"];
    	}

    	get test() {
    		return this.$$.ctx[1];
    	}

    	set test(test) {
    		this.$$set({ test });
    		flush();
    	}

    	get active() {
    		return this.$$.ctx[0];
    	}

    	set active(active) {
    		this.$$set({ active });
    		flush();
    	}

    	get class() {
    		return this.$$.ctx[2];
    	}

    	set class(customClass) {
    		this.$$set({ class: customClass });
    		flush();
    	}

    	get name() {
    		return this.$$.ctx[3];
    	}

    	set name(name) {
    		this.$$set({ name });
    		flush();
    	}
    }

    customElements.define("mc-slide", Slide);

    /* src\GallerySection\Slides.svelte generated by Svelte v3.42.6 */

    const file$4 = "src\\GallerySection\\Slides.svelte";

    function create_fragment$4(ctx) {
    	let link;
    	let t;
    	let div;
    	let slot;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			div = element("div");
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$4, 5, 0, 62);
    			add_location(slot, file$4, 8, 4, 133);
    			attr_dev(div, "class", "parent");
    			add_location(div, file$4, 7, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, slot);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
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

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-slides', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-slides> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Slides extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>.parent{display:grid;width:100%;height:100%
}.parent>::slotted(mc-slide){grid-row:1;grid-column:1}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("mc-slides", Slides);

    /* src\GallerySection\NextSlide.svelte generated by Svelte v3.42.6 */
    const file$3 = "src\\GallerySection\\NextSlide.svelte";

    function create_fragment$3(ctx) {
    	let link;
    	let t;
    	let button;
    	let slot;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			button = element("button");
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$3, 31, 0, 876);
    			add_location(slot, file$3, 33, 1, 973);
    			attr_dev(button, "class", /*customClass*/ ctx[0]);
    			add_location(button, file$3, 32, 0, 919);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, slot);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*setActive*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*customClass*/ 1) {
    				attr_dev(button, "class", /*customClass*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(button);
    			mounted = false;
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-nextslide', slots, []);
    	const component = get_current_component();
    	let { test = "before" } = $$props;
    	let { active = "false" } = $$props;
    	let { class: customClass } = $$props;
    	let { name } = $$props;
    	let content;

    	onMount(async () => {
    		await tick(); //I want this to fire after other components load
    		component.setAttribute("name", name);
    		component.setAttribute("active", active);

    		const event = new Event('register',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	});

    	function setActive() {
    		$$invalidate(2, active = "true");

    		const event = new Event('next-slide',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	}

    	const writable_props = ['test', 'active', 'class', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-nextslide> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('test' in $$props) $$invalidate(3, test = $$props.test);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('class' in $$props) $$invalidate(0, customClass = $$props.class);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		tick,
    		component,
    		test,
    		active,
    		customClass,
    		name,
    		content,
    		setActive
    	});

    	$$self.$inject_state = $$props => {
    		if ('test' in $$props) $$invalidate(3, test = $$props.test);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('customClass' in $$props) $$invalidate(0, customClass = $$props.customClass);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    		if ('content' in $$props) content = $$props.content;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [customClass, setActive, active, test, name];
    }

    class NextSlide extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{ test: 3, active: 2, class: 0, name: 4 },
    			null
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*customClass*/ ctx[0] === undefined && !('class' in props)) {
    			console.warn("<mc-nextslide> was created without expected prop 'class'");
    		}

    		if (/*name*/ ctx[4] === undefined && !('name' in props)) {
    			console.warn("<mc-nextslide> was created without expected prop 'name'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["test", "active", "class", "name"];
    	}

    	get test() {
    		return this.$$.ctx[3];
    	}

    	set test(test) {
    		this.$$set({ test });
    		flush();
    	}

    	get active() {
    		return this.$$.ctx[2];
    	}

    	set active(active) {
    		this.$$set({ active });
    		flush();
    	}

    	get class() {
    		return this.$$.ctx[0];
    	}

    	set class(customClass) {
    		this.$$set({ class: customClass });
    		flush();
    	}

    	get name() {
    		return this.$$.ctx[4];
    	}

    	set name(name) {
    		this.$$set({ name });
    		flush();
    	}
    }

    customElements.define("mc-nextslide", NextSlide);

    /* src\GallerySection\PrevSlide.svelte generated by Svelte v3.42.6 */
    const file$2 = "src\\GallerySection\\PrevSlide.svelte";

    function create_fragment$2(ctx) {
    	let link;
    	let t;
    	let button;
    	let slot;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			button = element("button");
    			slot = element("slot");
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$2, 31, 0, 876);
    			add_location(slot, file$2, 33, 1, 973);
    			attr_dev(button, "class", /*customClass*/ ctx[0]);
    			add_location(button, file$2, 32, 0, 919);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, slot);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*setActive*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*customClass*/ 1) {
    				attr_dev(button, "class", /*customClass*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-prevslide', slots, []);
    	const component = get_current_component();
    	let { test = "before" } = $$props;
    	let { active = "false" } = $$props;
    	let { class: customClass } = $$props;
    	let { name } = $$props;
    	let content;

    	onMount(async () => {
    		await tick(); //I want this to fire after other components load
    		component.setAttribute("name", name);
    		component.setAttribute("active", active);

    		const event = new Event('register',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	});

    	function setActive() {
    		$$invalidate(2, active = "true");

    		const event = new Event('prev-slide',
    		{
    				detail: "test",
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	}

    	const writable_props = ['test', 'active', 'class', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-prevslide> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('test' in $$props) $$invalidate(3, test = $$props.test);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('class' in $$props) $$invalidate(0, customClass = $$props.class);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		tick,
    		component,
    		test,
    		active,
    		customClass,
    		name,
    		content,
    		setActive
    	});

    	$$self.$inject_state = $$props => {
    		if ('test' in $$props) $$invalidate(3, test = $$props.test);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('customClass' in $$props) $$invalidate(0, customClass = $$props.customClass);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    		if ('content' in $$props) content = $$props.content;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [customClass, setActive, active, test, name];
    }

    class PrevSlide extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{ test: 3, active: 2, class: 0, name: 4 },
    			null
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*customClass*/ ctx[0] === undefined && !('class' in props)) {
    			console.warn("<mc-prevslide> was created without expected prop 'class'");
    		}

    		if (/*name*/ ctx[4] === undefined && !('name' in props)) {
    			console.warn("<mc-prevslide> was created without expected prop 'name'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["test", "active", "class", "name"];
    	}

    	get test() {
    		return this.$$.ctx[3];
    	}

    	set test(test) {
    		this.$$set({ test });
    		flush();
    	}

    	get active() {
    		return this.$$.ctx[2];
    	}

    	set active(active) {
    		this.$$set({ active });
    		flush();
    	}

    	get class() {
    		return this.$$.ctx[0];
    	}

    	set class(customClass) {
    		this.$$set({ class: customClass });
    		flush();
    	}

    	get name() {
    		return this.$$.ctx[4];
    	}

    	set name(name) {
    		this.$$set({ name });
    		flush();
    	}
    }

    customElements.define("mc-prevslide", PrevSlide);

    /* src\GallerySection\GalleryTabs.svelte generated by Svelte v3.42.6 */
    const file$1 = "src\\GallerySection\\GalleryTabs.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (28:4) {#each items as item,i}
    function create_each_block(ctx) {
    	let li;
    	let button;
    	let button_class_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*i*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t = space();
    			attr_dev(button, "name", "slide " + /*i*/ ctx[8]);

    			attr_dev(button, "class", button_class_value = "" + ((`${/*active*/ ctx[0]}` === `${/*i*/ ctx[8]}`
    			? "bg-white"
    			: "") + " m-2 w-3 h-3 border-white border-2 rounded-full"));

    			add_location(button, file$1, 29, 12, 961);
    			add_location(li, file$1, 28, 8, 914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*active*/ 1 && button_class_value !== (button_class_value = "" + ((`${/*active*/ ctx[0]}` === `${/*i*/ ctx[8]}`
    			? "bg-white"
    			: "") + " m-2 w-3 h-3 border-white border-2 rounded-full"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(28:4) {#each items as item,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let link;
    	let t;
    	let ul;
    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /omni-cms/app.css");
    			add_location(link, file$1, 25, 0, 810);
    			attr_dev(ul, "class", "flex z-20");
    			add_location(ul, file$1, 26, 0, 853);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*goToItem, active, items*/ 7) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('mc-gallerytabs', slots, []);
    	const component = get_current_component();
    	let content;
    	let { active = "0" } = $$props;
    	let items = [];

    	onMount(async () => {
    		await tick(); //I want this to fire after other components load
    		let slides = component.closest("mc-slides");
    		$$invalidate(1, items = slides.querySelectorAll("mc-slide"));

    		const event = new Event('register-tabber',
    		{
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	});

    	function goToItem(item) {
    		const event = new CustomEvent('goto-slide',
    		{
    				detail: item,
    				bubbles: true,
    				cancelable: true,
    				composed: true
    			});

    		component.dispatchEvent(event);
    	}

    	const writable_props = ['active'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-gallerytabs> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => goToItem(i);

    	$$self.$$set = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		onMount,
    		tick,
    		component,
    		content,
    		active,
    		items,
    		goToItem
    	});

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) content = $$props.content;
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, items, goToItem, click_handler];
    }

    class GalleryTabs extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{ active: 0 },
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["active"];
    	}

    	get active() {
    		return this.$$.ctx[0];
    	}

    	set active(active) {
    		this.$$set({ active });
    		flush();
    	}
    }

    customElements.define("mc-gallerytabs", GalleryTabs);

    /* src\sidenav\SideNav.svelte generated by Svelte v3.42.6 */

    const { Error: Error_1 } = globals;
    const file = "src\\sidenav\\SideNav.svelte";

    // (46:0) {:catch data}
    function create_catch_block(ctx) {
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Link 1";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Link 2";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Link 3";
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 47, 16, 1240);
    			add_location(li0, file, 47, 12, 1236);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file, 48, 16, 1285);
    			add_location(li1, file, 48, 12, 1281);
    			attr_dev(a2, "href", "/");
    			add_location(a2, file, 49, 16, 1330);
    			add_location(li2, file, 49, 12, 1326);
    			attr_dev(ul, "class", "w-full flex flex-col justify-center fadeIn");
    			add_location(ul, file, 46, 9, 1167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(46:0) {:catch data}",
    		ctx
    	});

    	return block;
    }

    // (42:0) {:then data}
    function create_then_block(ctx) {
    	let ul;
    	let raw_value = /*data*/ ctx[1] + "";

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			attr_dev(ul, "class", "w-full flex flex-col justify-center fadeIn");
    			add_location(ul, file, 42, 9, 1045);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			ul.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && raw_value !== (raw_value = /*data*/ ctx[1] + "")) ul.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(42:0) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (32:13)           <div class="fadeInLong">          <ul class="animate-pulse w-full flex flex-col space-y-4">                  <li class="h-4 bg-blue-400 rounded w-3/4"></li>                  <li class="h-4 bg-blue-400 rounded w-3/6"></li>                  <li class="h-4 bg-blue-400 rounded w-4/6"></li>                  <li class="h-4 bg-blue-400 rounded w-3/4"></li>                  <li class="h-4 bg-blue-400 rounded w-3/6"></li>          </ul>          </div>  {:then data}
    function create_pending_block(ctx) {
    	let div;
    	let ul;
    	let li0;
    	let t0;
    	let li1;
    	let t1;
    	let li2;
    	let t2;
    	let li3;
    	let t3;
    	let li4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			t0 = space();
    			li1 = element("li");
    			t1 = space();
    			li2 = element("li");
    			t2 = space();
    			li3 = element("li");
    			t3 = space();
    			li4 = element("li");
    			attr_dev(li0, "class", "h-4 bg-blue-400 rounded w-3/4");
    			add_location(li0, file, 34, 16, 682);
    			attr_dev(li1, "class", "h-4 bg-blue-400 rounded w-3/6");
    			add_location(li1, file, 35, 16, 747);
    			attr_dev(li2, "class", "h-4 bg-blue-400 rounded w-4/6");
    			add_location(li2, file, 36, 16, 812);
    			attr_dev(li3, "class", "h-4 bg-blue-400 rounded w-3/4");
    			add_location(li3, file, 37, 16, 877);
    			attr_dev(li4, "class", "h-4 bg-blue-400 rounded w-3/6");
    			add_location(li4, file, 38, 16, 942);
    			attr_dev(ul, "class", "animate-pulse w-full flex flex-col space-y-4");
    			add_location(ul, file, 33, 8, 607);
    			attr_dev(div, "class", "fadeInLong");
    			add_location(div, file, 32, 8, 573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			append_dev(ul, t3);
    			append_dev(ul, li4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(32:13)           <div class=\\\"fadeInLong\\\">          <ul class=\\\"animate-pulse w-full flex flex-col space-y-4\\\">                  <li class=\\\"h-4 bg-blue-400 rounded w-3/4\\\"></li>                  <li class=\\\"h-4 bg-blue-400 rounded w-3/6\\\"></li>                  <li class=\\\"h-4 bg-blue-400 rounded w-4/6\\\"></li>                  <li class=\\\"h-4 bg-blue-400 rounded w-3/4\\\"></li>                  <li class=\\\"h-4 bg-blue-400 rounded w-3/6\\\"></li>          </ul>          </div>  {:then data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link;
    	let t;
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 1,
    		error: 1
    	};

    	handle_promise(promise = /*data*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			await_block_anchor = empty();
    			info.block.c();
    			this.c = noop;
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", /*css*/ ctx[0]);
    			add_location(link, file, 29, 0, 508);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*css*/ 1) {
    				attr_dev(link, "href", /*css*/ ctx[0]);
    			}

    			info.ctx = ctx;

    			if (dirty & /*data*/ 2 && promise !== (promise = /*data*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    function sleep(ms = 0) {
    	return new Promise(cue => setTimeout(cue, ms));
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('mc-sidenav', slots, []);
    	let { path } = $$props;
    	let { css = /omni-cms/app.css" } = $$props;
    	let data;

    	async function getNav() {
    		const res = await fetch(path);
    		const text = await res.text();

    		if (res.ok) {
    			return text;
    		} else {
    			throw new Error(text);
    		}
    	}

    	onMount(async () => {
    		$$invalidate(1, data = getNav());
    	});

    	const writable_props = ['path', 'css'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<mc-sidenav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    		if ('css' in $$props) $$invalidate(0, css = $$props.css);
    	};

    	$$self.$capture_state = () => ({ onMount, path, css, data, getNav, sleep });

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    		if ('css' in $$props) $$invalidate(0, css = $$props.css);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [css, data, path];
    }

    class SideNav extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>@keyframes fade{from{opacity:0}to{opactiy:1}}.fadeIn{animation:fade 500ms}@keyframes fadeLong{0%,100%{opacity:1}50%{opacity:.5}}.fadeInLong{animation:fade 2s ease-in-out 0s 1}@keyframes fadeout{to{opactiy:0}}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{ path: 2, css: 0 },
    			null
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*path*/ ctx[2] === undefined && !('path' in props)) {
    			console.warn("<mc-sidenav> was created without expected prop 'path'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["path", "css"];
    	}

    	get path() {
    		return this.$$.ctx[2];
    	}

    	set path(path) {
    		this.$$set({ path });
    		flush();
    	}

    	get css() {
    		return this.$$.ctx[0];
    	}

    	set css(css) {
    		this.$$set({ css });
    		flush();
    	}
    }

    customElements.define("mc-sidenav", SideNav);

    var main = {
        Gallery,
        Navbar,
        Navbar2,
        Navdropdown,
        NavLink,
        FeaturedNews,
        NewsItems,
        Gallery2,
        GalleryInfo,
        GalleryInsert,
        Tabs,
        Tab,
        TabPanel,
        Card,
        GallerySection,
        Slide,
        Slides,
        NextSlide,
        PrevSlide,
        GalleryTabs,
        SideNav
    };

    return main;

}());
//# sourceMappingURL=components.js.map
