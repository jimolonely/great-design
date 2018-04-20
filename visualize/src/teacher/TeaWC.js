import React, { Component } from 'react';
import { Button, Input, Row, Col } from 'antd';
import * as net from "../utils/net";

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
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Input placeholder="输入老师姓名" onChange={this.onChangeName} />
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Input placeholder="输入课程名(非必填)" onChange={this.onChangeCourse} />
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col span={20}>
                        <Button type="primary" onClick={this.getTeaWordCloudImg}>获取词云</Button>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <img src={this.state.bestStr} alt="best img" />
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <img src={this.state.badStr} alt="bad img" />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <img src={this.state.imgStr} alt="img" />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default TeaWC;