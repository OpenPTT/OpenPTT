module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // uglify: {
    //   options: {
    //     banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    //   },
    //   build: {
    //     src: 'src/<%= pkg.name %>.js',
    //     dest: 'build/<%= pkg.name %>.min.js'
    //   }
    // }
    nggettext_extract: {
      pot: {
        files: {
          'po/template.pot': ['www/*.html', 'www/js/frontend/*.js', 'www/js/frontend/controllers/*.js']
        }
      },
    },
    nggettext_compile: {
      all: {
        options: {
          module: 'app'
        },
        files: {
          'www/js/frontend/translations.js': ['po/*.po']
        }
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  // grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  // grunt.registerTask('default', ['uglify']);

  grunt.loadNpmTasks('grunt-angular-gettext');
  grunt.registerTask('default', [
    'nggettext_extract',
    'nggettext_compile'
  ]);
  grunt.registerTask('translate', [
    'nggettext_extract'
  ]);
  grunt.registerTask('compile', [
    'nggettext_compile'
  ])
};
