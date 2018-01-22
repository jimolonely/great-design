import React, { Component } from 'react';
import {
    Input, Button, Row, Col,
    Progress, Tag
} from 'antd';
import {
    Radar, RadarChart, PolarGrid, Legend,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import * as net from "../utils/net";
import './Studenta.css';

const data = [
    { subject: '排名', A: 80, B: 110, fullMark: 100 },
    { subject: '专业对比', A: 98, B: 130, fullMark: 100 },
    { subject: '推免指数', A: 76, B: 130, fullMark: 100 },
    { subject: '挂科预警', A: 29, B: 100, fullMark: 100 },
    { subject: '就业情况', A: 85, B: 90, fullMark: 100 },
    { subject: '课外实践', A: 90, B: 85.5, fullMark: 100.0 },
];

class Studenta extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stuId: ''
        }
        this.onChange = this.onChange.bind(this);
        this.getStudenta = this.getStudenta.bind(this);
    }

    onChange(e) {
        this.setState({
            stuId: e.target.value
        })
    }

    getStudenta() {

    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={20}><Input placeholder="输入学号" onChange={this.onChange} /></Col>
                    <Col span={4}><Button type="primary" onClick={this.getStudenta}>学生画像</Button></Col>
                </Row>
                <br />
                <Row type="flex" justify='center'>
                    <Col>学生评分</Col>
                </Row>
                <Row type="flex" justify='center'>
                    <Col>
                        <div className="circle">100</div>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <span>学生标签:</span>
                        <Tag color="magenta">好学生</Tag>
                        <Tag color="red">游戏迷</Tag>
                        <Tag color="volcano">高智商</Tag>
                        <Tag color="orange">低情商</Tag>
                        <Tag color="gold">长得帅</Tag>
                        <Tag color="lime">无节操</Tag>
                        <Tag color="green">班委</Tag>
                        <Tag color="cyan">运动爱好者</Tag>
                        <Tag color="blue">bulabula</Tag>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <p>达到毕业资格百分比:
                        <Progress percent={75} />
                        </p>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col span={12}>
                        <p>评分维度详细信息:</p>
                        <br/>
                        <br/>
                        <p>综合排名均值:5/110</p>
                        <p>排名趋势:上升/下降/平稳</p>
                        <p>挂科情况:无</p>
                        <p>就业情况:无</p>
                        <p>竞赛奖励:按等级计算分数</p>
                        <p>课外实践:???</p>
                    </Col>
                    <Col span={12}>
                        <p>雷达图展示</p>
                        <RadarChart width={350} height={300} data={data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            {/* <PolarRadiusAxis domain={[0, 100]} /> */}
                            <Legend />
                            <Radar name="xx" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Studenta;