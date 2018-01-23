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
import StuWC from './student/StuWC';
import TwoCourseRelation from './course/TwoCourseRelation'
// import { CourseRelation } from "./course/CourseRelation";
import ThreeDimScatterChart from "./course/CourseRelation";
import CourseDifficulty from "./course/CourseDifficulty";
import Studenta from './student/Studenta';
import TeaWC from "./teacher/TeaWC";

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
          <Menu
            onClick={this.handleClick}
            selectedKeys={[this.state.current]}
            mode="horizontal"
          >
            <Menu.Item key="home">
              <Link to="/"><Icon type="home" />Home</Link>
            </Menu.Item>
            <SubMenu title={<span><Icon type="github" />Student</span>}>
              <Menu.Item key="stu-wc"><Link to="/stu/wc">查询学生评价词云</Link></Menu.Item>
              <Menu.Item key="stu-mark"><Link to="/mark">预测学生成绩</Link></Menu.Item>
              <Menu.Item key="stu-studenta"><Link to="/stu/studenta">学生画像</Link></Menu.Item>
              <Menu.Item key="stu-whole-studenta"><Link to="/mark">学生整体画像</Link></Menu.Item>
              <Menu.Item key="stu-job-predict"><Link to="/mark">就业预测</Link></Menu.Item>
              <Menu.Item key="stu-talent"><Link to="/mark">学习达人榜</Link></Menu.Item>
            </SubMenu>
            <SubMenu title={<span><Icon type="profile" />Course</span>}>
              <Menu.Item key="course-2"><Link to="/course/tworelation">2门课程相关性</Link></Menu.Item>
              <Menu.Item key="course-all"><Link to="/course/relation">课程关联度可视化 </Link></Menu.Item>
              <Menu.Item key="course-difficulty"><Link to="/course/difficulty">课程难度 </Link></Menu.Item>
              <Menu.Item key="course-compare"><Link to="/course">课程对比 </Link></Menu.Item>
              <Menu.Item key="course-image"><Link to="/course">课程画像 </Link></Menu.Item>
              <Menu.Item key="course-rank"><Link to="/course">课程排行榜 </Link></Menu.Item>
            </SubMenu>
            <SubMenu title={<span><Icon type="user" />Teacher</span>}>
              <Menu.Item key="tea-teachera"><Link to="/course/tworelation">老师画像</Link></Menu.Item>
              <Menu.Item key="tea-wc"><Link to="/tea/wc">老师的评价词云 </Link></Menu.Item>
              <Menu.Item key="tea-course-compare"><Link to="/course">老师的不同课程对比 </Link></Menu.Item>
            </SubMenu>
          </Menu>
          <div style={{ padding: '20px' }}>
            <Route exact path="/" component={App} />
            <Route exact path="/course" component={Course} />
            <Route exact path="/course/tworelation" component={TwoCourseRelation} />
            <Route exact path="/course/relation" component={ThreeDimScatterChart} />
            <Route exact path="/course/difficulty" component={CourseDifficulty} />
            <Route exact path="/mark" component={Mark} />
            <Route exact path="/stu/wc" component={StuWC} />
            <Route exact path="/stu/studenta" component={Studenta} />
            <Route exact path="/tea/wc" component={TeaWC} />
          </div>
        </div>
      </Router>
    );
  }
}

export default RouteApp;
