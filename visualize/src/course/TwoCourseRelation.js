import React, { Component } from 'react';
import {
    Radar
} from 'recharts';
import { Button, Input, Progress } from 'antd';
import * as net from "../utils/net";
// import '../Public.css';

class TwoCourseRelation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            courseCode1: '',
            courseCode2: '',
            total: 0,
            similar: 0.0,
            similar2: 0.0
        }
        this.onChange1 = this.onChange1.bind(this);
        this.onChange2 = this.onChange2.bind(this);
        this.getRelation = this.getRelation.bind(this);
    }

    onChange1(e) {
        this.setState({
            courseCode1: e.target.value
        });
    }

    onChange2(e) {
        this.setState({
            courseCode2: e.target.value
        });
    }

    getRelation() {
        var t = this;
        if (this.state.courseCode2 !== "" && this.state.courseCode1 !== "") {
            net.get('/course/relation/' + this.state.courseCode1 + "/" + this.state.courseCode2,
                function (response) {
                    t.setState({
                        total: response.data.data.total,
                        similar: response.data.data.prob,
                        similar2: response.data.data.bg_prob
                    });
                })
        }
    }
    render() {
        return (
            <div>
                <Input placeholder="输入前置课程代码" onChange={this.onChange1} />
                <Input placeholder="输入后置课程代码" onChange={this.onChange2} />
                <Button type="primary" onClick={this.getRelation}>计算相关性</Button>
                <p>总共修这两门课的学生有:{this.state.total} 人</p>
                <div>
                    考虑所有的相关性:
                    <Progress percent={this.state.similar} />
                    只考虑好坏的相关性:
                    <Progress percent={this.state.similar2} />
                </div>
            </div>
        )
    }
}

export default TwoCourseRelation;