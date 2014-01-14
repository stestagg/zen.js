(function() {
  "use strict";

  var strip_re = /(^\s+)|(\s+$)/g;
  function strip(str) {
    return str.replace(strip_re, "");
  }

  var unescape_re = /\\./g;
  function str_unescape(raw) {
    return raw.replace(unescape_re, function(match) { return match.slice(1); });
  };

  function pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
  }

  var substitute_repeat_re = /(\\\\|\\\$|\$+)/g;
  function substitute_repeat_no(text, repeat_no) {
    return text.replace(substitute_repeat_re, function(match) {
      if(match == "\\\\"){ return "\\"; }
      if(match == "\\$"){ return "\\$"; }

      return pad(repeat_no+1, match.length);
    })

  }

  var string_match_1 = '"(?:(?:\\\\\\\\)|(?:\\\\")|(?:[^"]))*"';
  var string_match_2 = "'(?:(?:\\\\\\\\)|(?:\\\\')|(?:[^']))*'";
  var text_match = "\\{(?:(?:\\\\\\\\)|(?:\\\\})|(?:[^\\}]))*\\}";
  // HTML 5 has relaxed the idname rules, so this is quite relaxed too..
  var idname_match = "(?:(?:\\\\.)|(?:[^>+()\\[\\=\\.\\#\\s\\*\\{]))+";
  var escaped_token_match = "(?:" + string_match_1 + ")|(?:" + string_match_2 + ")|(?:[^\\]]+)";
  var key_value_match = "\\s*" + idname_match + "\\s*(?:=\\s*(?:" + escaped_token_match + "))?,?\\s*";
  var attr_match = "\\[(?:" + key_value_match + ")+\\]";
  var tag_match = "\\w+";
  var mult_match = "\\s*\\*\\s*\\d+";
  var id_match = "#" + idname_match;
  var class_match = "\\." + idname_match;
  var tag_annotator_match = "(?:" + id_match + ")|(?:" + class_match + ")|(?:" + attr_match + ")";
  var selector_match = "(" + tag_match + ")?(?:" + tag_annotator_match + ")*(" + mult_match + ")?";
  var relationship_match = "[>+()](" + mult_match + ")?";
  var relationship_re = new RegExp(relationship_match);
  var zen_match = "(" + relationship_match + ")|(" + text_match + ")|(" + selector_match + ")";
  var zen_re = new RegExp(zen_match, "gi");

  var defaultTag = "div";

  var selector_tag_re = new RegExp("^(" + tag_match + ")");
  var selector_split_re = new RegExp("(" + tag_annotator_match + ")");
  var idname_re = new RegExp("\\s*" + idname_match + "\\s*");
  var key_value_re = new RegExp("(" + key_value_match + ")");
  function handleSelector(token, contexts, prevType) {
    var tag_split = token.split(selector_tag_re);
    var node = {
      type: "tag",
      tag: defaultTag,
      attr: {},
      classes: {},
      children: [],
      repeat: 1
    };
    if(tag_split.length == 3) { node.tag = tag_split[1]; token = tag_split[2];}
    var annotations = token.split(selector_split_re).filter(function(el) { return el.length > 0; });
    annotations.forEach(function(el) {
      var type = el.charAt(0);
      switch(type) {
        case "#":
          node.attr.id = str_unescape(el.slice(1));
          break;
        case ".":
          node.classes[str_unescape(el.slice(1))] = true;
          break;
        case "[":
          el = el.slice(1, -1);
          var kvs = el.split(key_value_re);
          kvs.forEach(function(kv) {
            if(kv == "") { return; }
            kv = strip(kv);
            var attr = strip(idname_re.exec(kv)[0]);
            var rest = kv.slice(attr.length);
            if (rest.length == 0) {
              rest = "yes";
            } else {
              if (rest.charAt(0) != "=") {
                throw new Error("Invalid attribute specifier: " + el);
              }
              rest = rest.slice(1);
              if (rest.charAt(0) == "'" || rest.charAt(0) == '"') {
                rest = rest.slice(1, -1);
              }
            }
            node.attr[str_unescape(attr)] = str_unescape(rest);
          })
          break;
        case "*":
          node.repeat = parseInt(el.slice(1));
          break;
        default:
          throw new Error("Unknown modifier: '" + el + "'");
      }
    });
    contexts[0].children.push(node);
  }

  function handleRelationship(token, contexts, prevType) {
    switch(strip(token)) {
      case ">":
        var context = contexts[0];
        contexts.splice(0, 0, context.children[context.children.length-1])
        return;
      case "+":
        return;
      case '(':
        var group = {
          type: "group",
          children: [],
          repeat: 1
        };
        contexts[0].children.push(group);
        contexts.splice(0, 0, group);
        return;
      case ')':
        for(var i=0; i<contexts.length; ++i) {
          if (contexts[i].type == "group") { break; }
        }
        if(i == contexts.length) {
          throw new Error("Group closing brace found, but no matching opening brace");
        }
        contexts.splice(0,i);
        return;
      default:
        throw new Error("Operator not implemented '"+ strip(token) + "'");
    }
  }

  function handleText(token, contexts, prevType) {
    var text = str_unescape(strip(token).slice(1, -1));
    var context = contexts[0];
    if (prevType == "selector" && context.children.length > 0) {
      context.children[context.children.length - 1].children.push({type:"text", text: text, repeat: 1});  
    } else {
      contexts[0].children.push({type:"text", text: text, repeat: 1});
    }
  }

  function handleToken(token, contexts, prevType) {
    if(token.charAt(0) == "{") {
      handleText(token, contexts, prevType);      
      return "text";
    }
    if(relationship_re.test(token)){
      handleRelationship(token, contexts, prevType);
      return "relationship";
    }
    handleSelector(token, contexts);
    return "selector";
  }

  function zen(code) {
    if (!(this instanceof zen)) { return new zen(code); }
    var tokens = code.match(zen_re);
    var base = {
      children: []
    }
    var context_stack = [base];
    var prevType = null;
    tokens.forEach(function(token) {

      if (token == "") { return; }
      prevType = handleToken(token, context_stack, prevType);
    })
    this.definition = base;
  }

  zen.prototype._make_node = function(defn, repeat_num) {
    if(defn.type == "text") {
      return document.createTextNode(defn.text);
    } else if (defn.type == "tag") {
      var tag = document.createElement(defn.tag);
      for (var key in defn.attr) {
        if (!defn.attr.hasOwnProperty(key)) { continue; }
        tag.setAttribute(key, substitute_repeat_no(defn.attr[key], repeat_num));
      }
      var classes = [];
      for (var key in defn.classes) {
        if (!defn.classes.hasOwnProperty(key)) { continue; }
        classes.push(substitute_repeat_no(key, repeat_num));
      }
      if(classes.length) {
        tag.className = classes.join(" ");
      }
      return tag;
    } else {
      throw new Error("Unknown node type '" + defn.type + "'");
    };
  }

  zen.prototype.make = function(node) {
    var self = this;
    var elements = [];
    if (!node) {
      this.definition.children.forEach(
        function(child_node) {
          elements = elements.concat(self.make(child_node));
        })
      return elements;
    }

    for (var i=0; i<node.repeat; ++i) {
      if(node.type == "group") {
        if (node.children) {
          node.children.forEach(
            function(child_node) {
              var child_elements = self.make(child_node);
              elements = elements.concat(child_elements);
            }
          );
        }
      } else {
        var element = self._make_node(node, i);
        if (node.children) {
          node.children.forEach(
            function(child_node) {
              var child_elements = self.make(child_node);
              child_elements.forEach(function(child_element) {
                element.appendChild(child_element);
              });
            }
          )
        }
        elements.push(element);
      }
    }
    return elements;
  }

  zen.prototype.insert = function(parent) {
    var elms = this.make()
    elms.forEach(function(elm) {
      parent.appendChild(elm);
    })
  }

  window.zen = zen;

})();
