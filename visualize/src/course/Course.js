import React, { Component } from 'react';
import {
    Radar, RadarChart, PolarGrid, Legend,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Button, Input } from 'antd';
import * as net from "../utils/net";

const data = [
    // { subject: 'Math', A: 120, B: 110, fullMark: 150 },
    // { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
    // { subject: 'English', A: 86, B: 130, fullMark: 150 },
    // { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
    // { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
    // { subject: 'History', A: 85, B: 85.5, fullMark: 150.0 },
    { subject: '排名', A: 80, B: 110, fullMark: 100 },
    { subject: '专业对比', A: 98, B: 130, fullMark: 100 },
    { subject: '推免指数', A: 76, B: 130, fullMark: 100 },
    { subject: '挂科预警', A: 29, B: 100, fullMark: 100 },
    { subject: '就业情况', A: 85, B: 90, fullMark: 100 },
    { subject: '课外实践', A: 90, B: 85.5, fullMark: 100.0 },
    // { subject: 'History', rel: { A: 85, B: 85 }, fullMark: 150 },
    // { subject: 'Physics', rel: { A: 15, B: 105 }, fullMark: 150 },
    // { subject: 'Math', rel: [{ A: 75 }, { B: 95 }], fullMark: 150 },
    // { subject: 'Math', rel: [{ A: 75 }, { B: 95 }], fullMark: 150 },
    // { subject: 'Math', rel: [{ A: 75 }, { B: 95 }], fullMark: 150 }
];

class Course extends Component {

    constructor(props) {
        super(props);
        this.state = {
            courseName: "",
            postRelationData: [],
            preRelationData: []
        }
        this.onChange = this.onChange.bind(this);
        this.getRelation = this.getRelation.bind(this);
    }

    onChange(e) {
        this.setState({
            courseName: e.target.value
        });
    }

    getRelation() {
        var t = this;
        if (this.state.courseName !== "") {
            net.jpost('/test/relation', { courseName: this.state.courseName }, function (response) {
                t.setState({
                    postRelationData: response.data.data.postRelations,
                    preRelationData: response.data.data.preRelations
                });
            })
        }
    }
    render() {
        return (
            <div>
                <Input placeholder="输入课程名" onChange={this.onChange} />
                <Button type="primary" onClick={this.getRelation}>获取数据</Button>
                <RadarChart cx={300} cy={250} outerRadius={150} width={800} height={500} data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Legend />
                    <Radar name="后置课程" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
                <RadarChart cx={300} cy={250} outerRadius={150} width={800} height={500} data={this.state.postRelationData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 1]} />
                    <Legend />
                    <Radar name="后置课程" dataKey="mark" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
                <RadarChart cx={300} cy={250} outerRadius={150} width={800} height={500} data={this.state.preRelationData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 1]} />
                    <Legend />
                    <Radar name="前置课程" dataKey="mark" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
            </div>
        )
    }
}

export default Course;