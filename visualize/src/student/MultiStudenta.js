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
import { getRandomColor } from '../utils/useful';

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
            collegeValue: '',
            gradeValue: '',
            specialityValue: '',
            apply: {},
            course: '',
            labels: [],
        }
        this.getPieOption = this.getPieOption.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getCollege = this.getCollege.bind(this);
        this.getGrade = this.getGrade.bind(this);
        this.getSpeciality = this.getSpeciality.bind(this);
    }

    componentWillMount() {
        if (this.state.colleges.length === 0) {
            var t = this;
            net.get("/mark/get_meta_data", function (re) {
                console.log(re.data)
                t.setState({
                    colleges: re.data.data.colleges.map(c => <Option key={c.college_code} value={c.college_code}>{c.college_name}({c.college_code})</Option>),
                    grades: re.data.data.grades.map(c => <Option key={c} value={c}>{c}</Option>),
                    specialities: re.data.data.specialities.map(c => <Option key={c.speciality_code} value={c.speciality_code}>{c.speciality_name}({c.speciality_code})</Option>)
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

    onSearch() {
        var t = this;
        net.post("/stu/multi-studenta", {
            college_code: t.state.collegeValue,
            speciality_code: t.state.specialityValue,
            grade: t.state.gradeValue
        }, function (re) {
            console.log(re.data)
            t.setState({
                sex: re.data.data.sex,
                province: re.data.data.province,
                constellation: re.data.data.constellation,
                apply: re.data.data.apply,
                course: re.data.data.course,
                labels: re.data.data.labels.map(b => <Tag key={b} color={getRandomColor()}><b>{b}</b></Tag>)
            })
        })
    }

    getCollege(value) {
        this.setState({
            collegeValue: value
        })
    }

    getGrade(value) {
        this.setState({
            gradeValue: value
        })
    }

    getSpeciality(value) {
        this.setState({
            specialityValue: value
        })
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
                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    <Option key={0} value=''>无</Option>
                    {this.state.colleges}
                </Select>
                &nbsp;
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="请选择专业名称或代码"
                    optionFilterProp="children"
                    onSelect={this.getSpeciality}
                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    <Option key={0} value=''>无</Option>
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
                    <Option key={0} value=''>无</Option>
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
                            {this.state.labels}
                        </Col>
                    </Row>
                </Card>
                <br />
                <Row>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="实践-学生" bordered={false}>
                            <img src={"data:image/jpeg;base64," + this.state.apply.student_name} alt="img" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="实践-奖励名称" bordered={false}>
                            <img src={"data:image/jpeg;base64," + this.state.apply.reason_name} alt="img" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="实践-奖励类型" bordered={false}>
                            <img src={"data:image/jpeg;base64," + this.state.apply.reason_type} alt="img" />
                        </Card>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="实践-奖励级别" bordered={false}>
                            <img src={"data:image/jpeg;base64," + this.state.apply.reason_level} alt="img" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="选课概况" bordered={false}>
                            <img src={"data:image/jpeg;base64," + this.state.course} alt="img" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Card title="实践-专业" bordered={false}>
                            <img src={"data:image/jpeg;base64," + this.state.apply.speciality_name} alt="img" />
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default MultiStudenta;