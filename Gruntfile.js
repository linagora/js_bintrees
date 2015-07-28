module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/test.js']
      }
    },
    browserify: {
      main: {
        src: 'lib/rbtree_by_index.js',
        dest: 'dist/rbtree_by_index.js'
      },
      options: {
        browserifyOptions: {
          standalone: 'RBTree'
        }
      }
    },
    uglify: {
      main: {
        src: 'dist/rbtree_by_index.js',
        dest: 'dist/rbtree_by_index.min.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('default', ['mochaTest', 'build']);
};
