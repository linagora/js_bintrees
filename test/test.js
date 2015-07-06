/*jslint node: true */
'use strict';

var RBTreeByIndex = require('../lib/rbtree_by_index');

var expect = require('chai').expect;
var chai = require('chai');
var spies = require('chai-spies');

chai.use(spies);

var acceptable = 'abcdefghijklmnopqrstuvwxyz';
var randomGenerator = function() {
  var index = Math.floor(Math.random() * acceptable.length);

  return acceptable.charAt(index);
};

var randomStringGenerator = function(len) {
  for (var i = 0, str = ''; i < len; i++) {
    str += randomGenerator();
  }
  return str;
};

var checkEquality = function(tree, array) {
  var index = 0;
  tree.each(function(node) {
    expect(node).to.equal(array[index++]);
  });
};

var printTree = function(tree) {
  var next = tree._root.min_tree();
  var depth;
  var str, i, index = 0;

  while (next) {
    depth = next.depth();
    for (str = index++ + ':', i = 0; i < depth; str += '\t', i++) {}
    if (next.parent && next.parent.left === next) {
      str += '/';
    } else if (next.parent && next.parent.right === next) {
      str += '\\';
    } else {
      str += '->';
    }

    str += next.data;

    console.log(str);

    next = next.successor();
  }

};

describe('the RBTreeByIndex class', function() {
  var tree;
  beforeEach(function() {
    tree = new RBTreeByIndex();
  });

  it('should have insert, remove, find, map and each operations', function() {
    expect(tree.insert).to.be.a('function');
    expect(tree.remove).to.be.a('function');
    expect(tree.each).to.be.a('function');
    expect(tree.map).to.be.a('function');
    expect(tree.find).to.be.a('function')

  });

  it('should have a size', function() {
    expect(tree.size).to.equal(0);

    tree.insert(0, 'foo');
    expect(tree.size).to.equal(1);
    tree.remove(0);
    expect(tree.size).to.equal(0);
  });

  describe('the insert function', function() {
    it('should be able to insert in an empty tree', function() {
      tree.insert(0, 'foo');
    });

    it('should be able to insert on the left of the root', function() {
      tree.insert(0, 'root');
      tree.insert(0, 'left of root');
      var expecting = ['left of root', 'root'];

      checkEquality(tree, expecting);
    });

    it('should be able to insert on the right of the root', function() {
      tree.insert(0, 'root');
      tree.insert(1, 'right of root');
      var expecting = ['root', 'right of root'];

      checkEquality(tree, expecting);
    });

    it('should be able to insert at another item\'s place in the tree', function() {
      tree.insert(0, '0');
      tree.insert(1, '1');
      tree.insert(2, '2');

      tree.insert(2, 'before 2');
      tree.insert(1, 'before 1');


      var expecting = ['0', 'before 1', '1', 'before 2', '2'];

      checkEquality(tree, expecting);
    });

    it('should be able to do that', function() {
      tree.insert(0 , '4');
      tree.insert(0 , '3');
      tree.insert(0 , '0');
      tree.insert(1 , '2');
      tree.insert(1 , '1');

      var expecting = ['0', '1', '2', '3', '4'];

      checkEquality(tree, expecting);
    });

    it('should be able to insert 10,000 elements without any error', function() {
      var myArray = [], randIndex, randString;
      for (var i = 0; i < 10000; i++) {
        randIndex = Math.floor(Math.random() * myArray.length);
        randString = randomStringGenerator(10);

        myArray.splice(randIndex, 0, randString);
        tree.insert(randIndex, randString);
      }
      checkEquality(tree, myArray);

    });
  });

  describe('the remove function', function() {
    it('should be able to remove a leaf', function() {
      tree.insert(0, '0');
      tree.insert(1, '1');
      tree.insert(2, '2');

      tree.remove(0);

      var expecting = ['1', '2'];

      checkEquality(tree, expecting);
    });

    it('should be able to remove the root', function() {
      tree.insert(0, 0);
      tree.insert(0, 1);
      tree.insert(0, 2);
      tree.insert(1, 3);

      tree.remove(2);

    });

    it('should be able to remove a node with only one left child', function() {
      tree.insert(0, '0');
      tree.insert(1, '1');
      tree.insert(2, '2');
      tree.insert(3, '3');
      /** The tree is
       *    0
       *  1
       *    2
       *      3
       * let's remove 2
      **/

      tree.remove(2);

      var expecting = ['0', '1', '3'];

      checkEquality(tree, expecting);
    });
    it('should be able to remove a node with only one left child', function() {
      tree.insert(0, '3');
      tree.insert(0, '2');
      tree.insert(0, '1');
      tree.insert(0, '0');
      /** The tree is
       *      0
       *    1
       *  2
       *    3
       * let's remove 1
      **/

      tree.remove(1);

      var expecting = ['0', '2', '3'];

      checkEquality(tree, expecting);
    });

    it('should be able to remove the rightmost node', function() {
      tree.insert(0, 0);
      tree.insert(1, 1);
      tree.insert(2, 2);
      tree.insert(3, 3);
      tree.insert(4, 4);

      tree.remove(4);

      checkEquality(tree, [0,1,2,3]);
    });


    it('should be able to remove node that has no children', function() {
      tree.insert(0, 0);
      tree.insert(0, 1);
      tree.insert(0, 2);
      tree.insert(1, 3);

      /** The tree is
       *    2
       *      `4
       *  1
       *    0
       * let's remove 4 (at position 2)
      **/
      tree.remove(1);

    });

    it('should be able to remove the last node of the tree', function() {
      tree.insert(0, 0);

      tree.remove(0);

      expect(tree.size).to.equal(0);
    });

    it('should be able to remove 10,001 nodes without error', function() {
      // Note: 10,101 because it looks nicer than '10,000', but for no other reason.
      // First insert 10,000 elements in the tree
      var array = [];
      var position;
      for (var i = 0; i < 10001; i++) {
        position = Math.floor(Math.random() * i);
        tree.insert(position, 'ins ' + i);
        array.splice(position, 0, 'ins ' + i);
      }

      // Then remove some randomly

      for (var i = 0; i < 10001; i++) {
        position = Math.floor(Math.random() * (tree.size -1));
        tree.remove(position);
        array.splice(position, 1);
      }

      checkEquality(tree, array);
    });
  });

  describe('the find function', function() {
    var iMax = 50;
    it('should return the good node', function() {
      for (var i = 0; i < iMax; i++) {
        tree.insert(i, i);
      }
      for (var i = 0; i < iMax; i++) {
        var element = tree.find(i);
        expect(element).to.equal(i);
      }
    });

    it('should be able to apply a function on each node traversed', function() {
      for (var i = 0; i < iMax; i ++) {
        tree.insert(i, i);
      }

      var spy = chai.spy();

      for (var i = 0; i < iMax; i++) {
        var spy = chai.spy();
        var node = tree.findNode(i, spy);

        // Check it has been called with each parent
        var parent = node.parent;
        while (parent) {
          expect(spy).to.have.been.called.with(parent);
          parent = parent.parent;
        }
      }
    });
  });

  describe('the map and each functions', function() {
    beforeEach(function() {
      for (var i = 0; i < 100; i ++) {
        tree.insert(i, i);
      }
    });

    it('map should return an array of node', function() {
      tree.map(function(data) { return data; }).forEach(function(element, index) {
        expect(element).to.equal(index);
      });
    });

    it('each should call the cb on each node', function() {
      var spy = chai.spy();
      tree.each(spy);

      expect(spy).to.have.been.called.exactly(tree.size);
      for (var i = 0; i < tree.size; i++) {
        expect(spy).to.have.been.called.with(tree.find(i));
      }
    });
  });

  describe('the nodes', function() {
    beforeEach(function() {
      for (var i = 0; i < 100; i ++) {
        tree.insert(i, i);
      }
    });

    it('should have a next, prev, depth function', function() {
      var check = function(node) {
        expect(node.next).to.be.a('function');
        expect(node.prev).to.be.a('function');
        expect(node.depth).to.be.a('function');
      };

      tree.eachNode(check);
    });

    it('should have a weight and children', function() {
      var check = function(node) {
        expect(node.weight).to.be.a('number');

        if (node.weight > 1) {
          if (!node.left) {
            expect(node.right).to.exist;
          } else {
            expect(node.left).to.exist;
          }
        } else {
          expect(node.right).to.not.exist;
          expect(node.left).to.not.exist;
        }
      }
    });
  });
});
