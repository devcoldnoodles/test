const d2s = {
    search: function (selected, output, callback) {
        if (output instanceof Array == false || typeof (callback) != "function")
            throw new Error("incorrect argument type");
        if (selected && selected.children) {
            let child = selected.children;
            for (let index = 0; index < child.length; ++index) {
                if (callback(child[index]))
                    output.push(child[index]);
                d2s.search(child[index], output, callback);
            }
        }
    },
    select: function (format) {
        if (typeof format != "string")
            throw new Error("incorrect argument type 'format' must be string");
        let colonIndex = format.indexOf(":");
        colonIndex = colonIndex >= 0 ? colonIndex : format.length;
        let element = format.substr(0, colonIndex);
        let property = format.substr(colonIndex + 1);
        let ret = null;
        switch (element[0]) {
            case '!':
                break;
            case '@':
                ret = Array.from(document.getElementsByName(element.substring(1)));
                break;
            case '#':
                ret = [document.getElementById(element.substring(1))];
                break;
            default:
                ret = Array.from(document.getElementsByTagName(element));
                break;
        }
        while (property.length > 0) {
            colonIndex = property.indexOf(":");
            colonIndex = colonIndex >= 0 ? colonIndex : property.length;
            let innerProperty = property.substr(0, colonIndex);
            property = property.substr(colonIndex + 1);
            for (let index in ret) {
                ret[index] = ret[index][innerProperty];
            }
        }
        return new d2s.selector(ret);
    },
    selector: function (arr, parent) {
        if (arr instanceof Array == false)
            throw new Error("incorrect argument type 'list' : Array");
        this.list = arr || [];
        this.parent = parent;
        let dataset = [];
        this.append = function (name) {
            switch (typeof (name)) {
                case "string":
                    let child = document.createElement(name);
                    for (let index in this.list)
                        this.list[index].appendChild(child);
                    return new d2s.selector([child], this);
                default:
                    for (let index in this.list)
                        this.list[index].appendChild(name);
                    return new d2s.selector([name], this);
            }
        }
        this.at = function (index) {
            let i = index || 0;
            if (Number.isInteger(i) == false)
                throw new Error("incorrect argument");
            return this.list[i];
        }
        this.attr = function (name, value) {
            if (typeof (name) != "string")
                throw new Error("incorrect argument");
            switch (arguments.length) {
                case 1: {
                    let arr = [];
                    for (let index in this.list) {
                        let temp = this.list[index].getAttribute(name);
                        if (temp != null)
                            arr.push(temp);
                    }
                    return new d2s.selector(arr, this);
                }
                case 2:
                    if (typeof value == "function") {
                        for (let index in this.list)
                            this.list[index].setAttribute(name, value(dataset[index]));
                        return this;
                    }
                    else {
                        for (let index in this.list)
                            this.list[index].setAttribute(name, value);
                        return this;
                    }
                default:
                    throw new Error("incorrect args");
            }
        }
        this.extend = function () {
            let temp = [];
            for (let index in this.list) {
                    temp.push(this.list[index]);
                d2s.search(this.list[index], temp, () => true);
            }
            return new d2s.selector(temp, this);
        }
        this.merge = function (selection) {
            if (selection instanceof d2s.selector == false)
                throw new Error("incorrect argument");
            for (let index in selection.list)
                this.list.push(selection.list[index]);
            return this;
        }
        this.select = function (format) {
            if (typeof (format) != "string")
                throw new Error("incorrect argument type 'format' : 'string'");
            let temp = [];
            for (let index in this.list) {
                switch (format[0]) {
                    case '!':
                        d2s.search(this.list[index], temp, (child) => child[format.substr(1)] != null)
                        break;
                    case '@':
                        d2s.search(this.list[index], temp, (child) => child.getAttribute("name") == format.substr(1));
                        break;
                    case '#':
                        d2s.search(this.list[index], temp, (child) => child.id == format.substr(1));
                        break;
                    default:
                        d2s.search(this.list[index], temp, (child) => child.tagName == format);
                        break;
                }
            }
            return new d2s.selector(temp, this);
        }
        this.callback = function (callback) {
            if (typeof (callback) != "function")
                throw new Error("incorrect argument");
            if (callback(this.list))
                return this.parent;
            return this;
        }
        this.comp = function (callback) {
            if (typeof (callback) != "function")
                throw new Error("incorrect argument");
            let temp = [];
            for (let index in this.list)
                if (callback(this.list[index], dataset[index]))
                    temp.push(this.list[index]);
            return new d2s.selector(temp, this);
        }
        this.event = function (name, callback) {
            if (typeof (name) != "string" || typeof (callback) != "function")
                throw new Error("incorrect argument");
            for (let index in this.list) {
                this.list[index].addEventListener(name, callback);
            }
            return this;
        }
        this.data = function (data, callback) {
            switch (arguments.length) {
                case 1:
                    if (data instanceof Array == false)
                        throw new Error("incorrect argument");
                    dataset = data;
                    break;
                case 2:
                    if (data instanceof Array == false || typeof (callback) != "function")
                        throw new Error("incorrect argument");
                    for (let listIndex in this.list) {
                        for (let dataIndex in data) {
                            if (callback(this.list[listIndex], data[dataIndex])) {
                                dataset[listIndex] = data[dataIndex];
                                break;
                            }
                        }
                    }
                    break;
            }
            return this;
        }
        this.child = function () {
            let temp = [];
            for (let index in this.list)
                temp = temp.concat(temp, Array.from(this.list[index].children));
            return new d2s.selector(temp, this);
        }
        this.each = function (callback) {
            if (typeof (callback) != "function")
                throw new Error("incorrect Argument");
            for (let index in this.list)
                callback(this.list[index], dataset[index]);
            return this;
        }
        this.text = function (value) {
            switch (arguments.length) {
                case 0:
                    let ret = [];
                    for (let index in this.list) {
                        let temp = this.list[index].text;
                        if (temp != null)
                            ret.push(temp);
                    }
                    return ret;
                case 1:
                    if (typeof (value) == "function") {
                        for (let index in this.list)
                            this.list[index].text = value(this.list[index], dataset[index]);
                    }
                    else {
                        for (let index in this.list)
                            this.list[index].text = value;
                    }
                    return this;
            }
        }
        this.style = function (name, value) {
            switch (arguments.length) {
                case 1:
                    let ret = [];
                    for (let index in this.list) {
                        let temp = this.list[index].style.getPropertyValue(name);
                        if (temp != null)
                            ret.push(temp);
                    }
                    return new ret;
                case 2:
                    if (typeof (value) == "function") {
                        for (let index in this.list)
                            this.list[index].style.setProperty(name, value(dataset[index]));
                    }
                    else {
                        for (let index in this.list)
                            this.list[index].style.setProperty(name, value);
                    }
                    return this;
                default:
                    throw new Error("incorrect args");
            }
        }
    },
    request: function (method, url, callback, data) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.addEventListener("load", function (e) {
            if (xhr.readyState == XMLHttpRequest.DONE)
                callback(xhr.response);
        });
        xhr.send(data);
        return xhr;
    },
    xml: function (url, callback, data) {
        if(typeof (callback) != "function")
            throw new Error("incorrect argument");
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", function (e) {
            if (xhr.readyState == XMLHttpRequest.DONE)
                callback(xhr.responseXML);
        });
        xhr.send(data);
        return xhr;
    },
    json: function (url, callback, data) {
        if(typeof (callback) != "function")
            throw new Error("incorrect argument");
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", function (e) {
            if (xhr.readyState == XMLHttpRequest.DONE)
                callback(JSON.parse(xhr.response));
        });
        xhr.send(data);
        return xhr;
    },
    camera: function (svg, options) {
        let target = svg;
        let ratio = options.ratio || 1.1;
        let depth = 0;
        let fps = 60;
        if (options != null && options.eventTarget != null && options.eventTarget.addEventListener != null) {
            options.eventTarget.addEventListener("mousewheel", function (e) {
                target.viewBox.baseVal.width *= e.deltaY > 0 ? ratio : 1 / ratio;
                target.viewBox.baseVal.height *= e.deltaY > 0 ? ratio : 1 / ratio;
                depth += e.deltaY > 0 ? -1 : 1;
            });
            options.eventTarget.addEventListener("mousemove", function (e) {
                if (e.buttons == 1) {
                    let zoomRatio = Math.pow(ratio, -depth);
                    target.viewBox.baseVal.x -= e.movementX * zoomRatio;
                    target.viewBox.baseVal.y -= e.movementY * zoomRatio;
                }
            });
        }
        this.moveTo = function (x, y, callback) {
            let durX = (x - target.viewBox.baseVal.x - target.viewBox.baseVal.width / 2) / fps;
            let durY = (y - target.viewBox.baseVal.y - target.viewBox.baseVal.height / 2) / fps;
            function animate(index) {
                target.viewBox.baseVal.x += durX;
                target.viewBox.baseVal.y += durY;
                if (++index < fps)
                    setTimeout(animate, 1000 / fps, index);
                else if (callback != null)
                    callback();
            }
            setTimeout(animate, 1000 / fps, 0);
        }
        this.zoomTo = function (destDepth, callback) {
            function animate() {
                if (depth - destDepth > 0) {
                    target.viewBox.baseVal.width *= ratio;
                    target.viewBox.baseVal.height *= ratio;
                    --depth;
                }
                else if (depth - destDepth < 0) {
                    target.viewBox.baseVal.width /= ratio;
                    target.viewBox.baseVal.height /= ratio;
                    ++depth;
                }
                if (destDepth != depth)
                    setTimeout(animate, 1000 / fps);
                else if (callback != null)
                    callback();
            }
            setTimeout(animate, 1000 / fps);
        }
    }
};