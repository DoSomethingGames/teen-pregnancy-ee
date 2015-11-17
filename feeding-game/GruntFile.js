module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: [
      'deploy'
    ],
    connect: {
      server: {
        options: {
          port: 8080,
          base: './deploy'
        }
      }
    },
    copy: {
      main: {
        files: [
          {src: ['src/index.html'], dest: 'deploy/index.html'},
          {cwd: 'src/css', src: '**/*', dest: 'deploy/css', expand: true},
          {cwd: 'src/assets', src: '**/*', dest: 'deploy/assets', expand: true}
        ]
      }
    },
    concat: {
      dist: {
        src: [  "src/lib/**/*.js",
          "src/game/main.js",
          "src/game/game.js",
          "src/game/mouth.js"
           ],
        dest: 'deploy/js/<%= pkg.name %>.js'
      }
    },
    watch: {
      files: 'src/**/*.js',
      tasks: ['concat']
    },
    open: {
      dev: {
        path: 'http://localhost:8080/index.html'
      }
    }
  });

  grunt.registerTask('default', ['clean', 'copy', 'concat', 'connect', 'open', 'watch']);

}