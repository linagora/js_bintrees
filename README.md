![Archived](https://img.shields.io/badge/Current_Status-archived-blue?style=flat)

Binary Trees [![Build Status](https://secure.travis-ci.org/vadimg/js_bintrees.png?branch=master)](http://travis-ci.org/vadimg/js_bintrees)
============

This package provides Binary and Red-Black Search Trees written in Javascript. It is released under the MIT License.

Binary Search Trees are a good way to store data in sorted order. A Red-Black tree is a variation of a Binary Tree that balances itself.

Algorithms were taken from Julienne Walker: http://eternallyconfuzzled.com/jsw_home.aspx and from Introduction to Algorithms, 3rd Edition, Cormen & Lesierson.

Trees
------------

* BinTree - Binary Search Tree
* RBTree - Red-Black Tree
* RBTreeByIndex - Red-Black Tree, insertion at index not at keys


Install
------------
node.js:

```
npm install bintrees
```

Quickstart for RBTreeByIndex
----------------------------

```javascript
var tree = new require('bintree').RBTreeByIndex();

tree.insert(0, 'position 0');
tree.insert(1, 'position 1');
// It will shift position 0 and position 1 by 1
tree.insert(0, 'oops, that`s the real 0 in fact');

var asArray = tree.map(function(data) { return data; });
// === ['oops, that`s the real 0 in fact', 'position 0', 'position 1']
```

You can run a benchmark here that show that the RBTree implementation beats a native array implementations for
insertion and deletion in big arrays.

Methods
------------

### insert(positon, item)
> Inserts the item into the tree at position. Returns the node created or null if an error occurred.

### insert_between(left, right, item)
> Inserts the item between left and right in the tree.  Returns the node created or null if an error occurred.

### remove(position)
> Removes the node at position from the tree. Returns true if removed, false if not found.

### removeNode(node)
> Removes the node from the tree. Returns true if removed, false if not found.

### size
> Number of nodes in the tree.

### find(position)
> Returns node data if found, null otherwise.

### min()
> Returns the min node data in the tree, or null if the tree is empty.

### max()
> Returns the max node data in the tree, or null if the tree is empty.

### each(f)
> Calls f on each node's data, in order.

### map(f)
> Calls f on each node's data, in order and return an array made of the return value of f applied on each node's data.

### reach(f)
> Calls f on each node's data, in reverse order.

### iterator()
> Returns a null-iterator. See __Iterators__ section below.

Iterators
------------

tree.iterator() will return a null-iterator. On a null iterator,
* next() will return the first element in the tree
* prev() will return the last element in the tree

Otherwise,
* next() will return the next element
* prev() will return the previous element
* data() will return the node the iterator is pointing to

When iteration reaches the end, the iterator becomes a null-iterator again.

Forward iteration example:

```javascript
var it=tree.iterator(), item;
while((item = it.next()) !== null) {
    // do stuff with item
}
```

If you are iterating forward through the tree, you can always call prev() to go back, and vice versa.

__NOTE:__ iterators become invalid when you add or remove elements from the tree.
