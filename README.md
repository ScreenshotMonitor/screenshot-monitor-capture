# ScreenshotCapture

### Install
```
npm install screenshot-monitor-capture --save
```

### Usage
```js
import { takeScreenshot, Data } from "screenshot-monitor-capture";
const fs = require('fs');

takeScreenshot("image/png").then((data: Data) => {
	fs.writeFile("c:\\screen.png", data.buffer, (error: Error) => {
		if (error) {
			console.error(error);
		}
	});
});
```
