(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.RBTreeByIndex = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var TreeBase = require('./treebase');
/** algorithm from Cormen, Leiserson - Introduction to algorithm **/

function RBTree() {
    this._root = null;
    this._nil = new Node('nil');
    this._nil.red = false;
    this._nil.weight = 0;

    Object.defineProperty(this, 'size', {
        get: function() {
            return this._root ? this._root.weight : 0;
        }
    });
}

RBTree.prototype = new TreeBase();

RBTree.prototype.insert = function(position, data) {
  var nodeToInsert = new Node(data);
  if (this.insert_node(position, nodeToInsert)) {
    return nodeToInsert;
  } else {
    return null;
  }
};

RBTree.prototype.insert_node = function(position, nodeToInsert) {
  if (position < 0 || position >= this.weight) {
    return false;
  }
  var node = this._root;
  var insertAfter;
  var left, right;

  if (!node) {
    this._root = nodeToInsert;
    this._root.red = false;
    return true;
  }

  while (true) {
    if (node.weight === position) { // Insert after max of node subtree
      insertAfter = node.max_tree(function(node) {
        node.weight += 1;
      });
      insertAfter.set_child('right', nodeToInsert);
      nodeToInsert.parent = insertAfter;
      break;
    } else {
      left = node.get_child('left');
      right = node.get_child('right');
      if (!left && position === 0) {
        node.weight += 1;
        node.set_child('left', nodeToInsert);
        nodeToInsert.parent = node;
        break;

      } else if (left && left.weight >= position) {
        node.weight += 1;
        node = left;

      } else if (right) {
        position -= (left ? left.weight : 0) + 1;
        node.weight += 1;
        node = right;

      } else {
        node.weight += 1;
        node.set_child('right', nodeToInsert);
        nodeToInsert.parent = node;
        break;
      }
    }
  }

  this.insert_correction(nodeToInsert);
  return true;
};

RBTree.prototype.insert_between = function(onLeft, onRight, data) {
  var newNode = new Node(data);
  // onLeft and onRight are neighbors, so they can't have an element in between.
  // For example, if onLeft exists, its right neighbor is either nil or right. If it's onRight,
  // then onRight has no child. If neither left and right exist, the tree is empty.
  if (onLeft && !onLeft.right) {
    onLeft.right = newNode;
    newNode.parent = onLeft;

    this.insert_correction(newNode);
  } else if (onRight && !onRight.left) {
    onRight.left = newNode;
    newNode.parent = onRight;

    this.insert_correction(newNode);
  } else {
    this.insert_node(0, newNode);
  }
  newNode.traverse_up(function(node, parent) {
    parent.weight = (parent.left ? parent.left.weight : 0) +
        (parent.right ? parent.right.weight : 0) + 1;
  });

  return newNode;
};

RBTree.prototype.rotate = function(side, node) {
  // all the comment are with the assumption that side === 'left'
  var neighbor;

  // get right neighbor
  neighbor = node.get_child(side, true);
  // neighbor's left tree becomes node's right tree
  node.set_child(side, neighbor.get_child(side), true);

  // if this right tree was non-empty
  if (neighbor.get_child(side)) {
    neighbor.get_child(side).parent = node; // attach neighbor's left child to node
  }
  neighbor.parent = node.parent; // link neighbor's parent to node's parent

  if (!node.parent) { // no parent === is_root
    this._root = neighbor;
  } else if (node === node.parent.get_child(side)) { // node is left child
    node.parent.set_child(side, neighbor); // node's parent left child is now neighbor
  } else {
    node.parent.set_child(side, neighbor, true); // node's parent right child is now neighbor
  }

  neighbor.set_child(side, node); // attach node on left of child
  node.parent = neighbor; // set node's parent to neighbor

  // update node's weight first, then
  node.weight = (node.left ? node.left.weight : 0) + (node.right ? node.right.weight : 0) + 1;
  neighbor.weight = (neighbor.left ? neighbor.left.weight : 0) + (neighbor.right ? neighbor.right.weight : 0) + 1;
};

RBTree.prototype.insert_correction = function(node) {
  var self = this;
  function helper(side) {
    var uncle;
    uncle = node.parent.parent.get_child(side, true);

    if (uncle && uncle.red) { // if uncle is undefined, it's a leaf so it's black
      node.parent.red = false;
      uncle.red = false;
      node.parent.parent.red = true;

      node = node.parent.parent;
    } else {
      if (node === node.parent.get_child(side, true)) {
        node = node.parent;
        self.rotate(side, node);
      }

      node.parent.red = false;
      node.parent.parent.red = true;

      var oppositeSide = side === 'left' ? 'right' : 'left';
      self.rotate(oppositeSide, node.parent.parent);
    }
  }


  while (node.parent && node.parent.red) { // is there's no node.parent, then it means the parent
    // is nil which is black

    // if node's parent is on left of his parent
    if (node.parent === node.parent.parent.get_child('left')) { // Check that there is a grandparent
      helper('left');
    } else if (node.parent === node.parent.parent.get_child('right')) {
      helper('right');
    }
  }

  this._root.red = false;

};

RBTree.prototype.find = function() {
  var node = this.findNode.apply(this, arguments);
  if (node) {
    return node.data;
  } else {
    return null;
  }
};

/** Find the node at position and return it. If no node is found, returns null.
  * It is also possible to pass a function as second argument. It will be called
  * with each node traversed except for the one found.
  **/
RBTree.prototype.findNode = function(position, fun) {
  var left, right;
  // if the weight is 'n', the biggest index is n-1, so we check that position >= size
  if (position >= this.size || position < 0) {
    return null;
  }
  var node = this._root;

  // Find node to delete
  while (position > 0 || (position === 0 && node.left)) {
    left = node.left;
    right = node.right;

    if (left && left.weight > position) {
      // when there's a left neighbor with a weight > position to remove,
      // go into this subtree and decrease the subtree weight
      if (fun) {
        fun(node);
      }
      node = left;

    } else if ((!left && position === 0) || (left && left.weight === position)) {
      break;
    } else if (right) {
      // when there's a right subtee, go into it and decrease the position
      // by the weight of the left subtree - 1 + 1 (for the previous node)
      if (fun) {
        fun(node);
      }
      node = right;
      position -= (left ? left.weight : 0) + 1;

    } else {
      // this should not happen, except if the position is greater than the size of the tree
      throw new Error('this should not happen');
    }
  }
  return node;
};

RBTree.prototype.remove = function(position) {
  // if the weight is 'n', the biggest index is n-1, so we check that position >= size
  var nodeToRemove;

  nodeToRemove = this.findNode(position, function(node) { node.weight--; });

  return this.remove_helper(nodeToRemove);
};

RBTree.prototype.remove_helper = function(nodeToRemove) {
  var nextNode, childNode, parent;

  // if there's only one child, replace the nodeToRemove to delete by it's child and update
  // the refs.
  // if there's two children, find it's successor and replace the nodeToRemove to delete by his successor
  // and update the refs

  if (!nodeToRemove.left || !nodeToRemove.right) {
    nextNode = nodeToRemove;
  } else {
    nextNode = nodeToRemove.getNext(function(node) {
      node.weight -= 1;
    });
  }

  if (nextNode.left) {
    childNode = nextNode.left;
    parent = nextNode.parent;
  } else {
    childNode = nextNode.right;
    parent = nextNode.parent;
  }

  if (childNode) {
    childNode.parent = nextNode.parent;
  }


  if (!nextNode.parent) {
    this._root = childNode;
  } else {
    if (nextNode === nextNode.parent.left) {
      nextNode.parent.left = childNode;
    } else {
      nextNode.parent.right = childNode;
    }
  }

  // replace nodeToRemove's data by nextNode's (same as removing nodeToRemove, then inserting nextNode at his place
  // but easier and more efficient)
  if (nextNode !== nodeToRemove) {
    nodeToRemove.data = nextNode.data;
    nodeToRemove.weight = (nodeToRemove.left ? nodeToRemove.left.weight : 0) +
      (nodeToRemove.right ? nodeToRemove.right.weight : 0) + 1;

  }

  if (!nextNode.red) {
    this.remove_correction(childNode, parent);
  }

  return nextNode;
};

RBTree.prototype.remove_node = function(node) {
  node.traverse_up(function(node, parent) {
    parent.weight--;
  });

  return this.remove_helper(node);
};

RBTree.prototype.remove_correction = function(node, parent) {
  var self = this;
  var oppositeSide;
  var tmp;
  var helper = function(side) {
    var neighbor = parent.get_child(side, true);

    if (neighbor && neighbor.red) {
      neighbor.red = false;
      parent.red = true;

      self.rotate(side, parent);
      neighbor = parent.get_child(side, true);
    }

    if ((!neighbor.left || !neighbor.left.red) && (!neighbor.right || !neighbor.right.red)) {
      neighbor.red = true;
      node = parent;
      parent = node.parent;
    } else {
      if (!neighbor.get_child(side, true) || !neighbor.get_child(side, true).red) {
        if (neighbor.get_child(side)) {
          neighbor.get_child(side).red = false;
        }
        neighbor.red = true;

        oppositeSide = side === 'left' ? 'right' : 'left';
        self.rotate(oppositeSide, neighbor);
        neighbor = parent.get_child(side, true);
      }

      neighbor.red = parent ? parent.red : false;
      parent.red = false;
      if (neighbor.get_child(side, true)) {
        neighbor.get_child(side, true).red = false;
      }

      self.rotate(side, parent);
      node = self._root;
      parent = node.parent;
    }
  };
  while (node !== this._root && (!node || !node.red)) {
    if (node === parent.get_child('left')) {
      tmp = helper('left');
    } else if (node === parent.get_child('right')) {
      tmp = helper('right');
    }
  }

  if (node) {
    node.red = false;
  }
};


function Node(data, name) {
    this._dataBindName = name || 'node';
    this._data = data;

    this.left = null;
    this.right = null;
    this.parent = null;
    this.red = true;
    this.weight = 1;

    Object.defineProperty(this, 'next', {
        get: function() {
            return this.getNext();
        }
    });
    Object.defineProperty(this, 'prev', {
        get: function() {
            return this.getPrev();
        }
    });

    Object.defineProperty(this, 'data', {
        get: function() {
            return this._data;
        },
        set: function(data) {
            this._data = data;
            // bind the data to this
            data[this._dataBindName] = this;
        }
    });

}

Node.prototype.get_child = function(side, opposite) {
  if (opposite) {
    side = (side === 'left') ? 'right' : 'left';
  }
  return side === 'left' ? this.left : this.right;
};

Node.prototype.set_child = function(side, node, opposite) {
  if (opposite) {
    side = (side === 'left') ? 'right' : 'left';
  }

  if (side === 'left') {
    this.left = node;
  } else {
    this.right = node;
  }
};

Node.prototype.max_tree = function(fun) {
  var node = this;

  if (fun) {
    fun(node);
  }

  while (node.right) {
    node = node.right;
    if (fun) {
      fun(node);
    }
  }

  return node;
};

Node.prototype.min_tree = function(fun) {
  var node = this;

  if (fun) {
    fun(node);
  }

  while (node.left) {
    node = node.left;
    if (fun) {
      fun(node);
    }
  }

  return node;
};

Node.prototype.getNext = function(fun) {
  var node, parent;
  if (this.get_child('right')) {
    return this.get_child('right').min_tree(fun);
  }
  if (fun) {
    fun(this);
  }
  node = this;
  parent = this.parent;
  while (parent && node === parent.get_child('right')) {
    node = parent;
    parent = node.parent;
    if (fun) {
      fun(parent);
    }
  }
  return parent;
};
Node.prototype.getPrev = function(fun) {
  var node, parent;
  if (this.get_child('left')) {
    return this.get_child('left').max_tree(fun);
  }
  if (fun) {
    fun(this);
  }
  node = this;
  parent = this.parent;
  while (parent && node === parent.get_child('left')) {
    node = parent;
    parent = node.parent;
    if (fun) {
      fun(parent);
    }
  }
  return parent;
};


/** Traverse the tree upwards until it reaches the top. For each node traversed,
  * call the function passed as argument with arguments node, parent.
  * The function will be called h-1 times, h being the height of the branch.
  **/
Node.prototype.traverse_up = function(fun) {
  var parent = this.parent;
  var node = this;

  while (parent) {
    fun(node, parent);
    node = parent;
    parent = parent.parent;
  }
};

Node.prototype.depth = function() {
  var depth = 0;
  this.traverse_up(function() {
    depth++;
  });
  return depth;
};

Node.prototype.position = function() {
  var position = this.left ? this.left.weight : 0;
  var countFun = function(node, parent) {
    if (parent.right === node) {
      // for the left subtree
      if (parent.left) {
        position += parent.left.weight;
      }
      position += 1; // for the parent
    }
  };

  this.traverse_up(countFun);
  return position;
};

module.exports = RBTree;

},{"./treebase":2}],2:[function(require,module,exports){
'use strict';

var Iterator;
function TreeBase() {}

// removes all nodes from the tree
TreeBase.prototype.clear = function() {
    this._root = null;
};

// returns node data if found, null otherwise
TreeBase.prototype.find = function(data) {
    var res = this._root;

    while (res !== null) {
        var c = this._comparator(data, res.data);
        if (c === 0) {
            return res.data;
        } else {
            res = res.get_child(c > 0);
        }
    }

    return null;
};

// returns iterator to node if found, null otherwise
TreeBase.prototype.findIter = function(data) {
    var res = this._root;
    var iter = this.iterator();

    while (res !== null) {
        var c = this._comparator(data, res.data);
        if (c === 0) {
            iter._cursor = res;
            return iter;
        } else {
            iter._ancestors.push(res);
            res = res.get_child(c > 0);
        }
    }

    return null;
};

// Returns an interator to the tree node at or immediately after the item
TreeBase.prototype.lowerBound = function(item) {
    var cur = this._root;
    var iter = this.iterator();
    var cmp = this._comparator;

    while (cur !== null) {
        var c = cmp(item, cur.data);
        if (c === 0) {
            iter._cursor = cur;
            return iter;
        }
        iter._ancestors.push(cur);
        cur = cur.get_child(c > 0);
    }

    for (var i = iter._ancestors.length - 1; i >= 0; --i) {
        cur = iter._ancestors[i];
        if (cmp(item, cur.data) < 0) {
            iter._cursor = cur;
            iter._ancestors.length = i;
            return iter;
        }
    }

    iter._ancestors.length = 0;
    return iter;
};

// Returns an interator to the tree node immediately after the item
TreeBase.prototype.upperBound = function(item) {
    var iter = this.lowerBound(item);
    var cmp = this._comparator;

    while (cmp(iter.data(), item) === 0) {
        iter.next();
    }

    return iter;
};

// returns null if tree is empty
TreeBase.prototype.min = function() {
    var res = this._root;
    if (res === null) {
        return null;
    }

    while (res.left !== null) {
        res = res.left;
    }

    return res.data;
};

// returns null if tree is empty
TreeBase.prototype.max = function() {
    var res = this._root;
    if (res === null) {
        return null;
    }

    while (res.right !== null) {
        res = res.right;
    }

    return res.data;
};

// returns a null iterator
// call next() or prev() to point to an element
TreeBase.prototype.iterator = function() {
    return new Iterator(this);
};


TreeBase.prototype.eachNode = function(cb) {
    var it = this.iterator(), node;
    var index = 0;
    while ((node = it.next()) !== null) {
        cb(node, index);
        index++;
    }
};

// calls cb on each node's data, in order
TreeBase.prototype.each = function(cb) {
    this.eachNode(function(node, index) {
        cb(node.data, index);
    });
};


TreeBase.prototype.mapNode = function(cb) {
    var it = this.iterator(), node;
    var results = [];
    var index = 0;
    while ((node = it.next()) !== null) {
        results.push(cb(node, index));
        index++;
    }
    return results;
};

// calls cb on each node-s data, store the result and return it
TreeBase.prototype.map = function(cb) {
    return this.mapNode(function(node, index) {
        return cb(node.data, index);
    });
};

Iterator = function(tree) {
    this._tree = tree;
    this._ancestors = [];
    this._cursor = null;
};

Iterator.prototype.data = function() {
    return this._cursor !== null ? this._cursor.data : null;
};

// if null-iterator, returns first node
// otherwise, returns next node
Iterator.prototype.next = function() {
    if (this._cursor === null) {
        var root = this._tree._root;
        if (root !== null) {
            this._minNode(root);
        }
    } else {
        if (this._cursor.right === null) {
            // no greater node in subtree, go up to parent
            // if coming from a right child, continue up the stack
            var save;
            do {
                save = this._cursor;
                if (this._ancestors.length) {
                    this._cursor = this._ancestors.pop();
                } else {
                    this._cursor = null;
                    break;
                }
            } while (this._cursor.right === save);
        } else {
            // get the next node from the subtree
            this._ancestors.push(this._cursor);
            this._minNode(this._cursor.right);
        }
    }
    return this._cursor !== null ? this._cursor : null;
};

// if null-iterator, returns last node
// otherwise, returns previous node
Iterator.prototype.prev = function() {
    if (this._cursor === null) {
        var root = this._tree._root;
        if (root !== null) {
            this._maxNode(root);
        }
    } else {
        if (this._cursor.left === null) {
            var save;
            do {
                save = this._cursor;
                if (this._ancestors.length) {
                    this._cursor = this._ancestors.pop();
                } else {
                    this._cursor = null;
                    break;
                }
            } while (this._cursor.left === save);
        } else {
            this._ancestors.push(this._cursor);
            this._maxNode(this._cursor.left);
        }
    }
    return this._cursor !== null ? this._cursor : null;
};

Iterator.prototype._minNode = function(start) {
    while (start.left !== null) {
        this._ancestors.push(start);
        start = start.left;
    }
    this._cursor = start;
};

Iterator.prototype._maxNode = function(start) {
    while (start.right !== null) {
        this._ancestors.push(start);
        start = start.right;
    }
    this._cursor = start;
};

module.exports = TreeBase;

},{}]},{},[1])(1)
});