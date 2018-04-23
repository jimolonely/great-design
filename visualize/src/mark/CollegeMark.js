import React, { Component } from 'react';
import {
    Button, AutoComplete, Divider, Row, Col, Select
} from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RTooltip,
    PieChart, Pie, LineChart, Line
} from 'recharts';
import * as net from '../utils/net';

const Option = Select.Option;

class CollegeMark extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '看我',
            colleges: [],
            grades: [],
            collegeValue: '',
            gradeValue: '',
            stuNum: [],
            avgMark: {},
            constellationAvgMark: [],
            constellationGoodStuNum: [],
            constellationBadStuNum: [],
            constellationFailStuNum: [],
            provinceAvgMark: [],
            provinceGoodStuNum: [],
            provinceBadStuNum: [],
            provinceFailStuNum: [],
            nationNameAvgMark: [],
            nationNameGoodStuNum: [],
            nationNameBadStuNum: [],
            nationNameFailStuNum: []
        }
        this.getCollege = this.getCollege.bind(this);
        this.getGrade = this.getGrade.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    componentWillMount() {
        if (this.state.colleges.length === 0) {
            var t = this;
            net.get("/mark/get_meta_data", function (re) {
                console.log(re.data)
                t.setState({
                    colleges: re.data.data.colleges.map(c => <Option key={c} value={c}>{c}</Option>),
                    grades: re.data.data.grades.map(c => <Option key={c} value={c}>{c}</Option>)
                })
            })
        }
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
    onSearch() {
        this.setState({
            title: '正在分析...'
        })
        var tip = "";
        if (this.state.gradeValue === "" && this.state.collegeValue === "") {
            tip = "您选择了分析全校数据";
        } else {
            tip = "您选择了分析" + this.state.collegeValue + "学院-" + this.state.gradeValue + "的数据";
        }
        var t = this;
        net.get("/mark/college/" + this.state.collegeValue + "/" + this.state.gradeValue,
            function (re) {
                // console.log(re.data.data)
                t.setState({
                    title: tip,
                    stuNum: re.data.data.stuNum,
                    constellationAvgMark: re.data.data.constellationAvgMark,
                    constellationGoodStuNum: re.data.data.constellationGoodStuNum,
                    constellationBadStuNum: re.data.data.constellationBadStuNum,
                    constellationFailStuNum: re.data.data.constellationFailStuNum,
                    provinceAvgMark: re.data.data.provinceAvgMark,
                    provinceGoodStuNum: re.data.data.provinceGoodStuNum,
                    provinceBadStuNum: re.data.data.provinceBadStuNum,
                    provinceFailStuNum: re.data.data.provinceFailStuNum,
                    nationNameAvgMark: re.data.data.nationNameAvgMark,
                    nationNameGoodStuNum: re.data.data.nationNameGoodStuNum,
                    nationNameBadStuNum: re.data.data.nationNameBadStuNum,
                    nationNameFailStuNum: re.data.data.nationNameFailStuNum,
                })
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
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.state.colleges}
                </Select>
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
                <Divider orientation="left">{this.state.title}</Divider>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>人数直方图</p>
                        <BarChart width={600} height={300} data={this.state.stuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RTooltip />
                            <Legend />
                            <Bar dataKey="female" fill="#8884d8" />
                            <Bar dataKey="male" fill="#82ca9d" />
                        </BarChart>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p></p>
                        <PieChart width={730} height={300}>
                            <RTooltip />
                            <Pie data={this.state.stuNum} dataKey="female" nameKey="name"
                                cx="100" cy="100" outerRadius={50} fill="#8884d8" />
                        </PieChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>星座平均分直方图</p>
                        <BarChart width={800} height={300} data={this.state.constellationAvgMark}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RTooltip />
                            <Legend />
                            <Bar dataKey="female" fill="#8884d8" />
                            <Bar dataKey="male" fill="#82ca9d" />
                        </BarChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>星座人数分布直方图</p>
                        <BarChart width={800} height={300} data={this.state.constellationAvgMark}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RTooltip />
                            <Legend />
                            <Bar dataKey="f_count" fill="#8884d8" />
                            <Bar dataKey="m_count" fill="#82ca9d" />
                        </BarChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>星座好学生</p>
                        <LineChart width={600} height={300} data={this.state.constellationGoodStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>星座差学生</p>
                        <LineChart width={600} height={300} data={this.state.constellationBadStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>星座挂科学生</p>
                        <LineChart width={1000} height={300} data={this.state.constellationFailStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>省份平均分直方图</p>
                        <BarChart width={800} height={300} data={this.state.provinceAvgMark}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RTooltip />
                            <Legend />
                            <Bar dataKey="female" fill="#8884d8" />
                            <Bar dataKey="male" fill="#82ca9d" />
                        </BarChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>省份人数分布直方图</p>
                        <BarChart width={1000} height={300} data={this.state.provinceAvgMark}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RTooltip />
                            <Legend />
                            <Bar dataKey="f_count" fill="#8884d8" />
                            <Bar dataKey="m_count" fill="#82ca9d" />
                        </BarChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>省份好学生</p>
                        <LineChart width={600} height={300} data={this.state.provinceGoodStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>省份差学生</p>
                        <LineChart width={600} height={300} data={this.state.provinceBadStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>省份挂科学生</p>
                        <LineChart width={1000} height={300} data={this.state.provinceFailStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>民族人数分布直方图</p>
                        <BarChart width={1000} height={300} data={this.state.nationNameAvgMark}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RTooltip />
                            <Legend />
                            <Bar dataKey="f_count" fill="#8884d8" />
                            <Bar dataKey="m_count" fill="#82ca9d" />
                        </BarChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>民族好学生</p>
                        <LineChart width={600} height={300} data={this.state.nationNameGoodStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>民族差学生</p>
                        <LineChart width={600} height={300} data={this.state.nationNameBadStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p>民族挂科学生</p>
                        <LineChart width={1000} height={300} data={this.state.nationNameFailStuNum}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="f_count" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="m_count" stroke="#82ca9d" />
                        </LineChart>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p></p>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p></p>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default CollegeMark;