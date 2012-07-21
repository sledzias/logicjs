var myString = "Hello Backbone.js";
test( "Our first QUnit test - asserting results", function(){
    // ok( boolean, message )
    ok( true, "the test succeeds");
    //ok(false, "the test fails");
    // equal( actualValue, expectedValue, message )
    equal( myString, "Hello Backbone.js", "The value expected is Hello Backbone.js!");
});