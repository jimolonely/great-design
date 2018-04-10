import React, { Component } from "react";
import { Input, Button, Row, Col, List } from "antd";
import ReactEcharts from 'echarts-for-react';


const data = [
    {
        code: '1001',
        courseNum: 100
    },
    {
        code: '1001',
        courseNum: 100
    },
    {
        code: '1001',
        courseNum: 100
    }
]

class CourseRelationShow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialityCode: '',
            nodes: [],
            links: []
        }
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

    viewGraph() {
        console.log("view");
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <List
                            itemLayout="horizontal"
                            dataSource={data}
                            renderItem={
                                item => (
                                    <List.Item actions={[<a onClick={this.viewGraph}>查看图谱</a>]}>
                                        专业{item.code}共{item.courseNum}门课
                                    </List.Item>
                                )
                            }
                        />
                    </Col>
                    <Col span={18}>
                        <ReactEcharts option={this.getOption()} />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default CourseRelationShow;