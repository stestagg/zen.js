zen.js
======

zen.js is a browser JS library that makes creating DOM elements awesome.  Inspired by [zen-coding](https://code.google.com/p/zen-coding/), the syntax is css-like, terse, not tied to any framework, and very simple to use:

```js
zen(".outer>.inner>h1.header{My Header}+p.body{Some body text}").insert([DOM element]);
```

results in:

```
<div class="outer">
	<div class="inner">
		<h1 class="header">
			My Header
		</h1>
		<p class="body">
			Some body text
		</p>
	</div>
</div>
```

http://jsfiddle.net/xLJY8/

jQuery Example
---

```html
```

API
---

zen.js has a simple API based around the core zen() function.

**zen(code)**

Compiles the [zen-coding](https://code.google.com/p/zen-coding/) snippet into a reusable object that can create HTML DOM objects with the following methods:

_zen(code)_**.make()**

Returns an Array of newly-created DOM elements(matching _code_) without inserting them into any document.

_zen(code_**.insert(parent)**

Calls make() and then inserts the resulting nodes as childs of the _parent_ element.
