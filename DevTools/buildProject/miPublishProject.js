'use strict';
var e = require('commander'),
    r = require('path'),
    o = require("fs"),
    i = require("pump"),
    n = require('compressing'),
    t = require(r.join(r.resolve(__dirname, '../../../../../../'), 'bin/config/common')),
    a = t.project_dir,
    s = t.process_dir,
    c = t.API_LEVEL,
    l = t.SDK_VERSION,
    p = t.makeDirsSync;
e.version("version:" + l).usage("<packageName>").option("-t, --target [dir]", "\u8f93\u51fa\u7684\u76ee\u6807\u6587\u4ef6\u5939", "").description("\u6253\u6210\u53d1\u5e03\u5305").parse(process.argv);

class MiPublish {
    static build(callback) {
        var t = e.args[0],
            l = r.resolve(__dirname, '../../../../'),
            g = r.join(l, "project.json"),
            d = !(!e.target || !e.target.length) && e.target,
            u = r.join(l, "build"),
            f = d ? r.isAbsolute(d) ? d : r.join(s, d) : r.join(u, "publish");
        if (p(r.dirname(f)),
            p(r.dirname(u)),
            !o.existsSync(l) || !o.existsSync(g))
            return console.log("invalid package path"),
                void process.exit(1002);
        var j = JSON.parse(o.readFileSync(g).toString());
        j = {
                min_sdk_api_level: c,
                package_path: getProjectName(l),
                version_code: parseInt(j.version_code || "0"),
                entrance_scene: j.entrance_scene || {}
            },
            console.log(j),
            j = Buffer.from(JSON.stringify(j));
        var m = f.endsWith(".mpkg") ? f : f + ".mpkg";
        console.log("Ready to create publish package file:"),
            console.log(r.relative(s, m));
        var v = new n.zip.Stream,
            h = r.join(u, "project.json");
        o.writeFileSync(h, j),
            v.addEntry(h),
            o.readdirSync(r.join(u, getProjectName(l))).forEach(function(e) {
                if (e && "" != e && "build" != e && "project.json" != e && !e.startsWith(".")) {
                    var o = r.join(r.join(u, getProjectName(l)), e);
                    console.log("compressing:" + e),
                        v.addEntry(o)
                }
            }),
            i(v, o.createWriteStream(m), function(e) {
                e && console.log("failed to create publish file", e),
                    e || (console.log("Publish package file for publish is generated:"),
                        console.log(m), typeof callback === 'function' && callback())
            })
    }
}

function getProjectName(path) {
    const pathSplit = path.split('/');
    return pathSplit[pathSplit.length - 1];
}

module.exports = MiPublish;