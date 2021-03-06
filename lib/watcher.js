/*
    forge - A Node.js tool for continuous integration
    version:    0.1.1
    author:     Brian Edgerton <bedgerton@appendto.com> (http://appendto.com)
    copyright:  2012
    license:    Dual licensed
                MIT (http://www.opensource.org/licenses/mit-license)
                GPL (http://www.opensource.org/licenses/gpl-license)
*/

// @TODO: add ability to read excludes from .gitignore file
// @TODO: add watcher.path config for watch tree base

var wt = require( "fs-watch-tree" ),
    _ = require( "underscore" ),
    logger = require( "./logger.js" ),
    postal = require( "postal" ),
    path = require( "path" ),
    fs = require( "fs" ),
    Watcher = {

        watch: null,
        options: null,
        directory: null,

        init: function( app ) {
            var exclude = [];

            if ( app.config.watch.exclude ) {
                exclude = exclude.concat( app.config.watch.exclude );
            }

            exclude = _.uniq( _.compact( exclude ) );

            Watcher.options = {
                exclude: exclude
            };

            Watcher.directory = app.config.watch.path ? path.resolve( app.directory + "/" + app.config.watch.path ) : app.directory;

            postal.channel("forge", "update.start").subscribe( function( msg ) {
                // Stop watcher so it doesn't go crazy when new files are pulled in
                Watcher.stop();
            } );

            postal.channel("forge", "update.end").subscribe( function( msg ) {
                // Restart watcher
                Watcher.start();
            } );
            return Watcher;
        },

        start: function() {
            logger.forge.info( "forge is watching " + Watcher.directory + " for changes");

            Watcher.watch = wt.watchTree( Watcher.directory, Watcher.options, function( event ) {
                logger.forge.info( "File changed: " + event.name );
                postal.channel( "application", "signal.restart" ).publish( {changedFile: event.name} );
            });
        },

        stop: function() {
            logger.forge.info( "forge is stopping directory watching" );
            Watcher.watch.end();
        }
    };

module.exports = Watcher;