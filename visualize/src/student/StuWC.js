import React, { Component } from 'react';
// import {
//     Radar, RadarChart, PolarGrid, Legend,
//     PolarAngleAxis, PolarRadiusAxis
// } from 'recharts';
import { Button, Input, Row, Col } from 'antd';
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
                <Row>
                    <Col span={20}>
                        <Input placeholder="输入学号" onChange={this.onChange} />
                    </Col>
                </Row>
                <Row>
                    <Col span={20}>
                        <Button type="primary" onClick={this.getStuWordCloudImg}>获取词云</Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={20}>
                        <img src={this.state.imgStr} alt="img" />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default StuWC;