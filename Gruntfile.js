'use strict';

module.exports = function(grunt) {
  var CI = grunt.option('ci');

  grunt.initConfig({
    env: {
      coverage: {
        APP_DIR_FOR_CODE_COVERAGE: '../test/coverage/instrument/app/'
      }
    },

    instrument: {
      files: 'lib/*.js',
      options: {
        lazy: true,
        basePath: 'test/coverage/instrument'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/test.js']
      }
    },

    storeCoverage: {
      options: {
        dir: 'test/coverage/reports'
      }
    },

    makeReport: {
      src: 'test/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'test/coverage/reports',
        print: 'detail'
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: CI && 'checkstyle',
        reporterOutput: CI && 'jshint.xml'
      },
      all: {
        src: [
          'Gruntfile.js',
          'lib/*.js',
        ]
      },
      quick: {
        // You must run the prepare-quick-lint target before jshint:quick,
        // files are filled in dynamically.
        src: []
      }
    },
    gjslint: {
      options: {
        flags: [
          '--disable 0110',
          '--nojsdoc',
          '-e test/karma-include'
        ],
        reporter: {
          name: CI ? 'gjslint_xml' : 'console',
          dest: CI ? 'gjslint.xml' : undefined
        }
      },
      all: {
        src: ['<%= jshint.all.src %>']
      },
      quick: {
        src: ['<%= jshint.quick.src %>']
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= jshint.all.src %>']
      },
      quick: {
        src: ['<%= jshint.quick.src %>']
      }
    },

    browserify: {
      main: {
        src: 'lib/rbtree_by_index.js',
        dest: 'dist/rbtree_by_index.js'
      },
      options: {
        browserifyOptions: {
          standalone: 'RBTreeByIndex'
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
  grunt.loadNpmTasks('grunt-gjslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lint-pattern');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-istanbul');

  grunt.registerTask('linters', 'Check code for lint', ['jshint:all', 'gjslint:all', 'lint_pattern:all']);
  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('test', ['env:coverage', 'instrument', 'mochaTest', 'storeCoverage', 'makeReport']);
  grunt.registerTask('default', ['linters', 'test', 'build']);
};
