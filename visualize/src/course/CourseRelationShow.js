import React, { Component } from "react";
import { Input, Button, Row, Col, List } from "antd";
import ReactEcharts from 'echarts-for-react';
import * as net from "../utils/net";


class CourseRelationShow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialityCode: '',
            speciality: [],/**完成计算的专业列表*/
            nodes: [],
            links: [],
            graphHeight: 600/**关系图高度 */
        }
    }

    componentDidMount() {
        this.loadSpecialityList();
    }

    loadSpecialityList() {
        var t = this;
        net.get("/course/relation-show/complete-speciality", function (re) {
            t.setState({
                speciality: re.data.data
            });
        });
    }

    getOption() {
        var option = {
            title: {
                text: '课程关系图',
                subtext: '数据来自教务处',
                top: 'top',
                left: 'middle'
            },
            animationDuration: 500,
            animationEasingUpdate: 'quinticInOut',
            tooltip: {
                trigger: 'item',
                formatter: '{a} : {b}'
            },
            toolbox: {
                show: true,
                feature: {
                    restore: { show: true },
                    magicType: { show: true, type: ['force', 'chord'] },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                x: 'left',
                data: ['土木专业']
            },
            series: [
                {
                    type: 'graph',
                    name: "课程关系图",
                    layout: 'force',
                    categories: [
                        {
                            name: '交通运输'
                        }
                    ],
                    label: {
                        show: true,
                        position: 'inside',
                    },
                    lineStyle: {
                        normal: {
                            color: 'source',
                            curveness: 0.3
                        }
                    }
                    ,
                    // minRadius: 15,
                    // maxRadius: 25,
                    roam: true,
                    nodes: this.state.nodes,
                    links: this.state.links
                }
            ]
        };
        return option;
    }

    viewGraph(item) {
        console.log(item);
        var t = this;
        net.post("/course/relation-show/get-nodes-links", {
            code: item.code
        }, function (re) {
            t.setState({
                nodes: re.data.data.nodes,
                links: re.data.data.links
            })
        });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <List
                            itemLayout="horizontal"
                            dataSource={this.state.speciality}
                            renderItem={
                                item => (
                                    <List.Item actions={[<a onClick={() => this.viewGraph(item)}>查看图谱</a>]}>
                                        专业{item.code}共{item.courseNum}门课
                                    </List.Item>
                                )
                            }
                        />
                    </Col>
                    <Col span={18}>
                        <ReactEcharts option={this.getOption()} style={{ height: this.state.graphHeight + 'px' }} />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default CourseRelationShow;