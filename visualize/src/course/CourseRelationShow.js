import React, { Component } from "react";
import { Input, Button, Row, Col, List, Slider, Icon } from "antd";
import ReactEcharts from 'echarts-for-react';
import * as net from "../utils/net";


class CourseRelationShow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            speciality: [],/**完成计算的专业列表*/
            nodes: [],
            links: [],
            graphHeight: 600/**关系图高度 */,
            topNodeNum: 0,
            maxNodeSize: 30,
            currentCode: ''/**当前在显示的专业代码 */,
            originNodeNum: 0
        }
        this.updateNodeLinks = this.updateNodeLinks.bind(this);
        this.updateMaxNodeSize = this.updateMaxNodeSize.bind(this);
        this.updateTopNodeNum = this.updateTopNodeNum.bind(this);
        this.updateGraphHeight = this.updateGraphHeight.bind(this);
    }

    componentDidMount() {
        this.loadSpecialityList();
    }

    loadSpecialityList() {
        var t = this;
        net.get("/course/relation-show/complete-speciality", function (re) {
            t.setState({
                speciality: re.data.data,
                currentCode: re.data.data[0].code
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
            // animationDuration: 500,
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
        console.log(item)
        var t = this;
        this.setState({
            currentCode: item.code
        }, t.updateNodeLinks())
    }

    updateNodeLinks() {
        var t = this;
        net.post("/course/relation-show/get-nodes-links", {
            code: t.state.currentCode,
            topNodeNum: t.state.topNodeNum,
            maxNodeSize: t.state.maxNodeSize
        }, function (re) {
            t.setState({
                nodes: re.data.data.nodes,
                links: re.data.data.links,
                originNodeNum: re.data.data.originNodeNum
            })
        });
    }

    updateMaxNodeSize(size) {
        this.setState({
            maxNodeSize: size
        })
    }

    updateTopNodeNum(num) {
        this.setState({
            topNodeNum: num
        })
    }

    updateGraphHeight(height) {
        this.setState({
            graphHeight: height
        })
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={4}>最大节点大小</Col>
                    <Col span={20}>
                        <Slider defaultValue={this.state.maxNodeSize} min={1} max={200}
                            onAfterChange={this.updateMaxNodeSize} />
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>最多显示节点数</Col>
                    <Col span={20}>
                        <Slider defaultValue={this.state.topNodeNum} min={1}
                            max={this.state.originNodeNum} onAfterChange={this.updateTopNodeNum} />
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>图片高度调节</Col>
                    <Col span={20}>
                        <Slider defaultValue={this.state.graphHeight} min={200} max={3000}
                            onAfterChange={this.updateGraphHeight} />
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>刷新</Col>
                    <Col span={20}>
                        <Button type="ghost" shape="circle-outline" size="large"
                            onClick={this.updateNodeLinks}>
                            <Icon type="search" />
                        </Button>
                    </Col>
                </Row>
                <hr />
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