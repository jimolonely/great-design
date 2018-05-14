import React, { Component } from "react";
import { Button, Row, Col, List, Slider, Icon, Select, Divider } from "antd";
import ReactEcharts from 'echarts-for-react';
import * as net from "../utils/net";

const Option = Select.Option;

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
        this.getSpeciality = this.getSpeciality.bind(this);
    }

    componentDidMount() {
        this.loadSpecialityList();
    }

    loadSpecialityList() {
        var t = this;
        net.get("/course/relation-show/complete-speciality", function (re) {
            t.setState({
                speciality: re.data.data.map(s => <Option key={s.code} value={s.code}>{s.name + "(" + s.code + ")"}</Option>),
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
                    edgeSymbol: ['arrow'],
                    categories: [
                        {
                            name: '交通运输'
                        }
                    ],
                    emphasis: {
                        lineStyle: {
                            width: 10
                        }
                    },
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

    getSpeciality(v) {
        this.setState({
            currentCode: v
        })
    }

    render() {
        return (
            <div>
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="请搜索专业名称或代码"
                    optionFilterProp="children"
                    onSelect={this.getSpeciality}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.state.speciality}
                </Select>
                &nbsp;
                <Button type="primary" onClick={this.updateNodeLinks}>查询课程关系图</Button>
                <Divider>参数调节</Divider>
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
                    <Col>
                        <ReactEcharts option={this.getOption()} style={{ height: this.state.graphHeight + 'px' }} />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default CourseRelationShow;