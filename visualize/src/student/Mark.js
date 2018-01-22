import React, { Component } from 'react';
import {
    Radar, RadarChart, PolarGrid, Legend,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Button, Input, Row, Col, List, Card } from 'antd';
import * as net from "../utils/net";

class Mark extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stuId: '',
            dataStuCourse: [],
            firstCourse: []
        }
        this.getStuCourse = this.getStuCourse.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getFirstCourse = this.getFirstCourse.bind(this);
    }

    componentWillMount() {
    }
    onChange(e) {
        this.setState({
            stuId: e.target.value
        });
    }

    getStuCourse() {
        var t = this;
        if (this.state.stuId !== "") {
            net.jpost('/mark/getStuCourse', function (response) {
                t.setState({
                    dataStuCourse: response.data.data
                });
            })
        }
    }

    getFirstCourse(e) {
        var t = this;
        console.log(e)
        net.jpost('/mark/getFirstCourse',function (response) {
            var data = response.data.data;
            if (data == null) {
                data = {
                    course_name: '未知',
                    first_course: '未知'
                }
            }
            t.setState({
                firstCourse: data
            });
        })
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={8}>
                        <Row>
                            <Col span={6}>
                                <Input placeholder="输入学号" onChange={this.onChange} />
                            </Col>
                            <Col span={2}>
                                <Button type="primary" onClick={this.getStuCourse}>获取学生课程</Button>
                            </Col>
                        </Row>
                        <List
                            size="small"
                            header={<div>course_code,course_name</div>}
                            footer={<div>Footer</div>}
                            bordered
                            dataSource={this.state.dataStuCourse}
                            renderItem={item => (
                                <List.Item
                                    actions={[<a onClick={() => this.getFirstCourse(item)}>选择</a>]}
                                >
                                    {item.course_code}-{item.course_name}
                                </List.Item>)}
                        />
                    </Col>
                    <Col span={16}>

                    </Col>
                </Row>
            </div>
        )
    }
}

export default Mark;