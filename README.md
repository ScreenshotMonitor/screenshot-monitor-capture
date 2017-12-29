# ScreenshotCapture

### Install
```
npm install screenshot-monitor-capturee --save
```

### Usage
```js
import { takeScreenshot } from "screenshot-monitor-capture";
const fs = require('fs');

takeScreenshot("image/png").then((buffer: Buffer) => {
	fs.writeFile("c:\\screen.png", buffer, (error: Error) => {
		if (error) {
			console.error(error);
		}
	});
});
```
