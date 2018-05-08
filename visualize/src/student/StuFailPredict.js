import React, { Component } from 'react';
import {
    Input, Button, Row, Col, Card, Checkbox, InputNumber, Tooltip
    , List
} from 'antd';
// import {
//     Radar, RadarChart, PolarGrid, Legend,
//     PolarAngleAxis //, PolarRadiusAxis
// } from 'recharts';
// import * as net from "../utils/net";

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
        }
        this.onCheckChange = this.onCheckChange.bind(this);
    }

    onCheckChange(e) {
        this.setState({
            checked: e.target.checked
        })
    }

    predict() {

    }

    onCourseCheckChange = (checkedList) => {
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
            checkAll: checkedList.length === plainOptions.length,
        });
    }

    onCheckAllChange = (e) => {
        this.setState({
            checkedList: e.target.checked ? plainOptions : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    }

    render() {
        return (
            <div>
                <Input placeholder="输入学号" onChange={this.onChange} style={{ width: 200 }} />&nbsp;
                    <Button type="primary" onClick={this.getStudenta}>未修课程查询</Button> &nbsp;
                    <Tooltip title="选择降维可以根据实际输入维度,提高预测准确度">
                    <Checkbox
                        checked={this.state.checked}
                        onChange={this.onCheckChange}>数据降维处理</Checkbox></Tooltip>&nbsp;
                    <InputNumber
                    disabled={!this.state.checked}
                    defaultValue={20}
                    min={3}
                    max={100}
                    formatter={value => `${value}门课`}
                    parser={value => value.replace('门课', '')}
                    onChange={this.getDataDim} /> &nbsp;
                    <Button type="primary" onClick={this.predict}>预测</Button>
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
                    <CheckboxGroup options={plainOptions} value={this.state.checkedList}
                        onChange={this.onCourseCheckChange} />
                </Card>
                <Card title="预测结果展示" bordered={false}>
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 4, md: 8, lg: 8, xl: 8, xxl: 10 }}
                        dataSource={data}
                        renderItem={item => (
                            <List.Item>
                                <div style={{ background: item.bg, padding: "2px" }}>
                                    课程{item.course}有{item.prob}%的概率{item.result}
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