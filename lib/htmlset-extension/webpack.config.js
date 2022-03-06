const mathjaxDir = "../../../../mathjax";
const PACKAGE = require(`${mathjaxDir}/components/webpack.common.js`);
module.exports = PACKAGE(
    "htmlset", // the name of the package to build
    `${mathjaxDir}/mathjax/js`, // location of the mathjax library
    [
        // packages to link to
        "components/src/core/lib",
        "components/src/input/tex-base/lib",
    ],
    __dirname, // our directory
    "." // where to put the packaged component
);
