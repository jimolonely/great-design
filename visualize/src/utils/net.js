import axios from 'axios';
import qs from 'qs'; //对参数转化
import './loading.css';
// axios.defaults.baseURL = 'http://192.168.1.146:8082';

function loadShow() {
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
    axios.get('http://192.168.1.146:8082' + url
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
    axios.post('http://192.168.1.146:8082' + url,
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