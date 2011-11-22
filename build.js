({
    // the location of all the source files
    appDir: 'build',

    // the path to begin looking for modules. this is relative to appDir
    baseUrl: '.',

    // the directory to write the compiled scripts. this will emulate the
    // directory structure of appDir
    dir: 'dist',

    // explicitly specify the optimization method
    optimize: 'uglify',

    // no CSS optimization is necessary since we use the sass optimization tool
    optimizeCss: 'none',

    // everything is namespaced within the code, therefore this must be
    // here to route 'cilantro' to the baseUrl to ensure the "url" routes
    // to the correct file system location.
    paths: {
        'jquery': 'empty:',
        'backbone': 'empty:',
        'zepto': 'empty:'
    },

    // an array of modules to compile
    modules: [{
        name: 'synapse'
    }, {
        name: 'synapse/hooks/jquery',
        exclude: ['synapse/core', 'jquery']
    }, {
        name: 'synapse/hooks/zepto',
        exclude: ['synapse/core', 'zepto']
    }, {
        name: 'synapse/hooks/backbone-model',
        exclude: ['synapse/core', 'backbone']
    }, {
        name: 'synapse/hooks/backbone-view',
        exclude: ['synapse/core', 'synapse/hooks/jquery', 'backbone']
    }, {
        name: 'synapse/hooks/object',
        exclude: ['synapse/core']
    }]
})
