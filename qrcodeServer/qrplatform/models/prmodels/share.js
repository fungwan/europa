var verifier = require("../../common/tool").verifier;

var getConfig = {
    createNew: function () {
        return {
            projectid: '',
            update: false,
            recordid: '',
            generate: false
        };
    },
    verify: {
        projectid: verifier.isStringOrEmpty,
        recordid: verifier.isStringOrEmpty,
        generate: verifier.isStringOrEmpty,
        update: verifier.isStringOrEmpty
    }
};

var updateConfig = {
    createNew: function () {
        return {
            projectid: '',
            enable: 0,
            sharePoint: 0,
            shareMaxPoint: 0,
            helpPoint: 0,
            helpMaxPoint: 0
        };
    },
    verify: {
        projectid: verifier.isStringOrEmpty,
        enable: verifier.isInteger,
        sharePoint: verifier.isInteger,
        shareMaxPoint: verifier.isInteger,
        helpPoint: verifier.isInteger,
        helpMaxPoint: verifier.isInteger
    }
};

var help = {
    createNew: function () {
        return {
            recordid: ''
        };
    },
    verify: {
        recordid: verifier.isString
    }
};

module.exports = {
    getConfig: getConfig,
    updateConfig: updateConfig,
    help: help
};