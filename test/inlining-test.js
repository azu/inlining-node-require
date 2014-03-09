/**
 * Created by azu on 2014/03/09.
 * LICENSE : MIT
 */
"use strict";
var assert = require("power-assert");
var fs = require("fs");
var inlining = require("../lib/inlining");
var esformatter = require('esformatter');

describe("inlining", function () {
    context("with example", function () {
        var ex_add = fs.readFileSync(__dirname + "/../example/add.js", "utf-8");
        var ex_index = fs.readFileSync(__dirname + "/../example/index.js", "utf-8");
        var ex_result = fs.readFileSync(__dirname + "/../example/result.js", "utf-8");
        it("should concat", function () {
            var result = inlining(__dirname + "/../example/index.js");
            assert.equal(result, ex_result);
        });
    });
    context("with fixture", function () {
        var ex_result = fs.readFileSync(__dirname + "/fixture/difference_var/result.js", "utf-8");
        it("should concat", function () {
            var result = inlining(__dirname + "/fixture/difference_var/index.js");
            assert.equal(result, ex_result);
        });
    });
    context("with nest fixture", function () {
        var ex_result = fs.readFileSync(__dirname + "/fixture/nest_module/result.js", "utf-8");
        it("should concat", function () {
            var result = inlining(__dirname + "/fixture/nest_module/a.js");
            assert.equal(result, ex_result);
        });
    });
});