import React, { Component } from 'react';
import {
    Input, Button, Row, Col, Card, Checkbox, InputNumber, Tooltip
    , List
} from 'antd';
// import {
//     Radar, RadarChart, PolarGrid, Legend,
//     PolarAngleAxis //, PolarRadiusAxis
// } from 'recharts';
import * as net from "../utils/net";

const gridStyle = {
    width: '10%',
    textAlign: 'center',
    padding: '2px',
};

const CheckboxGroup = Checkbox.Group;

const plainOptions = ['数据结构实验', '数据结构实验1', '数据结构实验2'];

const data = [
    {
        course: '数据结构实验',
        result: '正常',
        prob: 76,
        bg: '#e2e2e2'
    }
]

class StuFailPredict extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            checkedList: [],
            indeterminate: true,
            checkAll: false,
            dimNum: 0,
            stuId: '',
            undoCourse: [],
            predictData: [],
        }
        this.onCheckChange = this.onCheckChange.bind(this);
        this.getUndoCourse = this.getUndoCourse.bind(this);
        this.onStuIdChange = this.onStuIdChange.bind(this);
        this.onDataDimChange = this.onDataDimChange.bind(this);
        this.predict = this.predict.bind(this);
    }

    onCheckChange(e) {
        this.setState({
            checked: e.target.checked
        })
    }

    predict() {
        var t = this;
        net.post("/stu/fail-predict", {
            dimNum: t.state.dimNum,
            stuId: t.state.stuId,
            courseList: t.state.checkedList
        }, function (re) {
            t.setState({
                predictData: re.data.data
            })
        })
    }

    onCourseCheckChange = (checkedList) => {
        var undoCourse = this.state.undoCourse;
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && (checkedList.length < undoCourse.length),
            checkAll: checkedList.length === undoCourse.length,
        });
    }

    onCheckAllChange = (e) => {
        var undoCourse = this.state.undoCourse;
        this.setState({
            checkedList: e.target.checked ? undoCourse : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    }

    onDataDimChange(e) {
        this.setState({
            dimNum: e.target.value
        })
    }

    onStuIdChange(e) {
        this.setState({
            stuId: e.target.value
        })
    }

    getUndoCourse() {
        var t = this;
        if (this.state.stuId.trim() !== "") {
            net.get("/stu/get-undo-course/" + this.state.stuId, function (re) {
                t.setState({
                    undoCourse: re.data.data
                })
            })
        }
    }

    render() {
        return (
            <div>
                <Input required placeholder="输入学号" onChange={this.onStuIdChange} style={{ width: 200 }} />&nbsp;
                    <Button type="primary" onClick={this.getUndoCourse}>未修课程查询</Button> &nbsp;
                    <Tooltip title="选择降维可以根据实际输入维度,提高预测准确度">
                    <Checkbox
                        checked={this.state.checked}
                        onChange={this.onCheckChange}>数据降维处理</Checkbox></Tooltip>&nbsp;
                    <InputNumber
                    disabled={!this.state.checked}
                    defaultValue={this.state.dimNum}
                    min={3}
                    max={100}
                    formatter={value => `${value}门课`}
                    parser={value => value.replace('门课', '')}
                    onChange={this.onDataDimChange} /> &nbsp;
                    <Button disabled={this.state.checkedList.length === 0}
                    type="primary" onClick={this.predict}>预测</Button>
                <br />
                <Card title="该生未修课程-请选择课程然后点击[预测]按钮进行预测" bordered={false}>
                    <Checkbox
                        indeterminate={this.state.indeterminate}
                        onChange={this.onCheckAllChange}
                        checked={this.state.checkAll}
                    >
                        Check all
                    </Checkbox>
                    <br />
                    <CheckboxGroup options={this.state.undoCourse} value={this.state.checkedList}
                        onChange={this.onCourseCheckChange} />
                </Card>
                <Card title="预测结果展示" bordered={false}>
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 4, md: 6, lg: 6, xl: 6, xxl: 8 }}
                        dataSource={this.state.predictData}
                        renderItem={item => (
                            <List.Item>
                                <div style={{ background: item.bg, padding: "2px" }}>
                                    课程: {item.course}<br />
                                    概率: {item.prob}% <br />
                                    结果: {item.result}
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            </div>
        )
    }
}

export default StuFailPredict;