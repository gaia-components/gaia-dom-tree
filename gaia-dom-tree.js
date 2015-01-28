;(function(define){'use strict';define(function(require,exports,module){

/**
 * Dependencies
 */

var component = require('gaia-component');

/**
 * Simple logger (toggle 0)
 *
 * @type {Function}
 */
var debug = 1 ? console.log.bind(console) : function() {};

const NODE_TYPES = {
  1: 'element',
  3: 'text'
};

/**
 * Register the element.
 *
 * @return {Element} constructor
 */
module.exports = component.register('gaia-dom-tree', {

  /**
   * Called when the element is first created.
   *
   * Here we create the shadow-root and
   * inject our template into it.
   *
   * @private
   */
  created: function() {
    debug('created');
    this.setupShadowRoot();
    this.els = {
      inner: this.shadowRoot.querySelector('.inner'),
      tree: this.shadowRoot.querySelector('.tree')
    };

    this.selectedTreeNode = null;
    this.selectedNode = null;
    this.treeMap = new Map();
    this.els.inner.addEventListener('click', e => this.onInnerClick(e));
  },

  setRoot: function(el) {
    debug('set root', el);
    this.root = el;
  },

  render: function() {
    var tree = this.createTree(this.root);
    this.els.tree.innerHTML = '';
    this.els.tree.appendChild(tree);
    debug('rendered');
  },

  select: function(el) {
    debug('select', el);
    var treeNode = this.treeMap.get(el);
    if (!treeNode) return;
    this.selectNode(treeNode);
    this.expandNode(treeNode);
  },

  onInnerClick: function(e) {
    debug('inner click', e);
    var nodeTitle = e.target.closest('h3');
    if (nodeTitle) this.onNodeTitleClick(nodeTitle);
  },

  onNodeTitleClick: function(el) {
    var node = el.closest('li');
    this.toggleExpanded(node);
    this.selectNode(node);
  },

  expandNode: function(node) {
    debug('expand node', node);
    node.classList.add('expanded');
    var parent = node.parentNode.closest('li');
    if (parent) this.expandNode(parent);
  },

  contractNode: function(node) {
    node.classList.remove('expanded');
  },

  toggleExpanded: function(node) {
    var expanded = node.classList.contains('expanded');
    if (expanded) this.contractNode(node);
    else this.expandNode(node);
  },

  selectNode: function(treeNode) {
    var previous = this.selectedTreeNode;
    if (previous) previous.classList.remove('selected');
    treeNode.classList.add('selected');
    this.selectedTreeNode = treeNode;
    this.selectedNode = treeNode.sourceNode;
    this.despatch('selected');
  },

  despatch: function(name) {
    this.dispatchEvent(new Event('selected'));
  },

  createTree: function(node) {
    var treeNode = document.createElement('li');
    var title = document.createElement('h3');
    var children = document.createElement('ul');
    var type = NODE_TYPES[node.nodeType];
    var childNodes = node.childNodes;
    var stringified = stringify[type](node);

    if (!stringified) return;

    title.innerHTML = stringified;

    treeNode.appendChild(title);
    treeNode.appendChild(children);
    treeNode.sourceNode = node;
    treeNode.classList.add(type);

    // Flag when a node has children
    treeNode.classList.toggle('has-children', !!childNodes.length);

    [].map.call(childNodes, (node) => this.createTree(node))
      .filter(node => !!node)
      .forEach(children.appendChild, children);

    this.treeMap.set(node, treeNode);
    return treeNode;
  },

  template: `
    <style>

      * { box-sizing: border-box; }

      :host {
        display: block;
      }

      .inner {
        color: var(--text-color);
        background: var(--background);
        font-family: Consolas,Monaco,"Andale Mono",monospace;
        line-height: 1;
        -moz-user-select: none;
        cursor: default;
      }

      .tree {
        overflow: auto;
      }

      ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }

      /** Node Title
       ---------------------------------------------------------*/

      h3 {
        display: inline-block;
        width: 100%;
        margin: 0;
        padding: 0.2em 0.2em;
        font: inherit;
        white-space: nowrap;
      }

      /**
       * .selected
       */

      li.selected > h3 {
        background: var(--background-plus)
      }

      li.text > h3 {
        font-style: italic;
        opacity: 0.4;
      }

      /** Node Icon
       ---------------------------------------------------------*/

      li > h3:before {
        content: '';
        display: inline-block;
        vertical-align: to;
        text-align: center;
        width: 1.4em;
        font-size: 0.8em;
        opacity: 0.2
      }

      li.element.has-children > h3:before {
        content: '▶';
      }

      /**
       * .expanded
       */

      li.expanded > h3:before {
        transform: rotate(90deg);
      }

      /** Node Attributes
       ---------------------------------------------------------*/

      .attr-value {
        color: var(--highlight-color);
      }

      /** Children
       ---------------------------------------------------------*/

      li > ul {
        display: none;
        -moz-padding-start: 0.8em;
      }

      /**
       * .expanded
       */

      li.expanded > ul {
        display: block;
      }

    </style>
    <div class="inner">
      <ul class="tree"></div>
    </div>
  `
});

var stringify = {
  element: function(el) {
    var tagName = el.tagName.toLowerCase();
    var attrs = stringifyAttrs(el.attributes);
    return `&lt;${tagName}<span class="attrs">${attrs}</span>&gt;`;
  },

  text: function(textNode) {
    var value = textNode.nodeValue.trim();
    debug('stringify textNode', value);
    return value;
  }
};

function stringifyAttrs(attrs) {
  return [].map.call(attrs, attr => {
    return ` ${attr.name}=&quot;<span class="attr-value">${attr.value}</span>&quot;`;
  }).join('');
}

function escape(html) {
  return html
   .replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");
 }

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('gaia-dom-tree',this));
