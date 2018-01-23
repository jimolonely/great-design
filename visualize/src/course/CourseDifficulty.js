import React, { Component } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
} from 'recharts';
import { Button, Input, Row, Col } from 'antd';
import * as net from "../utils/net";


class CourseDifficulty extends Component {

    constructor(props) {
        super(props);
        this.state = {
            courseCode: "",
            data: []
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
                        data: response.data.data,
                    });
                })
        }
    }
    render() {
        return (
            <div>
                <Input placeholder="输入课程代码" onChange={this.onChange} />
                <br />
                <br />
                <Button type="primary" onClick={this.getData}>获取数据</Button>
                <br />
                <br />
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>年度平均分</p>
                        <LineChart width={600} height={300} data={this.state.data}
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
                        <LineChart width={600} height={300} data={this.state.data}
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
            </div>
        )
    }
}

export default CourseDifficulty;