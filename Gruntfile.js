module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        uglify: {
            main : {
                src: [ 'source/js/main.js','source/js/_lib/*.js','source/js/components/*.js'],
                dest: 'assets/js/main.js'
            }
        },
        less: {
            dist: {
                files: {
                    "assets/css/style.css": "source/less/main.less",
                    "assets/css/mobile.css": "source/less/mobile.less"
                }
            }
        },
        concat: {
            main : {
                src: [ 'source/js/_lib/*.js','source/js/components/*.js','source/js/main/*.js','source/js/main.js'],
                dest: 'assets/js/main.js'
            },
            mobile : {
                src: [ 'source/js/_lib/*.js','source/js/components/*.js','source/js/mobile/*.js','source/js/mobile.js'],
                dest: 'assets/js/mobile.js'
            }
        },
        browserSync: {
            bsFiles: {
                src: ['assets/css/*.css', 'assets/js/*.js', 'html/**/*.html']
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
        },
        wiredep: {

            task: {

                // Point to the files that should be updated when
                // you run `grunt wiredep`
                src: [
                    'html/**/*.html'
                ],

                options: {
                    // See wiredep's configuration documentation for the options
                    // you may pass:

                    // https://github.com/taptapship/wiredep#configuration
                }
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
    grunt.loadNpmTasks('grunt-wiredep');

    // Default task(s).
    //grunt.registerTask('default', ['uglify:main','less']);
    grunt.registerTask('default', ["browserSync", "watch", "uglify"]);

};