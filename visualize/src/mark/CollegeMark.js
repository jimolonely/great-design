import React, { Component } from 'react';
import {
    Button, AutoComplete, Divider, Row, Col, Select
} from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RTooltip,
    PieChart, Pie
} from 'recharts';
import * as net from '../utils/net';

const Option = Select.Option;

const data2 = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

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
            avgMark: {}
        }
        this.getCollege = this.getCollege.bind(this);
        this.getGrade = this.getGrade.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    componentWillMount() {
        if (this.state.colleges.length === 0) {
            var t = this;
            net.get("/mark/get_college_grades", function (re) {
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
        // net.get("/mark/get_college_grades", function (re) {
        //     console.log(re.data)
        //     t.setState({
        //         colleges: re.data.data.colleges.map(c => <Option key={c}>c</Option>),
        //         grades: re.data.data.grades
        //     })
        // })
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
                t.setState({
                    title: tip,
                    stuNum: re.data.data.stuNum,
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
                        <p></p>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <p></p>
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