import * as electron from "electron";

export function takeScreenshot(imageFormat: string = "image/png"): Promise<Buffer> {

    var top: number = 0;
    var left: number = 0;
    var right: number = 0;
    var bottom: number = 0;
    var displays: Electron.Display[] = electron.screen.getAllDisplays();

    displays.forEach((display: electron.Display) => {
        var bounds: electron.Rectangle = display.bounds;

        left = bounds.x < left ? bounds.x : left;
        top = bounds.y < top ? bounds.x : top;

        right = bounds.width + bounds.x > right ? bounds.width + bounds.x : right;
        bottom = bounds.height + bounds.y > bottom ? bounds.height + bounds.y : bottom;
    });

    var width: number = right - left;
    var height: number = bottom - top;

    var canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

    return new Promise((resolve, reject) => {

        var handleStream: any = (stream) => {

            var video: HTMLVideoElement = document.createElement("video");
            video.style.cssText = "position:absolute;top:-12000px;left:-12000px;";

            video.onloadedmetadata = () => {
                video.style.height = width + "px";
                video.style.width = height + "px";

                ctx.drawImage(video, 0, 0, width, height);

                canvas.toBlob((blob: any) => {

                    blobToBuffer(blob, (err: Error, buffer: Buffer) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(buffer);
                        }
                    });
                }, imageFormat);

                video.remove();
                try {
                    stream.getTracks()[0].stop();
                } catch (e) {
                    console.error(e);
                }
            };

            video.src = URL.createObjectURL(stream);
            document.body.appendChild(video);
        };

        electron.desktopCapturer.getSources({ types: ["screen"] }, (error, sources) => {
            if (error) {
                reject(error);
            }

            for (let i: number = 0; i < sources.length; ++i) {
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
                } as any, (stream) => handleStream(stream), (e: any): void => (e));
            }
        });
    });
}

function blobToBuffer(blob: Blob, callback: any): any {
    var reader: FileReader = new FileReader();

    function onLoadEnd(e: any): any {
        reader.removeEventListener("loadend", onLoadEnd, false);
        if (e.error) {
            callback(e.error);
        } else {
            callback(null, Buffer.from(reader.result));
        }
    }

    reader.addEventListener("loadend", onLoadEnd, false);
    reader.readAsArrayBuffer(blob);
}