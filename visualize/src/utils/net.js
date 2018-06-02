import axios from 'axios';
import qs from 'qs'; //对参数转化
import './loading.css';
// axios.defaults.baseURL = baseURL;

const baseURL = baseURL;

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function loadShow() {
    //如果加载时没有cookie或过时了,跳转到登录页
    if (getCookie("user") === "") {
        window.location.href = "/login"
    }
    var loadDiv = document.createElement("div");
    loadDiv.className = "overlay-loader";
    loadDiv.id = "my-load";
    var div2 = document.createElement("div");
    div2.className = "loader";
    div2.appendChild(document.createElement("div"));
    div2.appendChild(document.createElement("div"));
    div2.appendChild(document.createElement("div"));
    div2.appendChild(document.createElement("div"));
    div2.appendChild(document.createElement("div"));
    div2.appendChild(document.createElement("div"));
    div2.appendChild(document.createElement("div"));
    loadDiv.appendChild(div2);
    var body = document.getElementsByTagName("BODY")[0];
    body.appendChild(loadDiv);
}

function loadHide() {
    var loadDiv = document.getElementById('my-load');
    var body = document.getElementsByTagName("BODY")[0];
    body.removeChild(loadDiv);
    // document.getElementById('my-load').style.display = 'none';
}

export function get(url, callback, errorHandler = null) {
    loadShow();
    axios.get(baseURL + url
    ).then(function (response) {
        loadHide();
        if (response.data.ok === false) {
            console.log(response.data.msg);
            alert("msg:" + response.data.msg);
        } else {
            callback(response);
        }
    }).catch(function (error) {
        loadHide();
        if (errorHandler) {
            errorHandler();
        } else {
            console.log(error);
            alert(error);
        }
    })
}

export function post(url, jsonParam, callback, errorHandler = null) {
    loadShow();
    axios.post(baseURL + url,
        qs.stringify(jsonParam)
    ).then(function (response) {
        loadHide();
        if (response.data.ok === false) {
            console.log(response.data.msg);
            alert("msg:" + response.data.msg);
        } else {
            callback(response);
        }
    }).catch(function (error) {
        loadHide();
        if (errorHandler) {
            errorHandler();
        } else {
            console.log(error);
            alert(error);
        }
    })
}

export function jget(url, callback, errorHandler = null) {
    axios.get('http://192.168.1.146:8081' + url
    ).then(function (response) {
        if (response.data.ok === false) {
            console.log(response.data.msg);
            alert("msg:" + response.data.msg);
        } else {
            callback(response);
        }
    }).catch(function (error) {
        if (errorHandler) {
            errorHandler();
        } else {
            console.log(error);
            alert(error);
        }
    })
}

export function jpost(url, jsonParam, callback, errorHandler = null) {
    axios.post('http://192.168.1.146:8081' + url,
        qs.stringify(jsonParam)
    ).then(function (response) {
        if (response.data.ok === false) {
            console.log(response.data.msg);
            alert("msg:" + response.data.msg);
        } else {
            callback(response);
        }
    }).catch(function (error) {
        if (errorHandler) {
            errorHandler();
        } else {
            console.log(error);
            alert(error);
        }
    })
}