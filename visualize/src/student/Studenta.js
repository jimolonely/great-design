import React, { Component } from 'react';
import {
    Input, Button, Row, Col,
    Progress, Tag, Divider
} from 'antd';
import {
    Radar, RadarChart, PolarGrid, Legend,
    PolarAngleAxis //, PolarRadiusAxis
} from 'recharts';
// import * as net from "../utils/net";
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
                <Input placeholder="输入学号" onChange={this.onChange} style={{ width: 200 }} />&nbsp;
                    <Button type="primary" onClick={this.getStudenta}>学生画像</Button>
                <br />
                <Row type="flex" justify='center'>
                    <Col xs={24} sm={24} md={5} lg={5} xl={4}>
                        <img alt="photo" src={require("../resources/meme.jpg")}
                            style={{ width: 160, height: 200 }} />
                    </Col>
                    <Col xs={24} sm={24} md={5} lg={5} xl={5}>
                        <ul style={{ padding: 10 }}>
                            <li>学号:2014</li>
                            <li>姓名:寂寞</li>
                            <li>学院:信息</li>
                            <li>专业:软件工程</li>
                            <li>性别:男</li>
                            <li>民族:汉族</li>
                            <li>生日:1996-10-19</li>
                            <li>状态:在读</li>
                        </ul>
                    </Col>
                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                        <ul style={{ padding: 10 }}>
                            <li>生源地:重庆</li>
                            <li>老家:重庆合川</li>
                            <li>党派:团员</li>
                            <li>毕业高中:合川中学</li>
                            <li>所在校区:犀浦</li>
                            <li>高考分数:600</li>
                            <li>手机号:100010</li>
                            <li>邮箱:sadasd@qq.com</li>
                        </ul>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={9}>
                        <p>学生标签:</p>
                        <Tag color="magenta">好学生</Tag>
                        <Tag color="red">游戏迷</Tag>
                        <Tag color="volcano">高智商</Tag>
                        <Tag color="orange">低情商</Tag>
                        <Tag color="gold">长得帅</Tag>
                        <Tag color="lime">无节操</Tag>
                        <Tag color="green">班委</Tag>
                        <Tag color="cyan">运动爱好者</Tag>
                        <Tag color="blue">bulabula</Tag>
                        <br />
                        <br />
                        <span>学生综合评分:</span>
                        <div className="circle">99</div>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <p>达到毕业资格百分比:</p>
                        <Progress percent={75} />
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col span={12}>
                        <p>评分维度详细信息:</p>
                        <br />
                        <br />
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