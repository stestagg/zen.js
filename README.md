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

More examples may be seen in this [js-fiddle](http://jsfiddle.net/xLJY8/1/)

Features
-----

zen.js supports all [features](https://code.google.com/p/zen-coding/wiki/ZenHTMLSelectorsEn) of the zen-coding plugin except filters, any deviance in behaviour that isn't documented here should be treated as a bug.

API
---

zen.js has a simple API based around the core zen() function.

**zen(code)**

Compiles the [zen-coding](https://code.google.com/p/zen-coding/) snippet into a reusable object that can create HTML DOM objects with the following methods:

_zen(code)_**.make()**

Returns an Array of newly-created DOM elements(matching _code_) without inserting them into any document.

_zen(code_**.insert(parent)**

Calls _make()_ and then inserts the resulting nodes as childs of the _parent_ element.

Escaping
---

Care has been taken to make this library work well with escaping, for example, you can define attributes with spaces and quotes, or put '}' in a text block by escaping it.  (Note the double-backslash required due to javascript's built-in string escaping)

```
zen("a[href='http://www.google.com/?q=moore\\'s law']{Example {google search\\}}")
```

<a href="http://www.google.com/?q=moore's law">Example {google search}</a>
