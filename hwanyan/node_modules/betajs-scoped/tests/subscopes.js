QUnit.test("subscope load order 1", function(assert) {
	var S = Scoped.subScope();
	var S1 = S.subScope();
	S1.define("parent:First", function () {
		return {
			first: "first"
		};
	});
	var S2 = S.subScope();
	S2.define("parent:Second", ["parent:First"], function (First) {
		return {
			second: "second" + First.first
		};
	});
	S.require(["local:Second"], function (Second) {
        assert.equal(Second.second, "secondfirst");
	});
});


QUnit.test("subscope load order 2", function(assert) {
	var S = Scoped.subScope();
	var S2 = S.subScope();
	S2.define("parent:Common.Second.Inner", ["parent:Common.First.Inner"], function (First) {
		return {
			second: "second" + First.first
		};
	});
	var S1 = S.subScope();
	S1.define("parent:Common.First.Inner", function () {
		return {
			first: "first"
		};
	});
	S.require(["local:Common.Second.Inner"], function (Second) {
        assert.equal(Second.second, "secondfirst");
	});
});
