"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron = require("electron");
function takeScreenshot(imageFormat) {
    if (imageFormat === void 0) { imageFormat = "image/png"; }
    var top = 0;
    var left = 0;
    var right = 0;
    var bottom = 0;
    var displays = electron.screen.getAllDisplays();
    displays.forEach(function (display) {
        var bounds = display.bounds;
        left = bounds.x < left ? bounds.x : left;
        top = bounds.y < top ? bounds.x : top;
        right = bounds.width + bounds.x > right ? bounds.width + bounds.x : right;
        bottom = bounds.height + bounds.y > bottom ? bounds.height + bounds.y : bottom;
    });
    var width = right - left;
    var height = bottom - top;
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    return new Promise(function (resolve, reject) {
        var handleStream = function (stream) {
            var video = document.createElement("video");
            video.style.cssText = "position:absolute;top:-12000px;left:-12000px;";
            video.onloadedmetadata = function () {
                video.style.height = width + "px";
                video.style.width = height + "px";
                ctx.drawImage(video, 0, 0, width, height);
                canvas.toBlob(function (blob) {
                    blobToBuffer(blob, function (err, buffer) {
                        if (err)
                            reject(err);
                        else
                            resolve(buffer);
                    });
                }, imageFormat);
                video.remove();
                try {
                    stream.getTracks()[0].stop();
                }
                catch (e) {
                    console.error(e);
                }
            };
            video.src = URL.createObjectURL(stream);
            document.body.appendChild(video);
        };
        electron.desktopCapturer.getSources({ types: ["screen"] }, function (error, sources) {
            if (error) {
                reject(error);
            }
            for (var i = 0; i < sources.length; ++i) {
                window.navigator.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: "desktop",
                            minWidth: width,
                            maxWidth: 12000,
                            minHeight: height,
                            maxHeight: 12000
                        }
                    }
                }, function (stream) { return handleStream(stream); }, function (e) { return (e); });
            }
        });
    });
}
exports.takeScreenshot = takeScreenshot;
;
function blobToBuffer(blob, callback) {
    var reader = new FileReader();
    function onLoadEnd(e) {
        reader.removeEventListener('loadend', onLoadEnd, false);
        if (e.error)
            callback(e.error);
        else
            callback(null, Buffer.from(reader.result));
    }
    reader.addEventListener('loadend', onLoadEnd, false);
    reader.readAsArrayBuffer(blob);
}
