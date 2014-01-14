// hackety hack
var last_fixture;

module( "Dom Tests", {
  setup: function() {
    last_fixture = $("<div/>")[0];
    $("#fixture").append(last_fixture);
  },
  teardown: function() {
    // clean up after each test
  },
});


function htmlEqual(node, expected_html, message){
  var containerNode = $("<div>");
  containerNode.append(node);
  var expected = $("<div>");
  expected.append($(expected_html));
  equal(containerNode[0].innerHTML, expected[0].innerHTML, message);
  $(last_fixture).append(node);
}

function zenEqual(code, expected_html){
  htmlEqual(zen(code).make(), expected_html, code + " => " + expected_html);
}


test("Single Element", function() {
  zen("div").insert(last_fixture);
  var nodes = $(last_fixture).children();
  equal(nodes.length, 1);
  var elm = nodes[0];
  equal(nodes[0].tagName, "DIV");
  equal(nodes.html(), "");
});

test("Simple Text", function() {
  zen("{hi ho}").insert(last_fixture);
  equal($(last_fixture).text(), "hi ho");
  equal($(last_fixture).children().length, 0);
  zenEqual("a>{hi}", "<a>hi</a>");
  zenEqual("p>a+{hi}", "<p><a></a>hi</p>");
  zenEqual("p>{this } + a{hi}", "<p>this <a>hi</a></p>");
  zenEqual("a{hi}", "<a>hi</a>");
})

test("Simple ID", function() {
  zen("#a").insert(last_fixture);
  var nodes = $(last_fixture).children();
  equal(nodes.length, 1);
  equal(nodes[0].id, "a");

})

test("Nested", function() {
  zen("#one > #two").insert(last_fixture);
  var nodes = $(last_fixture).children();
  equal(nodes.length, 1);
  equal(nodes[0].id, "one");
  equal(nodes.children().length, 1);
  equal(nodes.children()[0].id, "two");
})

test("Siblings", function() {
  zen("#one + #two").insert(last_fixture);
  var nodes = $(last_fixture).children();
  equal(nodes.length, 2);
  equal(nodes[0].id, "one");
  equal(nodes[1].id, "two");
})

test("Nested Siblings", function() {
  zen("#one > #two + #three").insert(last_fixture);
  var nodes = $(last_fixture).children();
  equal(nodes.length, 1);
  equal(nodes[0].id, "one");
  var child_nodes = nodes.children();
  equal(child_nodes.length, 2);
  equal(child_nodes[0].id, "two");
  equal(child_nodes[1].id, "three");
})

test("Website Examples 1", function() { // From: https://code.google.com/p/zen-coding/ as of 12/2013
  zenEqual("div#page.section.main", '<div id="page" class="section main"></div>');  
  zenEqual("div[title]", '<div title="yes"></div>');
  zenEqual('a[title="Hello world" rel]', '<a title="Hello world" rel="yes"></a>');
  zenEqual('td[colspan=2]', '<td colspan=2/>');
});

test("Website Examples 2", function() {
  zenEqual("div>li*5", '<div><li/><li/><li/><li/><li/></div>');
  zenEqual('a[title="Hello world" rel]', '<a title="Hello world" rel="yes"></a>');
  zenEqual('td[colspan=2]', '<td colspan=2>');
});

test("Website Examples 3-5", function() {
  zenEqual("li*5", "<li></li><li></li><li></li><li></li><li></li>");
  zenEqual("li.item$*3", '<li class="item1"></li><li class="item2"></li><li class="item3"></li>');
  zenEqual("li.item$$$", '<li class="item001"/>');
  zenEqual("li.item$$$*2", '<li class="item001"/><li class="item002"/>');
});

test("Complex text example", function() {
  zenEqual("p>{this } + a{is a} + { test\\}}", "<p>this <a>is a</a> test}</p>");

})

test("Website Example 6", function() {
  var zz = zen("div>div#page>(div#header>ul#nav>li*4>a{one})+(div#column>(h1>span{two})+p*2)+div#footer").make()[0];
  var ones = $("#page>#header>#nav>li>a", zz);
  equal(ones.length, 4);
  equal(ones.text(), "oneoneoneone")
  var twos = $("#page>#column>h1>span", zz);

  equal(twos.length, 1);
  equal(twos.text(), "two");
})

test("Escaping", function() {
  zenEqual('div#a\\.b', '<div id="a.b"/>');
  zenEqual('div.a\\.b', '<div class="a.b"/>');
  zenEqual('div.a.b', '<div class="a b"/>');
  zenEqual('div.a#b', '<div id="b" class="a"/>');
  zenEqual('div.a\\#b', '<div class="a#b"/>');
  zenEqual('div.a[b=foo]', '<div b="foo" class="a"/>');
  zenEqual('div.a[b=f\\ oo]', '<div b="f oo" class="a"/>');
  zenEqual("div.a[b='f\\'oo']", '<div b="f\'oo" class="a"/>');
})

test("Documentation examples", function() {
  zen(".outer>.inner>h1.header{My Header}+p.body{Some body text}").insert(last_fixture);
});
