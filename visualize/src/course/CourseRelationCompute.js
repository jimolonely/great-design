import React, { Component } from 'react';
import { Button, Progress, Row, Col, List } from 'antd';
import * as net from "../utils/net";


class CourseRelationCompute extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isRunning: false,
            process: { time: 0.0 },
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
                process: re.data.data
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
            // speciality_codes: ['0501', '0101', '0201', '0215', '0408', '0402'],
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
                <p>是否完成-已用时长-计算进度</p>
                <Row>
                    <Col span={3}>{this.state.process.finish} </Col>
                    <Col span={4}>{this.state.process.time.toFixed(2)}秒</Col>
                    <Col span={14}><Progress percent={this.state.process.process}
                        format={percent => percent.toFixed(2) + "%"} /></Col>
                </Row>
                <p>已完成专业</p>
                <List
                    grid={{ gutter: 16, column: 8 }}
                    dataSource={this.state.process.names}
                    renderItem={item => (
                        <List.Item>
                            <b>{item.name}({item.code})</b>
                        </List.Item>
                    )}
                />
            </div>
        )
    }
}

export default CourseRelationCompute;