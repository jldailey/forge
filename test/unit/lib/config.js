var should = require( "should" );

describe( 'config', function() {

    var config;

    before( function( done ) {
        config = require( "../../../lib/config.js" );
        done();
    });

    describe( 'init()', function() {

        it( 'should read variables from a configuration file', function() {
            var parsed = config.init( "../../fixtures/config.json" );
            parsed.include.should.eql( ['somefile.js', 'somefile2.js']);
            parsed.daemon.should.equal( false );
        } );

        it( 'should return the default configuration object if no file is found', function() {
            var parsed = config.init('nofile.json');
            should.not.exist(parsed.include);
            should.not.exist(parsed.exclude);
        } );

        it( 'should override configuration values with environment variables', function() {
            process.env["FORGE_CFG_EXECUTE"] = 'someval';
            process.env["FORGE_CFG_DAEMON"] = true;
            var parsed = config.init('nofile.json');
            should.not.exist( parsed.include );
            should.not.exist( parsed.exclude );
            parsed.execute.should.equal( 'someval' );
            parsed.daemon.should.equal( 'true' );
        } );

        it( 'should merge an options object into configuration', function() {
            var parsed = config.init( "../../fixtures/config.json" );
            
            parsed.daemon.should.equal( 'true' );
        } );

    });

});