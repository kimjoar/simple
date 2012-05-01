var config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "browser",
    sources: [
        "vendor/jquery-1.7.2.js",
        "vendor/mustache.js",
        "lib/simple.js"
    ],
    tests: [
        "spec/*-spec.js"
    ]
};
