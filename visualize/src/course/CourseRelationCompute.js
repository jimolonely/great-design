import React, { Component } from 'react';
import {
    Radar
} from 'recharts';
import { Button, Input, Progress, List } from 'antd';
import * as net from "../utils/net";


const data = [
    {
        name: '计算机',
        code: '120',
        progress: 90
    },
    {
        name: '软件工程',
        code: '120',
        progress: 70
    },
    {
        name: '土木工程',
        code: '120',
        progress: 40
    }
];

class CourseRelationCompute extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isRunning: false,
            processData: []
        }
        this.refresh = this.refresh.bind(this);
        this.beginCompute = this.beginCompute.bind(this);
    }

    refresh() {
        var t = this;
        net.get('/course/relation-compute', function (re) {
            console.log(re.data.data);
            t.setState({
                processData: re.data.data
            });
        });
    }

    beginCompute() {
        var run = false;
        var btnRun = document.getElementById("btnRun");
        if (this.state.isRunning) {
            btnRun.innerHTML = "开启计算";
            run = false;
        } else {
            btnRun.innerHTML = "停止计算";
            run = true;
        }
        var t = this;
        net.post('/course/relation-compute', {
            speciality_codes: ['0501', '0901', '0101', '0201', '0215', '0307', '0408', '0402'],
            run: run
        }, function (re) {
            t.setState({
                isRunning: run
            })
            console.log(re.data)
        });
    }

    render() {
        return (
            <div>
                <Button type="primary" id="btnRun" onClick={this.beginCompute}>开启计算</Button>&nbsp;
                <Button type="primary" onClick={this.refresh}>刷新状态</Button>
                <hr />
                <p>进度列表</p>
                <p>专业名称-专业代码-计算进度</p>
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.processData}
                    renderItem={
                        item => (
                            <List.Item>
                                {item.name} {item.code}
                                <Progress percent={item.progress} />
                            </List.Item>
                        )
                    }
                />
            </div>
        )
    }
}

export default CourseRelationCompute;