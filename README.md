# canvas-sign
打造canvas签名组件

## Use
```js
npm install canvas-sign-online --save
```
支持pc和移动端，核心代码plugin/canvas-sign.js  
第一步初始化并且设置容器大小：
```js
import CanvasSign from "canvas-sign-online";

const cv = document.getElementById("canvas");
const canvas = new CanvasSign(cv);
/** 注意：canvas的宽高需要在属性上设置，而不是style */
cv.width = '500';
cv.height = '500';
```
第二步画笔设置样式：
```js
canvas.setLineStyle({
    strokeStyle: "black",
    lineWidth: 2,
    shadowBlur: '1',
    lineCap: 'round',
    shadowColor: 'black',
    lineJoin: 'round',
})
```
接下来就是自由绘制了。  
绘制完成过后导出：
```js
const img = document.createElement("a");
img.href = canvas.getPNGImage();
img.download = "canvas-sign.png";
img.style.display = "none";
document.body.appendChild(img);
img.click();
document.body.removeChild(img);
```
导入json：
```js
canvas.loadJson(dataJson);
```
最后，祝使用愉快！
## Realization idea
实现思路以及细节参考：[canvas在线签名插件](https://juejin.cn/post/6989985162599596063/)  
如果有什么问题或好的想法欢迎在参与讨论。