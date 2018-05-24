import React, { Component } from 'react';
import {
    Input, Button, Row, Col, Card,
    Progress, Tag, Select, Divider
} from 'antd';
import {
    Radar, RadarChart, PolarGrid, Legend,
    PolarAngleAxis //, PolarRadiusAxis
    , LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import ReactEcharts from 'echarts-for-react';
import * as net from "../utils/net";

const Option = Select.Option;

class MultiStudenta extends Component {

    constructor(props) {
        super(props);
        this.state = {
            colleges: [],
            specialities: [],
            grades: [],
            sex: [
                { value: 335, name: '男' },
                { value: 310, name: '女' },
            ],
            province: [
                { value: 33, name: '重庆' },
                { value: 40, name: '四川' },
                { value: 12, name: '云南' },
            ],
            constellation: [
                { value: 3, name: '射手座' },
                { value: 12, name: '双鱼座' },
                { value: 10, name: '天蝎座' },
                { value: 20, name: '天秤座' },
            ],
        }
        this.getPieOption = this.getPieOption.bind(this);
    }

    componentWillMount() {
        if (this.state.colleges.length === 0) {
            var t = this;
            net.get("/mark/get_meta_data", function (re) {
                console.log(re.data)
                t.setState({
                    colleges: re.data.data.colleges.map(c => <Option key={c} value={c}>{c}</Option>),
                    grades: re.data.data.grades.map(c => <Option key={c} value={c}>{c}</Option>),
                    specialities: re.data.data.specialities.map(c => <Option key={c} value={c}>{c}</Option>)
                })
            })
        }
    }

    getPieOption(title, data) {
        var option = {
            // backgroundColor: '#2c343c',

            title: {
                text: title,
                left: 'center',
                top: 20,
                textStyle: {
                    color: '#ccc'
                }
            },

            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            series: [
                {
                    name: title,
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '50%'],
                    data: data.sort(function (a, b) { return a.value - b.value; }),
                    roseType: 'radius',
                    animationType: 'scale',
                    animationEasing: 'elasticOut',

                }
            ]
        };
        return option;
    }

    render() {
        return (
            <div>
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="请选择学院名称或代码"
                    optionFilterProp="children"
                    onSelect={this.getCollege}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.state.colleges}
                </Select>
                &nbsp;
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="请选择专业名称或代码"
                    optionFilterProp="children"
                    onSelect={this.getSpeciality}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.state.specialities}
                </Select>
                &nbsp;
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="请选择年级"
                    optionFilterProp="children"
                    onSelect={this.getGrade}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.state.grades}
                </Select>
                &nbsp;
                <Button type="primary" onClick={this.onSearch}>分析查询</Button>
                {/* <Divider orientation="left">hehe</Divider> */}
                <br />
                <Card title="基本情况" bordered={false}>
                    <Row>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <ReactEcharts option={this.getPieOption('男女比例', this.state.sex)} />
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <ReactEcharts option={this.getPieOption('地区分布', this.state.province)} />
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <ReactEcharts option={this.getPieOption('星座分布', this.state.constellation)} />
                        </Col>
                    </Row>
                    <Row>
                        <Col >
                            <p>群体标签</p>
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
                </Card>
                <br />
                <Row>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="课程情况" bordered={false}>
                            <p>容易课程: </p>
                            <p>困难课程: </p>
                            <p>选课偏好: </p>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="实践情况" bordered={false}>
                            <p>Card content</p>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="就业情况" bordered={false}>
                            <p>Card content</p>
                            <p>Card content</p>
                            <p>Card content</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default MultiStudenta;