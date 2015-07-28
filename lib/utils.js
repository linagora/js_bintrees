(function() {
  'use strict';
  var recurseExploreBlackNodes = function(root, numberOfBlack) {
    var onLeft, onRight;
    if (!root.red) {
      numberOfBlack++;
    }

    onLeft = root.left ? recurseExploreBlackNodes(root.left, numberOfBlack) : numberOfBlack;
    onRight = root.right ? recurseExploreBlackNodes(root.right, numberOfBlack) : numberOfBlack;

    if (onLeft !== onRight) {
      throw new Error('subtree of ' + root.data + ' has\'t the same number of black nodes');
    } else {
      return onLeft;
    }
  };

  var recurseExploreWeight = function(root) {
    var size = (root.left ? root.left.weight : 0) + (root.right ? root.right.weight : 0) + 1;

    if (size !== root.weight) {
      throw new Error('expected ' + size + ' to equal weight ' + root.weight + ' of ' + root.data);
    } else {
      if (root.left) {
        recurseExploreWeight(root.left);
      }
      if (root.right) {
        recurseExploreWeight(root.right);
      }
    }
  };

  module.exports = {
    print: function(tree, fun) {
      fun = fun || function(data) {
        return data;
      };

      var next = tree._root.min_tree();
      var depth;
      var lines = [], i, index = 0;
      var line;

      while (next) {
        depth = next.depth();
        for (line = index++ + ':', i = 0; i < depth; line += '\t', i++) {}
        if (next.parent && next.parent.left === next) {
          line += '/';
        } else if (next.parent && next.parent.right === next) {
          line += '\\';
        } else {
          line += '->';
        }

        line += fun(next.data);

        lines.push(line);

        next = next.next;
      }
      return lines.join('\n');

    },
    check: function(tree) {
      var errors = [];
      // Check 2
      if (tree._root && tree._root.red) {
        errors.push('the root should be black');
      }
      // Check 3
      Array.prototype.push.apply(errors, tree.mapNode(function(node) {
        var error;
        var errors = [];
        // Check 4
        if (node.red) {
          if (node.left && node.left.red) {
            errors.push('left child');
          }
          if (node.right && node.right.red) {
            errors.push('right child');
          }
        }

        error = errors.join(' and ') +
         (errors.length > 0 ? ' of red node ' + node.data + ' should be black' : '');

        return error;
      }).filter(function(err) {
        return err !== '';
      }));
      // Check 5
      try {
        if (tree._root) {
          recurseExploreBlackNodes(tree._root, 0);
        }
      } catch (err) {
        errors.push(err);
      }

      try {
        if (tree._root) {
          recurseExploreWeight(tree._root);
        }
      } catch (err) {
       errors.push(err);
      }

      if (errors.length > 0) {
        return errors;
      } else {
        return true;
      }
    }
  };
  // if (window !== undefined) {
  //   window.tree = module.exports;
  // }

})();
