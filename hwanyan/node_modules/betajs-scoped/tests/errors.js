QUnit.test("double define", function(assert) {
	var S = Scoped.subScope();
	S.define("scope:Foobar", function () {
		return {};
	});
    assert.throws(function () {
		S.define("scope:Foobar", function () {
			return {};
		});
	});
});

QUnit.test("access undefined binding", function(assert) {
	var S = Scoped.subScope();
	S.binding("test", "scope:Test");
	S.require(["test:Foobar"], function () {});
    assert.throws(function () {
		S.require(["testx:Foobar"], function () {});
	});
});

QUnit.test("version requirement", function (assert) {
	S = Scoped.subScope();
	S.define("scope:First", function () {
		return {
			version: "42.12345"
		};
	});
	S.define("scope:Second", function () {
		return {
			version: "3.1415"
		};
	});
	S.assumeVersion("scope:First.version", 42);
    assert.throws(function () {
		S.assumeVersion("scope:Second.version", 4);
	});
});