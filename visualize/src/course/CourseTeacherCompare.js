import React, { Component } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
} from 'recharts';
import { Button, Input, Row, Col } from 'antd';
import * as net from "../utils/net";


class CourseTeacherCompare extends Component {

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
            net.get('/course/teacher-compare/' + this.state.courseCode,
                function (response) {
                    t.setState({
                        data: response.data.data,
                    });
                })
        }
    }
    render() {
        // const keys = [{ name: '寂寞', color: '#82ca9d' }, { name: 'pv', color: '#82fffd' }]
        // const lines = keys.map((one) =>
        //     <Line key={one.name} type="monotone" dataKey={one.name} stroke={one.color}
        //         activeDot={{ r: 8 }} />
        // );
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
                        <p>平均分</p>
                        <LineChart width={600} height={300} data={this.state.data} syncId="anyId"
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <XAxis dataKey="name">
                            </XAxis>
                            <YAxis label={{ value: '平均分', angle: -90, position: 'insideLeft' }} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="mean_mark" stroke="#f00" />
                        </LineChart>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>挂科率/高分率</p>
                        <LineChart width={600} height={300} data={this.state.data} syncId="anyId"
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: '挂科率/高分率(%)', angle: -90, position: 'insideLeft' }} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="hang_rate" stroke="#f00" />
                            <Line type="monotone" dataKey="high_rate" stroke="#0f0" />
                        </LineChart>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>老师带过的学生人数</p>
                        <LineChart width={600} height={300} data={this.state.data} syncId="anyId"
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: '人数', angle: -90, position: 'insideLeft' }} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="stu_num" stroke="#f00" />
                        </LineChart>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default CourseTeacherCompare;