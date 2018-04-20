import React, { Component } from 'react';
import { Button, AutoComplete, Divider, Tooltip } from 'antd';
import * as net from '../utils/net';

const data = ["寂寞", "寂寞的家", "孤独"]

class CollegeMark extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '看我',
            colleges: [],
            grades: [],
            collegeValue: '',
            gradeValue: ''
        }
        this.getCollege = this.getCollege.bind(this);
        this.getGrade = this.getGrade.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    getCollege(value, option) {
        this.setState({
            collegeValue: value
        })
    }

    getGrade(value, option) {
        this.setState({
            gradeValue: value
        })
    }
    onSearch() {
        this.setState({
            title: '正在分析...'
        })
        var tip = "";
        if (this.state.gradeValue === "" && this.state.collegeValue === "") {
            tip = "您选择了分析全校数据";
        } else {
            tip = "您选择了分析" + this.state.collegeValue + "学院-" + this.state.gradeValue + "的数据";
        }
        
    }

    render() {
        return (
            <div>
                <Tooltip title="必须选择,输入无效">
                    <AutoComplete
                        style={{ width: 200 }}
                        dataSource={data}
                        placeholder="请输入学院名称或代码"
                        onSelect={this.getCollege}
                        filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                    /></Tooltip>&nbsp;
                <AutoComplete
                    style={{ width: 200 }}
                    dataSource={data}
                    placeholder="请输入年级"
                    onSelect={this.getGrade}
                    filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                />&nbsp;
                <Button type="primary" onClick={this.onSearch}>分析查询</Button>
                <Divider orientation="left">{this.state.title}</Divider>

            </div>
        )
    }
}

export default CollegeMark;