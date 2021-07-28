# canvas-sign
打造canvas签名组件
## Clone

```js
https://github.com/javascript-wei/canvas-sign.git
```
## demo
```js
https://github.com/javascript-wei/canvas-sign.git
```
## Use

支持pc和移动端，核心代码plugin/canvas-sign.js  
第一步初始化并且设置容器大小：
```js
const cv = document.getElementById("canvas");
const canvas = new canvasSign(cv);
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
实现思路以及细节参考：[canvas在线签名插件]()  
如果有什么问题或好的想法欢迎在参与讨论。