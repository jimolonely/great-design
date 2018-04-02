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
            isBegin: false
        }
        this.refresh = this.refresh.bind(this);
        this.beginCompute = this.beginCompute.bind(this);
    }

    refresh() {

    }

    beginCompute() {

    }

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.beginCompute}>开启计算</Button>&nbsp;
                <Button type="primary" onClick={this.refresh}>刷新状态</Button>
                <hr />
                <p>进度列表</p>
                <p>专业名称-专业代码-计算进度</p>
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={
                        item => (
                            <List.Item>
                                {item.name} &nbsp; {item.code} &nbsp;
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