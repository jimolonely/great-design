import React, { Component } from 'react';
import { Button, Input, Row, Col, Divider } from 'antd';
import * as net from "../utils/net";

class StuWC extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stuId: '',
            imgStr: ''
        }
        this.getStuWordCloudImg = this.getStuWordCloudImg.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
    }
    onChange(e) {
        this.setState({
            stuId: e.target.value
        });
    }

    getStuWordCloudImg() {
        var t = this;
        if (this.state.stuId !== "") {
            net.get('/fun/' + this.state.stuId, function (response) {
                const imgStr = "data:image/jpeg;base64," + response.data.data;
                t.setState({
                    imgStr: imgStr
                });
            });
        }
    }

    render() {
        return (
            <div>
                <Input placeholder="输入学号" onChange={this.onChange} style={{ width: '60%' }} />&nbsp;
                <Button type="primary" onClick={this.getStuWordCloudImg}>获取词云</Button>
                <br />
                <br />
                <Row>
                    <Col span={20}>
                        <img src={this.state.imgStr} alt="img" />
                    </Col>
                </Row>
            </div>
        )
    }
}

class TeaWC extends Component {

    constructor(props) {
        super(props);
        this.state = {
            teaName: '',
            courseName: '',
            imgStr: '',
            bestStr: '',
            badStr: ''
        }
        this.getTeaWordCloudImg = this.getTeaWordCloudImg.bind(this);
        this.onChangeCourse = this.onChangeCourse.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
    }

    componentWillMount() {
    }
    onChangeCourse(e) {
        this.setState({
            courseName: e.target.value
        });
    }
    onChangeName(e) {
        this.setState({
            teaName: e.target.value
        });
    }

    getTeaWordCloudImg() {
        var t = this;
        if (this.state.teaName !== "") {
            var url = "/teacher/wc/" + t.state.teaName
            if (t.state.courseName !== "") {
                url += "/" + t.state.courseName
            }
            net.get(url, function (response) {
                console.log(response)
                if (t.state.courseName === "") {
                    t.setState({
                        bestStr: "data:image/jpeg;base64," + response.data.data.best,
                        badStr: "data:image/jpeg;base64," + response.data.data.bad,
                        imgStr: ''
                    });
                } else {
                    t.setState({
                        imgStr: "data:image/jpeg;base64," + response.data.data,
                        bestStr: '',
                        badStr: ''
                    });
                }
            })
        }
    }

    render() {
        return (
            <div>
                <Row gutter={10}>
                    <Col xs={20} sm={20} md={10} lg={10} xl={10}>
                        <Input placeholder="输入老师姓名" onChange={this.onChangeName} />
                    </Col>
                    <Col xs={20} sm={20} md={10} lg={10} xl={10}>
                        <Input placeholder="输入课程名(非必填)" onChange={this.onChangeCourse} />
                    </Col>
                    <Col xs={4} sm={4} md={2} lg={2} xl={2}>
                        <Button type="primary" onClick={this.getTeaWordCloudImg}>获取词云</Button>
                    </Col>
                </Row>
                <br />
                <Row gutter={10}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <img src={this.state.bestStr} alt="best img" />
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <img src={this.state.badStr} alt="bad img" />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <img src={this.state.imgStr} alt="course img" />
                    </Col>
                </Row>
            </div>
        )
    }
}

class WC extends Component {
    render() {
        return (
            <div>
                <Divider orientation="left">查询学生的评价词云</Divider>
                <StuWC />
                <Divider orientation="left">查询学生对老师的评价词云结果</Divider>
                <TeaWC />
            </div>
        )
    }
}

export default WC;