import React, { Component } from 'react';
import { Button, Progress, List, Row, Col } from 'antd';
import * as net from "../utils/net";


// const data = [
//     {
//         name: '计算机',
//         code: '120',
//         progress: 90
//     },
//     {
//         name: '软件工程',
//         code: '120',
//         progress: 70
//     },
//     {
//         name: '土木工程',
//         code: '120',
//         progress: 40
//     }
// ];

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

    /**
     * 在控件准备好后从服务端获取线程是否在运行
     * 并获取进度
     */
    componentDidMount() {
        var t = this;
        net.get('/course/relation-compute/get-state', function (re) {
            var run = false;
            var btnRun = document.getElementById("btnRun");
            // console.log(re.data)
            if (re.data.data === false) {
                btnRun.innerHTML = "开启计算";
                run = false;
            } else {
                btnRun.innerHTML = "停止计算";
                run = true;
            }
            t.setState({
                isRunning: run
            });
        });
        this.refresh();
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
            speciality_codes: ['0501', '0101', '0201', '0215', '0408', '0402'],
            // speciality_codes: ['0901', '0307'],
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
                <p>专业名称-专业代码-已用时长-计算进度</p>
                <List
                    grid={{ gutter: 16, column: 1 }}
                    itemLayout="horizontal"
                    dataSource={this.state.processData}
                    renderItem={
                        item => (
                            <List.Item>
                                <div>
                                    <Row>
                                        <Col span={3}>{item.name} </Col>
                                        <Col span={3}>{item.code} </Col>
                                        <Col span={4}>{item.time.toFixed(2)}秒</Col>
                                        <Col span={14}><Progress percent={item.progress}
                                            format={percent => percent.toFixed(2) + "%"} /></Col>
                                    </Row>
                                </div>
                            </List.Item>
                        )
                    }
                />
            </div>
        )
    }
}

export default CourseRelationCompute;