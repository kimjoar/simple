var config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "browser",
    sources: [
        "lib/jquery-1.7.2.js",
        "lib/mustache.js",
        "lib/EventEmitter.js",
        "simple.js"
    ],
    tests: [
        "spec/*-spec.js"
    ]
};
