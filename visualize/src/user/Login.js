import React, { Component } from 'react';
import {
    Form, Icon, Input, Button, Row, Col
} from 'antd';
// import {
//     Radar, RadarChart, PolarGrid, Legend,
//     PolarAngleAxis //, PolarRadiusAxis
// } from 'recharts';
// import * as net from "../utils/net";
import './Login.css';

const FormItem = Form.Item;

class Login extends Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div id="login-form">
                <Row type="flex" justify='center'>
                    <Col >
                        <h2>基于学生成绩数据的分析系统</h2>
                    </Col>
                </Row>
                <Row type="flex" justify='center'>
                    <Col >
                        <Form onSubmit={this.handleSubmit} className="login-form">
                            <FormItem>
                                {getFieldDecorator('userName', {
                                    rules: [{ required: true, message: '请输入用户名!' }],
                                })(
                                    <Input style={{ width: 300 }}
                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请输入正确密码!' }],
                                })(
                                    <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                                )}
                            </FormItem>
                            <FormItem>
                                <Button type="primary" htmlType="submit" className="login-form-button">
                                    登录系统
          </Button>
                            </FormItem>
                        </Form>
                    </Col>
                </Row>
            </div>
        )
    }
}

const WrappedNormalLoginForm = Form.create()(Login);

export default WrappedNormalLoginForm;