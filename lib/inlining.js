/**
 * Created by azu on 2014/03/09.
 * LICENSE : MIT
 */
"use strict";
var falafel = require("falafel");
var fs = require("fs");
var _ = require("lodash");
var pather = require("path");
function createHelper(src) {
    return {
        // var add = require("./add")
        isVarRequire: function (node) {
            if (node.type !== "VariableDeclaration") {
                return false;
            }
            var firstDeclaration = node.declarations[0];
            return firstDeclaration.init.type === "CallExpression" &&
                firstDeclaration.init.callee.name === "require";
        },
        getVarIdentifierName: function (node) {
            var firstDeclaration = node.declarations[0];
            return firstDeclaration.id.name;
        },
        getVarRequireModulePath: function (node) {
            var firstDeclaration = node.declarations[0];
            return firstDeclaration.init["arguments"][0].value;
        },
        isModuleExport: function (node) {
            if (!(node.type === "ExpressionStatement" && node.expression.type === "AssignmentExpression")) {
                return false;
            }
            var left = node.expression.left;
            if (left.type !== "MemberExpression") {
                return false;
            }
            return left.object.name === "module" && left.property.name === "exports";
        },
        getModuleRightIdentifier: function (node) {
            var right = node.expression.right;
            if (right.type !== "Identifier") {
                return null;
            }
            return right.name;
        }
    }
}

var defaultOptions = {
    basedir: null
};
function inliningModule(filePath, entryData, opt) {
    var identifierName = entryData.identifierName;
    var src = fs.readFileSync(filePath, "utf-8");
    var helper = createHelper(src);
    var exportName;
    var output = falafel(src, function (node) {
        if (helper.isModuleExport(node)) {
            var moduleRightIdentifier = helper.getModuleRightIdentifier(node);
            if (moduleRightIdentifier !== identifierName) {
                exportName = moduleRightIdentifier;
            }
            node.update("");
        }
    });
    return {
        src: String(output).trim(),
        exportName: exportName
    };
}
function inlining(filePath, opt) {
    var options = _.merge(defaultOptions, opt);
    var basedir = options.basedir || pather.dirname(filePath) || process.cwd();
    var src = fs.readFileSync(filePath, "utf-8");
    var helper = createHelper(src);
    var output = falafel(src, function (node) {
        if (helper.isVarRequire(node)) {
            var requiredFilePath = helper.getVarRequireModulePath(node) + ".js";
            var resolvedFilePath = pather.resolve(basedir, requiredFilePath);
            var resultObject = inliningModule(resolvedFilePath, {
                // pass var name
                identifierName: helper.getVarIdentifierName(node)
            }, options);
            if (!resultObject.exportName) {
                // Identifier is Same
                node.update(resultObject.src);
            } else {
                // Identifier is Difference
                var init = node.declarations[0].init;
                init.update(resultObject.src);
            }
        }
        if (helper.isModuleExport(node)) {
            var moduleRightIdentifier = helper.getModuleRightIdentifier(node);
            if (moduleRightIdentifier) {
                node.update("");
            }
        }
    });
    console.log(output);
    console.log("\n===\n");

    return String(output);
}
module.exports = inlining;