import React, { Component } from 'react';
import {
    Button, Divider, Select, message,
    InputNumber, Card
} from 'antd';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    Line, LineChart,
} from 'recharts';
import * as net from "../utils/net";
import { getRandomColor } from '../utils/useful';

const Option = Select.Option;

class SpecialityCluster extends Component {

    constructor(props) {
        super(props);
        this.state = {
            specialities: [],
            grades: [],
            gradeValue: '',
            specialityValue: '',
            nClusters: 3,
            // scatterGraph: null,
            lineGraph: null,
            clsData: [],
            stuCard: null,
        }
        this.getSpeciality = this.getSpeciality.bind(this);
        this.getGrade = this.getGrade.bind(this);
        this.getNumClusters = this.getNumClusters.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    componentWillMount() {
        if (this.state.specialities.length === 0) {
            var t = this;
            net.get("/mark/get_meta_data", function (re) {
                console.log(re.data)
                t.setState({
                    specialities: re.data.data.specialities.map(c => <Option key={c} value={c}>{c}</Option>),
                    grades: re.data.data.grades.map(c => <Option key={c} value={c}>{c}</Option>)
                })
            })
        }
    }

    getSpeciality(value) {
        this.setState({
            specialityValue: value
        })
    }

    getGrade(value) {
        this.setState({
            gradeValue: value
        })
    }
    getNumClusters(v) {
        this.setState({
            nClusters: v
        })
    }
    onSearch() {
        if (this.state.gradeValue.trim() === "" || this.state.specialityValue.trim() === "") {
            message.warning("请选择列表");
        } else {
            console.log(this.state.nClusters)
            var t = this;
            net.get("/mark/speciality_cluster/" + this.state.gradeValue + "/" +
                this.state.specialityValue + "/" + this.state.nClusters,
                function (re) {
                    var d = re.data.data;
                    var g = [];
                    var data = [];
                    //重新封装数据
                    for (var i = 0; i < d[0].center.length; i++) {
                        var a = {};
                        for (var c = 0; c < t.state.nClusters; c++) {
                            a['cls' + c] = d[c].center[i].center_mark;
                        }
                        a['course_name'] = d[0].center[i].course_name;
                        data.push(a);
                    }
                    var cards = [];
                    for (c = 0; c < t.state.nClusters; c++) {
                        var color = getRandomColor()
                        // g.push(<Scatter key={c} name={'cls' + c} data={d[c].center} fill={color} />);
                        g.push(<Line key={c} type="monotone" dataKey={"cls" + c} stroke={color} />)
                        cards.push(<Card key={c} title={"cls" + c + "的学生"} bordered={false}
                            style={{ width: "90%" }}>{d[c].stu.join(" ")}</Card>);
                    }
                    // d.map(x => <Scatter name='A school' data={data} fill='#8884d8' />)
                    t.setState({
                        // scatterGraph: g
                        lineGraph: g,
                        stuCard: cards,
                        clsData: data
                    })
                })
        }
    }

    render() {
        return (
            <div>
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
                <InputNumber
                    defaultValue={3}
                    min={2}
                    max={10}
                    formatter={value => `${value}个类`}
                    parser={value => value.replace('个类', '')}
                    onChange={this.getNumClusters}
                />
                &nbsp;
                <Button type="primary" onClick={this.onSearch}>分析聚类</Button>
                <Divider orientation="left">hehe</Divider>
                {/* <ScatterChart width={600} height={400} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis dataKey={'course_name'} name='课程名称' unit='' />
                    <YAxis type="number" dataKey={'center_mark'} name='中心分数' unit='' />
                    <CartesianGrid />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    {this.state.scatterGraph}
                </ScatterChart> */}
                <LineChart width={1000} height={400} data={this.state.clsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="course_name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    {/* <Line type="monotone" dataKey="m_count" stroke="#82ca9d" /> */}
                    {this.state.lineGraph}
                </LineChart>
                <Divider orientation="left">下面是分类的学生</Divider>
                {this.state.stuCard}
            </div>
        )
    }
}

export default SpecialityCluster;