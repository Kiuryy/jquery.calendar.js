(() => {
    "use strict";

    /* eslint-disable no-console */
    /* global Func, path */

    global.modulePath = __dirname + "/node_modules/";
    require("../node.js_build/funcs");

    // SCSS Filewatcher -> <PATH_TO_node>/npm.cmd run scss

    /**
     * Starts building the application
     */
    const Build = () => {
        const start = +new Date();
        console.log("Building release...\n");

        Func.cleanPre().then(() => {
            return eslintCheck();
        }).then(() => {
        }).then(() => {
            return js();
        }).then(() => {
            return css();
        }).then(() => {
            return img();
        }).then(() => {
            return Func.cleanPost();
        }).then(() => {
            console.log("\nRelease built successfully\t[" + (+new Date() - start) + " ms]");
        });
    };

    /*
     * ################################
     * BUILD FUNCTIONS
     * ################################
     */

    /**
     * Parses the scss files and copies the css files to the dist directory
     *
     * @returns {Promise}
     */
    const css = () => {
        return new Promise((resolve) => {
            Func.minify([ // parse scss files
                path.src + "scss/*.scss"
            ], path.dist + "css/").then(() => {
                resolve();
            });
        });
    };

    /**
     * Copies the images to the dist directory
     *
     * @returns {Promise}
     */
    const img = () => {
        return new Promise((resolve) => {
            Func.copy([path.src + "img/**/*"], [path.src + "**/*.xcf"], path.dist, false).then(() => {
                resolve();
            });
        });
    };

    /**
     * Parses the js files and copies them to the dist directory
     *
     * @returns {Promise}
     */
    const js = () => {
        return new Promise((resolve) => {
            Func.minify([
                path.src + "js/*.js"
            ], path.dist + "js/").then(() => {
                resolve();
            });
        });
    };

    /**
     * Performs eslint checks for the build and src/js directories
     *
     * @returns {Promise}
     */
    const eslintCheck = async () => {
        for (const files of ["build.js", path.src + "js/**/*.js"]) {
            await Func.measureTime(async (resolve) => {
                Func.cmd("eslint --fix " + files).then((obj) => {
                    if (obj.stdout && obj.stdout.trim().length > 0) {
                        console.error(obj.stdout);
                        process.exit(1);
                    }
                    resolve();
                });
            }, "Performed eslint check for " + files);
        }
    };

    //
    //
    //
    Build();
})();