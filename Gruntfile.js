module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        uglify: {
            main : {
                src: [ 'source/js/**/*.js'],
                dest: 'assets/js/main.js'
            }
        },
        less: {
            dist: {
                files: {
                    "assets/css/style.css": "source/less/main.less"
                }
            }
        },
        concat: {
            main : {
                src: [ 'source/js/**/*.js'],
                dest: 'assets/js/main.js'
            }
        },
        browserSync: {
            bsFiles: {
                src: ['assets/css/*.css', 'assets/js/*.js']
            },
            options: {
                watchTask: true, // < VERY important
                proxy: "localhost:8888"

            }
        },
        sprite:{
            all: {
                src: 'source/tmp/sprites/*.png',
                dest: 'assets/images/icon/spritesheet.png',
                destCss: 'source/less/common/sprites.less'
            }
        },
        replace: {
            example: {
                src: ['source/less/common/sprites.less'],
                    overwrite: true,
                    replacements: [{
                    from: '../../../assets/images/icon/spritesheet.png',                   // string replacement
                    to: '../images/icon/spritesheet.png'
                }]
            }
        },
        watch : {
            scripts : {
                files : [ 'source/js/**/*.js' ],
                tasks : [ 'concat' ] //, 'uglify'
            },
           less: {
               files : [ 'source/less/**/*.less' ],
               tasks: ['less']
           }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-text-replace');

    // Default task(s).
    //grunt.registerTask('default', ['uglify:main','less']);
    grunt.registerTask('default', ["browserSync", "watch"]);

};