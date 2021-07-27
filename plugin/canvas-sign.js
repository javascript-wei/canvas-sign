/**
 * 在线签字插件
 * @author weilang
 * @since 2021-7
 */
const isType = (val) =>{
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}
const isObject = (val)=> {
    return isType(val) === 'object';
}
const isArray = (val) => {
    return isType(val) === 'array';
}
const isMobile = () => {
    return /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(window.navigator.userAgent);
}
const getElement = (el)=> {
    if (el && typeof el === 'object' && el.nodeType === 1 && typeof el.nodeName === 'string') return el;
    let canvas;
    try {
        canvas = document.querySelector(el);
    } catch (error) {
        throw new Error("Canvas reference not found!")
    }
    return canvas;
}
const defaultConfig = {
    //防止引用之间的值传递
    dataJson: () => {
        return {
            lineStyle: {},
            position: []
        }
    },
    defaultLineStyle: {
        strokeStyle: "black",
        lineWidth: 2,
        shadowBlur: '1',
        lineCap: 'round',
        shadowColor: 'black',  // 边缘颜色
        lineJoin: 'round',
    },
    version: 'v1.0'
}
class canvasSign {
    constructor(el, options = {}) {
        this.canvas = getElement(el);
        this.ctx = this.canvas.getContext("2d");
        this.isMouseDown = false;
        this.eventBus = {};
        this.lineStyle = {
            ...defaultConfig.defaultLineStyle,
            ...options
        }
        this.setLineStyle();
        this.darw();
        this.dataJson = [];
    }
    darw() {
        const arr = isMobile() ? ['touchstart', 'touchmove', 'touchend'] : ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];
        arr.forEach(item => {
            this.eventMan(item);
        })
    }
    /**
     * position (x，y)点位置
     * type 1：非导入 2：导入
    */
    creat(position = { x, y }, type = 1) {
        const creatC = () => {
            let ctx = this.ctx;
            ctx.lineTo(position.x, position.y);
            ctx.stroke();
        }
        if (type === 2) {
            creatC();
            return;
        }
        creatC();
        this.setJson(position, 'moving');
    }
    handleEvent() {
        const { left, top } = this.canvas.getBoundingClientRect();
        const mobile = isMobile();
        let drawend = (e) => {
            if (this.isMouseDown || isMobile()) {
                this.emit('drawend', e);
                this.setJson({ ...this.lineStyle }, 'end');
            }
        }
        const handleMove = (e) => {
            //判断pc端是否左键按下，移动端不需要做判断
            if ((!this.isMouseDown || e.which != 1) && !mobile) return;
            e = mobile ? e.touches[0] : e;
            this.emit('mousemoving', e);
            this.creat({ x: e.clientX - left + 0.5, y: e.clientY - top + 0.5 });
        }
        const handleLeave = (e) => {
            //鼠标按下时候移出canvas中并且松开
            drawend(e);
            this.isMouseDown = false;
            this.emit('mouseleave', e);
        }
        const handleUp = (e) => {
            drawend(e);
            this.isMouseDown = false;
            this.emit("mouseup", e);
        }
        const handleDown = (e) => {
            this.emit('mousedown', e);
            e = isMobile() ? e.touches[0] : e;
            this.setJson(defaultConfig.dataJson(), 'start');
            //按下键时候重置画笔
            this.ctx.beginPath();
            this.isMouseDown = true;
            const position = { x: e.clientX - left + 0.5, y: e.clientY - top + 0.5 };
            this.ctx.moveTo(position.x,position.y)
            this.creat({ x: position.x, y: position.y });
        }
        return { handleMove, handleDown, handleLeave, handleUp };
    }
    getPNGImage(canvas = this.canvas) {
        return canvas.toDataURL('image/png');
    }
    getJPGImage(canvas = this.canvas) {
        return canvas.toDataURL('image/jpeg');
    }
    eventMan(type, fn) {
        const handleEvent = this.handleEvent();
        const raf = window.requestAnimationFrame;
        const move = raf?(e)=>{
            raf(() => {
                handleEvent.handleMove(e);
              });
        }:handleEvent.handleMove;
        const defaultFn = {
            mousedown: handleEvent.handleDown,
            mouseleave: handleEvent.handleLeave,
            mouseup: handleEvent.handleUp,
            mousemove: move,
            //移动端
            touchmove: move,
            touchstart: handleEvent.handleDown,
            touchend: handleEvent.handleLeave
        }
        this.canvas.addEventListener(type, fn || defaultFn[type], false)
    }
    clear() {
        let width = this.canvas.width;
        let height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);
        this.dataJson = [];
        return this;
    }
    /**
     * style  线条样式
     * isSaveLineStyle 是否设置更新当前画笔样式
    */
    setLineStyle(style = {},isSaveLineStyle = true) {
        const ctx = this.ctx;
        const lineStyle =  isObject(style)? { ...this.lineStyle, ...style } : this.lineStyle;
        if(isSaveLineStyle){
            this.lineStyle = lineStyle;
        }
        Object.keys(lineStyle).forEach(key => {
            ctx[key] = lineStyle[key];
        });
        ctx.beginPath();
        return this;
    }
    /**
     * json json格式
     * type moving：绘制中 end.已结束绘制 start.开始绘制
    */
    setJson(value, type) {
        const dataJson = this.dataJson;
        const jsonLength = dataJson.length - 1;
        switch (type) {
            case 'moving':
                dataJson[jsonLength].position.push(value);
                break;
            case 'end':
                dataJson[jsonLength].lineStyle = value;
                break;
            case "start":
                dataJson.push(value);
                break;
        }
    }
    toJson(json) {
        if (json) this.dataJson = json;
        return {
            version: defaultConfig.version,
            dataJson: this.dataJson
        }
    }
    loadJson(arr = []) {
        this.dataJson = arr;
        console.log(isArray(arr));
        if (!isArray(arr)) throw new Error("loadjson requires an array!");
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            this.setLineStyle(item.lineStyle,false);
            item.position.map(point => {
                this.creat(point, 2);
            })
        };
        this.setLineStyle();
        return this;
    }
    drawImage(...arg) {
        this.ctx.drawImage(...arg);
        return this;
    }
    /**监听事件 
     *  mousemoving 鼠标移动（手指）时
     *  mouseup  鼠标（手指）松开按键
     *  mousedown 鼠标（手指）按下
     *  mouseleave 鼠标移出容器
     *  drawend   每一笔绘制结束
    */
    emit(name, target) {
        let arr = this.eventBus[name];
        if (arr) arr.map(cb => { cb(target); });
    }
    on(name, cb) {
        if (this.eventBus[name]) {
            this.eventBus[name].push(cb);
            return;
        }
        this.eventBus[name] = [cb];
        return this;
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = canvasSign;
}else{
    window.canvasSign = canvasSign;
}
// export default canvasSign;