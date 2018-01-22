import axios from 'axios';
import qs from 'qs'; //对参数转化

// axios.defaults.baseURL = 'http://192.168.1.146:8082';

export function get(url, callback, errorHandler = null) {
    axios.get('http://192.168.1.146:8082' + url
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

export function post(url, jsonParam, callback, errorHandler = null) {
    axios.post('http://192.168.1.146:8082' + url,
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