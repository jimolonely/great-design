import React, { Component } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Button, Input, Row, Col, Card, Progress } from 'antd';
import * as net from "../utils/net";


class CourseDifficulty extends Component {

    constructor(props) {
        super(props);
        this.state = {
            courseCode: "",
            data: [],
            mark: 0,
            title: '课程难度'
        }
        this.onChange = this.onChange.bind(this);
        this.getData = this.getData.bind(this);
    }

    onChange(e) {
        this.setState({
            courseCode: e.target.value
        });
    }

    getData() {
        var t = this;
        if (this.state.courseCode !== "") {
            net.get('/course/difficulty/' + this.state.courseCode,
                function (response) {
                    t.setState({
                        data: response.data.data.data,
                        mark: response.data.data.mark,
                        title: response.data.data.course
                    });
                })
        }
    }
    render() {
        return (
            <div>
                <Input placeholder="输入课程代码" style={{ width: 300 }} onChange={this.onChange} />&nbsp;
                <Button type="primary" onClick={this.getData}>获取数据</Button>
                <Card title={this.state.title} bordered={false}>
                    <b>难度指数:</b>  <Progress percent={this.state.mark} format={percent => percent.toFixed(2) + "%"} />
                    <br />
                    <br />
                    <Row>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <p>年度平均分</p>
                            <LineChart width={600} height={300} data={this.state.data} syncId="anyId"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="year">
                                </XAxis>
                                <YAxis label={{ value: '平均分', angle: -90, position: 'insideLeft' }} />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="mean_mark" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <p>年度挂科率</p>
                            <LineChart width={600} height={300} data={this.state.data} syncId="anyId"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="year" />
                                <YAxis label={{ value: '挂科率(%)', angle: -90, position: 'insideLeft' }} />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="hang_rate" stroke="#82ca9d" />
                            </LineChart>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default CourseDifficulty;