
all: dist/rbtree.min.js dist/bintree.min.js dist/rbtree_by_index.min.js

dist/rbtree.js: lib/rbtree.js lib/treebase.js
	./node_modules/.bin/reunion --ns RBTree $< > $@

dist/rbtree_by_index.js: lib/rbtree_by_index.js lib/treebase.js
		./node_modules/.bin/reunion --ns RBTreeByIndex $< > $@

dist/bintree.js: lib/bintree.js lib/treebase.js
	./node_modules/.bin/reunion --ns BinTree $< > $@

dist/bintree.min.js: dist/bintree.js
	curl --data-urlencode "js_code@$<" \
		-d "output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" \
		http://closure-compiler.appspot.com/compile \
		> $@

dist/rbtree_by_index.min.js: dist/rbtree_by_index.js
	curl --data-urlencode "js_code@$<" \
		-d "output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" \
		http://closure-compiler.appspot.com/compile \
		> $@

dist/rbtree.min.js: dist/rbtree.js
	curl --data-urlencode "js_code@$<" \
		-d "output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" \
		http://closure-compiler.appspot.com/compile \
		> $@
