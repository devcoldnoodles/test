function DispatchEventHandler(type) {
    let handle = null;
    if(type == null)
        throw new Error("type is null");
    switch (type.toLowerCase()) {
        case "keyboard":
            handle = {
                __proto__: new Array(),
                onkeydown : null,
                onkeypress : null, 
                onkeyup : null,
                event : null,
            };
            window.addEventListener("keydown", function (e) {
                handle[e.keyCode] = true;
                handle.event = e;
                if (handle.onkeydown)
                    return handle.onkeydown(e);
                return true;
            });
            window.addEventListener("keypress", function(e){
                handle.event = e;
                if(handle.onkeypress)
                    return handle.onkeypress(e);
                return true;
            })
            window.addEventListener("keyup", function (e) {
                handle[e.keyCode] = false;
                handle.event = e;
                if (handle.onkeyup)
                    return handle.onkeyup(e);
                return true;
            });
            window.addEventListener("blur", function (e) {
                for(var seq = 0; seq < 256; ++seq)
                    handle[seq] = false;
            });
            break;
        case "mouse":
            handle = {
                __proto__ : [],
                onmousedown : null,
                onmousemove : null,
                onmouseup : null,
                event : null,
                cursor : new vec2(),
                click : new vec2(),
                left: 0,
                middle: 1,
                right: 2,
            };
            window.addEventListener("mousedown", function (e) {
                handle[e.button] = true;
                handle.event = e;
                if (handle.onmousedown)
                    return handle.onmousedown(e);
                return true;
            });
            window.addEventListener("mousemove", function (e) {
                handle.event = e;
                if (handle.onmousemove)
                    return handle.onmousemove(e);
                return true;
            });
            window.addEventListener("mouseup", function (e) {
                handle.event = e;
                if (handle.onmouseup)
                    return handle.onmouseup(e);
                handle[e.button] = false;
                return true;
            });
            window.addEventListener("blur", function (e) {
                for(var seq = 0; seq < 3; ++seq)
                    handle[seq] = false;
            });
            break;
    }
    return handle;
}

class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new vec2(this.x, this.y);
    }
    update(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    indicate(angle, f) {
        let force = f || magnitude();
        this.x = force * Math.cos(angle);
        this.y = force * Math.sin(angle);
        return this;
    }
    static indicate(angle, f) {
        return new vec2(f * Math.cos(angle), f * Math.sin(angle));
    }
    angle(other){
        return Math.atan2(other.y - this.y, other.x - this.x);
    }
    equals(other, admitable) {
        let value = admitable || 0;
        if (!(Math.abs(this.x - other.x) < value) || !(Math.abs(this.y - other.y) < value))
            return false;
        return true;
    }
    add() {
        switch(arguments.length)
        {
            case 1:
                if (arguments[0] instanceof vec2 == false)
                    throw new Error("argument exception");
                this.x += arguments[0].x;
                this.y += arguments[0].y;
                break;
            case 2:
                this.x += arguments[0];
                this.y += arguments[1];
                break;
            default:
                throw new Error("argument exception");
        }
        return this;
    }
    sub() {
        switch(arguments.length)
        {
            case 1:
                if (arguments[0] instanceof vec2 == false)
                    throw new Error("argument exception");
                this.x -= arguments[0].x;
                this.y -= arguments[0].y;
                break;
            case 2:
                this.x -= arguments[0];
                this.y -= arguments[1];
                break;
            default:
                throw new Error("argument exception");
        }
        return this;
    }
    mul() {
        switch(arguments.length)
        {
            case 1:
                if (arguments[0] instanceof vec2 == false)
                    throw new Error("argument exception");
                this.x *= arguments[0].x;
                this.y *= arguments[0].y;
                break;
            case 2:
                this.x *= arguments[0];
                this.y *= arguments[1];
                break;
            default:
                throw new Error("argument exception");
        }
        return this;
    }
    div() {
        switch(arguments.length)
        {
            case 1:
                if (arguments[0] instanceof vec2 == false)
                    throw new Error("argument exception");
                this.x /= arguments[0].x;
                this.y /= arguments[0].y;
                break;
            case 2:
                this.x /= arguments[0];
                this.y /= arguments[1];
                break;
            default:
                throw new Error("argument exception");
        }
        return this;
    }
    toString() {
        return `vec2(${this.x}, ${this.y})`;
    }
}

class Engine {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.objects = [];
        this.colliders = [];
        this.camera;
        this.sync = [];
        this.frame = 33;
        this.now = 0;
        this.keyboard = DispatchEventHandler("keyboard");
        this.mouse = DispatchEventHandler("mouse");
    }
    Initialize(id) {
        this.canvas = document.getElementById(id);
        if(!this.canvas) {
            this.canvas = document.createElement("canvas", { id: id, width: document.body.clientWidth, height: document.body.clientHeight });
            document.appendChild(this.canvas);
        }
        this.context = canvas.getContext("2d");
        this.mouse.onmousedown = function(e) {
            for(let seq in this.objects)
                if(this.objects[sync[seq]].active && objects[sync[seq]].isclick && objects[sync[seq]].onclick && objects[sync[seq]].isclick(e.x, e.y))
                    objects[sync[seq]].onclick(e.x, e.y);
            return true;
        }
        mouse.onmousemove = function(e) {
            let selected = null;
            for(let seq in objects)
                if(objects[sync[seq]].active && objects[sync[seq]].isclick && objects[sync[seq]].isclick(e.x, e.y)) {
                    selected = objects[sync[seq]];
                    if(mouse.focus) {
                        if(mouse.focus == selected)
                            mouse.focus.onstay(e);
                        else
                            mouse.focus.onblur(e);
                    }
                    selected.onfocus(e);
                    break;
                }
            if(!selected && mouse.focus && mouse.focus.onblur)
                mouse.focus.onblur(e);
            if(mouse.selected && mouse.selected.ondrag)
                mouse.selected.ondrag(e);
            mouse.focus = selected;
            return true;
        }
        mouse.onmouseup = function(e) {
            if(mouse.selected && mouse.selected.onclicked)
                mouse.selected.onclicked(e.x, e.y);
            mouse.selected = null;
            return true;
        }
        setTimeout(function(e){
            let start = Date.now();
            for(let seq in objects)
                if(objects[seq].update)
                    objects[seq].update();
            return setTimeout(arguments.callee, frame - Math.max(0, frame - Date.now() + start));
        }, 0);
        requestAnimationFrame(function(e){
            context.fillStyle = "rgb(255,255,255)";
            context.fillRect(0, 0, canvas.width, canvas.height);
            camera.update();
            sync.sort(function(a, b){
                return object[a].zIndex - object[b].zIndex;
            });
            for(let seq in objects)
                if(objects[sync[seq]].visible && objects[sync[seq]].onpaint)
                    objects[sync[seq]].onpaint(context);
            return requestAnimationFrame(arguments.callee);
        });
    }

}

const engine = {
    canvas: function (id) {
        let cvs = document.getElementById(id);
        if (cvs == null) {
            cvs = document.createElement("canvas", { id: id, width: document.body.clientWidth, height: document.body.clientHeight });
            document.appendChild(cvs);
        }
        let context = cvs.getContext("2d");
        let scenes = [];

        this.running = function () {
            console.log(this);
        }

        this.execute = function () {
            setTimeout(this.running, 500);
        }
    },
    scene: function () {
        if (this instanceof engine.scene == false)
            throw new Error("Please use the 'new' operator");
        let components = [];

        this.paint = function (e) {
            for (var index in components)
                if (components[index].onpaint && components[index].style.visible)
                    components[index].onpaint(e);
        }

        this.update = function (e) {
            for (var index in components)
                if (components[index].onupdate && components[index].style.active)
                    components[index].onupdate(e);
        }
        this.addComponent = function (component) {
            if (component instanceof engine.object == false)
                throw new Error("component is not engine.object");
            components.push(component);
        }
    },
    img: function () {
        let temp = new Array(arguments.length);
        for (let index = arguments.length - 1; index >= 0; --index) {
            temp[index] = new Image();
            temp[index].src = arguments[index];
            temp[arguments[index]] = new Image()
            temp[arguments[index]].src = arguments[index];
        }
        return temp;
    },
    stringFormat: function (str) {
        let temp = "", convert = "%s", convertIndex = 0;
        for (let index = 0, count = 1; index < str.length; ++index) {
            if (str[index] == convert[convertIndex]) {
                if (++convertIndex == convert.length) {
                    temp += arguments[count++] || "";
                    convertIndex = 0;
                }
            }
            else {
                if (convertIndex == 0) {
                    temp += str[index];
                }
                else {
                    temp += convert.substring(0, convertIndex);
                    convertIndex = str[index] == convert[0] ? 1 : 0;
                }
            }
        }
        return temp;
    },
    message: function (sign, args, sender) {
        this.sign = sign;
        this.args = args;
        this.sender = sender;
        this.time = Date.now();
        engine.message.oncreate = 0x21;
        engine.message.onoverflow = 0x22;
        engine.message.onunderflow = 0x23;
    },
    post: function (receiver, msg) {
        if (receiver instanceof engine.object == false || msg instanceof engine.message == false)
            throw new Error("Incorrect arguments type 'receiver' : engine.object, 'msg' : engine.message");
        receiver.notify.push(msg);
    },
    send: function (receiver, msg) {
        if (receiver instanceof engine.object == false || msg instanceof engine.message == false)
            throw new Error("Incorrect arguments type 'receiver' : engine.object, 'msg' : engine.message");
        receiver.onmessage(msg);
    },
    object: function () {
        if (this instanceof engine.object == false)
            throw new Error("Please use the 'new' operator");
        const style = new engine.style();
        const notify = new Array();
        Object.defineProperty(this, "style", { get: () => style });
        Object.defineProperty(this, "notify", { get: () => notify });
        this.onmessage = function (msg) {
            if (msg instanceof engine.message == false)
                throw new Error("Incorrect argument msg : engine.message");
        }
    },
    vec2: function (x, y) {
        if (this instanceof engine.vec2 == false)
            throw new Error("Please use the 'new' operator");
        if (!Number.isInteger(x) || !Number.isInteger(y))
            throw new Error("arguments isn`t number");
        var x = x || 0;
        var y = y || 0;
        Object.defineProperty(this, "x", { get: () => x, set: (i) => x = i });
        Object.defineProperty(this, "y", { get: () => y, set: (i) => y = i });
        Object.defineProperty(this, "width", { get: () => x, set: (i) => x = i });
        Object.defineProperty(this, "height", { get: () => y, set: (i) => y = i });
        this.clone = function () {
            return new engine.vec2(this.x, this.y);
        }
        this.update = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        this.magnitude = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.indicate = function (angle, f) {
            let force = f || this.magnitude();
            this.x = force * Math.cos(angle);
            this.y = force * Math.sin(angle);
            return this;
        }
        engine.vec2.indicate = function (angle, f) {
            return new engine.vec2(f * Math.cos(angle), f * Math.sin(angle));
        }
        this.angle = function (loc) {
            return Math.atan2(loc.y - this.y, loc.x - this.x);
        }
        this.reverse = function () {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        }
        this.equals = function (vec2, admitable) {
            var admitable = admitable || 0;
            if (!(Math.abs(this.x - vec2.x) < admitable) || !(Math.abs(this.y - vec2.y) < admitable))
                return false;
            return true;
        }
        this.add = function (x, y) {
            this.x += x;
            this.y += y;
            return this;
        }
        this.sub = function (x, y) {
            this.x += x;
            this.y += y;
            return this;
        }
        this.mul = function (x, y) {
            this.x += x;
            this.y += y;
            return this;
        }
        this.div = function (x, y) {
            this.x += x;
            this.y += y;
            return this;
        }
        this.toString = function () {
            return `vec2(${x}, ${y})`;
        }
    },
    range: function (minimum, current, maximum) {
        if (this instanceof engine.range == false)
            throw new Error("Please use the 'new' operator");
        if (!Number.isInteger(minimum) || !Number.isInteger(current) || !Number.isInteger(maximum))
            throw new Error("Incorrect argument");
        let min = minimum, max = maximum, cur = null, target = null;
        Object.defineProperty(this, "min", { get: () => min, set: (i) => x = i });
        Object.defineProperty(this, "max", { get: () => max, set: (i) => x = i });
        Object.defineProperty(this, "value", {
            get: () => cur,
            set: function (input) {
                if (input < min) {
                    cur = min;
                    if (target != null)
                        engine.send(target, new engine.message(engine.message.onunderflow, { type: "string", content: "underflow" }, this));
                }
                else if (input > max) {
                    cur = max;
                    if (target != null)
                        engine.send(target, new engine.message(engine.message.onoverflow, { type: "string", content: "overflow" }, this));
                }
                else
                    cur = input;
            }
        });
        Object.defineProperty(this, "target", {
            get: () => target,
            set: function (input) {
                if (input instanceof engine.object == false)
                    throw new Error("Incorrect argument");
                target = input;
            }
        });
        this.value = current;
    },
    color: function (r, g, b, a) {
        var r = r || 0;
        var g = g || 0;
        var b = b || 0;
        var a = a;

        this.toString = function () {
            if (a != null)
                return "rgba(" + r + "," + g + "," + b + "," + a + ")";
            else
                return "rgb(" + r + "," + g + "," + b + ")";
        }
    },
    style: function () {
        if (this instanceof engine.style == false)
            throw new Error("Please use the 'new' operator");
        this.visible = null;
        this.active = null;
        this.collision = null;
        this.zIndex = null;
    },
    rect: function (x, y, width, height) {
        if (this instanceof engine.rect == false)
            throw new Error("Please use the 'new' operator");
        this.__proto__ = new engine.object();
        let location = new engine.vec2(x, y);
        let size = new engine.vec2(width, height);
        Object.defineProperty(this, "location", { get: () => location });
        Object.defineProperty(this, "size", { get: () => size });
    }
};
