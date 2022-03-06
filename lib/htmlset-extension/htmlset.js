//See https://docs.mathjax.org/en/latest/web/webpack.html#custom-build about building a custom extension, for example a TeX input extension, that takes advantage of the components already loaded, but implements additional functionality
//unpacked/extensions/bevelledFraction.js
import NodeUtil from "../js/input/tex/NodeUtil.js";
import { Configuration } from "../js/input/tex/Configuration.js";
import { CommandMap } from "../js/input/tex/SymbolMap.js";
import TexError from "../js/input/tex/TexError.js";

/*
import NodeUtil from "../NodeUtil.js";
import { Configuration } from "../Configuration.js";
import { CommandMap } from "../SymbolMap.js";
*/

const HtmlSetMethods = {};
/**
 * Parses the math argument of the above commands and returns it as single
 * node (in an mrow if necessary). The HTML attributes are then
 * attached to this element.
 * @param {TexParser} parser The calling parser.
 * @param {string} name The calling macro name.
 * @return {MmlNode} The math node.
 */
function GetArgumentMML(parser, name) {
    let arg = parser.ParseArg(name);
    if (!NodeUtil.isInferred(arg)) {
        return arg;
    }
    let children = NodeUtil.getChildren(arg);
    if (children.length === 1) {
        return children[0];
    }
    const mrow = parser.create("node", "mrow");
    NodeUtil.copyChildren(arg, mrow);
    NodeUtil.copyAttributes(arg, mrow);
    return mrow;
}
/**
 * Implements \setAttribute{key}{value}{math}
 * @param {TexParser} parser The calling parser.
 * @param {string} name The macro name.
 */
HtmlSetMethods.SetAttribute = function (parser, name) {
    let key = parser.GetArgument(name);
    let value = parser.GetArgument(name);
    const arg = GetArgumentMML(parser, name);
    NodeUtil.setAttribute(arg, key, value);
    parser.Push(arg);
};

new CommandMap(
    "htmlset_macros",
    {
        setAttribute: "SetAttribute",
    },
    HtmlSetMethods
);

export const HtmlSetConfiguration = Configuration.create("htmlset", {
    handler: { macro: ["htmlset_macros"] },
});
