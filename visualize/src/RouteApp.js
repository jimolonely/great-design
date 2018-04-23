import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import App from './App';
import Course from './course/Course';
import Mark from './student/Mark';

import WC from './student/WC';
import Studenta from './student/Studenta';
import MultiStudenta from './student/MultiStudenta';
import StuFailPredict from './student/StuFailPredict';
import StuJobAnalyze from './student/StuJobAnalyze';

import TwoCourseRelation from './course/TwoCourseRelation'
// import { CourseRelation } from "./course/CourseRelation";
import CourseRelationShow from "./course/CourseRelationShow";
import CourseDifficulty from "./course/CourseDifficulty";
import CourseTeacherCompare from "./course/CourseTeacherCompare";
import CourseRelationCompute from "./course/CourseRelationCompute";

import CollegeMark from "./mark/CollegeMark";
import SpecialityCluster from './mark/SpecialityCluster';

const SubMenu = Menu.SubMenu;

class RouteApp extends Component {
  state = {
    current: 'home',
  }

  handleClick = (e) => {
    console.log('click ', e);
    this.setState({
      current: e.key,
    });
  }

  render() {
    return (
      <Router>
        <div>
          <div>
            <Menu
              onClick={this.handleClick}
              selectedKeys={[this.state.current]}
              mode="horizontal"
            >
              <Menu.Item key="home">
                <Link to="/"><Icon type="home" />Home</Link>
              </Menu.Item>
              <SubMenu title={<span><Icon type="github" />Student</span>}>
                <Menu.Item key="stu-wc"><Link to="/stu/wc">评价词云</Link></Menu.Item>
                <Menu.Item key="stu-studenta"><Link to="/stu/studenta">学生个体画像</Link></Menu.Item>
                <Menu.Item key="stu-whole-studenta"><Link to="/stu/multi-studenta">学生群体画像</Link></Menu.Item>
                <Menu.Item key="stu-fail-predict"><Link to="/stu/fail-predict">学生挂科预测</Link></Menu.Item>
                <Menu.Item key="stu-job-analyze"><Link to="/stu/job-analyze">就业分析</Link></Menu.Item>
                <Menu.Item key="stu-talent"><Link to="/mark">其他</Link></Menu.Item>
              </SubMenu>
              <SubMenu title={<span><Icon type="profile" />Course</span>}>
                <SubMenu title="课程相关性">
                  <Menu.Item key="course-relation-compute"><Link to="/course/relation-compute">计算专业课程相关性 </Link></Menu.Item>
                  <Menu.Item key="course-all"><Link to="/course/relation-show">课程相关性可视化 </Link></Menu.Item>
                  <Menu.Item key="course-2"><Link to="/course/tworelation">2门课程相关性</Link></Menu.Item>
                </SubMenu>
                <Menu.Item key="course-difficulty"><Link to="/course/difficulty">课程难度 </Link></Menu.Item>
                <Menu.Item key="course-compare"><Link to="/course/teacompare">课程老师对比 </Link></Menu.Item>
                {/* <Menu.Item key="course-image"><Link to="/course">课程画像 </Link></Menu.Item> */}
                {/* <Menu.Item key="course-rank"><Link to="/course">课程排行榜 </Link></Menu.Item> */}
              </SubMenu>
              <SubMenu title={<span><Icon type="line-chart" />Mark</span>}>
                <Menu.Item key="mark-college"><Link to="/mark/college">学院成绩分析</Link></Menu.Item>
                <Menu.Item key="mark-speciality-cluster"><Link to="/mark/speciality-cluster">专业聚类分析</Link></Menu.Item>
              </SubMenu>
            </Menu>
          </div>
          <div style={{ padding: '20px' }}>
            <Route exact path="/" component={App} />
            <Route exact path="/course" component={Course} />
            <Route exact path="/course/tworelation" component={TwoCourseRelation} />
            <Route exact path="/course/relation-show" component={CourseRelationShow} />
            <Route exact path="/course/difficulty" component={CourseDifficulty} />
            <Route exact path="/course/teacompare" component={CourseTeacherCompare} />
            <Route exact path="/course/relation-compute" component={CourseRelationCompute} />
            <Route exact path="/stu/wc" component={WC} />
            <Route exact path="/stu/studenta" component={Studenta} />
            <Route exact path="/stu/multi-studenta" component={MultiStudenta} />
            <Route exact path="/stu/fail-predict" component={StuFailPredict} />
            <Route exact path="/stu/job-analyze" component={StuJobAnalyze} />
            <Route exact path="/mark" component={Mark} />
            <Route exact path="/mark/college" component={CollegeMark} />
            <Route exact path="/mark/speciality-cluster" component={SpecialityCluster} />
          </div>
        </div>
      </Router>
    );
  }
}

export default RouteApp;
