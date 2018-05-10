from datetime import datetime

import numpy as np
from flask_restful import Resource, request
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

from util.data import load_data_by_uri, load_pandas_df, load_data_by_sql
from util.dto import Result
from util.useful import txt_to_word_cloud_imgstr

from wordcloud import WordCloud


class StuToTeacherAdviceWordCloud(Resource):
    '''
    返回学生对老师评价的词云图片的Base64编码
    '''

    def get(self, stuId):
        text = load_data_by_uri("/fun/getStuAdviceToTeacher", param={'stuId': stuId})
        return Result(data=txt_to_word_cloud_imgstr(text))


class StuFailPredict(Resource):
    def get(self, stu_id):
        '''获得学生未修课程'''
        sql = "select top 1 grade,speciality_code,course_code,course_name,term_order,mark,pmark " \
              "from view_stu_course_mark where student_id='%s'" % stu_id
        stu = load_pandas_df(sql)
        if stu.empty:
            return Result(ok=False, msg="无该学生")
        speciality_code = stu.iloc[0]['speciality_code']
        grade = stu.iloc[0]['grade']
        sql = "select t.Course_name as course_name,t.Course_year as year,t.Course_term as term," \
              "t.Course_code as course_code,c.type_name as course_type from \
        train_plan_course t,train_plan_credit c where t.Course_big_type_id=c.sid \
        and t.Grade='%s' and c.type_name like '%%专业%%'  and t.Speciality_code='%s'" % (grade, speciality_code)
        df2 = load_pandas_df(sql)
        # 找出所有专业课程
        # # 找出学生已考试的课程
        # course_did = set(stu['course_name'].values)
        # # 求差集,剩下的就是没修的课程
        # course_un_did = list(course_all - course_did)
        # 计算当前学期
        today = datetime.today()
        year = str(today.year - int(grade))
        term = '1' if today.month > 2 and today.month < 7 else '2'
        df3 = df2[df2['year'] == year]
        df3 = df3[df3['term'] >= term]
        df4 = df2[df2['year'] > year]
        df4 = df4.append(df3)
        course_all = list(df4['course_name'].values)
        return Result(course_all)

    def post(self):
        args = request.form
        print(args)
        stu_id = args['stuId']
        # 得到参数:课程列表
        course_to_predict = []
        n = len(args) - 2
        for i in range(n):
            course_to_predict.append(args.get('courseList[' + str(i) + ']', ''))

        # 1.找出X的前置课程,确定学生的专业和年级
        sql = "select grade,speciality_code,course_code,course_name,term_order,mark,pmark from " \
              "view_stu_course_mark where student_id='%s'" % stu_id
        stu = load_pandas_df(sql)
        if stu.empty:
            return Result(ok=False, msg="不存在该学生信息")

        grade = stu.iloc[0]['grade']
        term_order = stu['term_order'].max()
        speciality_code = stu.iloc[0]['speciality_code']

        # 找前一个年级的成绩数据来预测
        pre_grade = str(int(grade) - 1)
        sql = "select student_id,course_name,course_code,pmark,mark from view_stu_course_mark " \
              "where speciality_code='%s' and grade='%s'" \
              % (speciality_code, pre_grade)
        df = load_pandas_df(sql)
        if df.empty:
            return Result(ok=False, msg="数据量不足,无法预测")

        re = []
        print(course_to_predict)
        for course_name in course_to_predict:
            d = dict()
            d['course'] = course_name

            # course_name = '计算机网络'
            a = df[df['course_name'] == course_name]
            if a.empty:
                d['prob'] = 0
                d['result'] = '数据不足无法预测'
                d['bg'] = '#e2e2e2'
                re.append(d)
                continue

            course_code = a.iloc[0]['course_code']

            pre_course = stu
            course_codes = list(pre_course['course_code'].values)
            course_codes.append(course_code)
            # course_codes
            course_names = list(pre_course['course_code'].values)
            course_names.append(course_name)

            df = df.drop_duplicates(subset=['student_id', 'course_code'])

            # 选出需要的课程
            stu_ids = df[df['course_code'] == course_code]['student_id'].values
            if len(stu_ids) == 0:
                d['prob'] = 0
                d['result'] = '原始数据不足无法预测'
                d['bg'] = '#e2e2e2'
                re.append(d)
                continue

            d1 = df[df['student_id'].isin(stu_ids)]
            dd = d1[d1['course_code'].isin(course_codes)]
            if dd.empty:
                d['prob'] = 0
                d['result'] = '前置课程数据不足无法预测'
                d['bg'] = '#e2e2e2'
                re.append(d)
                continue

            now_names = set(dd['course_name'].values)

            gd = dd.groupby(['student_id'], as_index=False)
            d_arr = dict()  # key存的是课程名,value是存放成绩的数组,这样竖着看就是一个学生的成绩列表了,也就是转置操作
            for name, g in gd:
                d_m = dict()
                d_m2 = dict()
                for i, row in g.iterrows():
                    d_m[row['course_name']] = row['pmark']
                    d_m2[row['course_name']] = row['mark']
                for c in now_names:
                    d_arr[c] = d_arr.get(c, [])
                    d_arr[c].append(d_m.get(c, 60))

            # 要将mt矩阵进行拆分成数据和标签(预测的那门课)
            y = d_arr[course_name]
            X = np.transpose([v for k, v in d_arr.items() if not k == course_name])
            course_old = [k for k in d_arr.keys() if not k == course_name]

            print(X.shape)

            # 离散化标签
            label = []
            for m in y:
                if m > 65:
                    label.append(1)
                else:
                    label.append(0)

            # 对X做特征选取和降维操作

            # 模型训练
            X_train, X_test, y_train, y_test = train_test_split(X, label, test_size=0.4)
            clf = DecisionTreeClassifier()
            clf = clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            acc = accuracy_score(y_test, y_pred)

            # 预测
            xx = []
            for c in course_old:
                v = stu[stu['course_name'] == c]['pmark'].values
                if len(v) > 0:
                    xx.append(v[0])
                else:
                    xx.append(60)
            x_n = [xx]
            result = clf.predict(x_n)[0]

            if result == 1:
                d['result'] = '正常'
                d['bg'] = '#59f16d'
            else:
                d['result'] = '挂科'
                d['bg'] = '#f34343'
            d['prob'] = acc * 100
            re.append(d)
        return Result(re)


class Studenta(Resource):
    def get(self, stu_id):
        # 查询基本信息
        sql = "select student_id,name,sex,grade,college_name,speciality_name,nation_name,CONVERT(VARCHAR,birthday,23) " \
              "as birthday,state_type,party,family_address,student_mobilephone, graduation_school,rewards_punish,rid_region," \
              "individual_love,email,school_area,enrollment_mark from " \
              "view_student_full_info where student_id='%s'" % (stu_id)
        stu = load_data_by_sql(sql)
        if len(stu) == 0:
            return Result(ok=False, msg="查无此人")
        stu = stu[0]

        # 先暂时不自己计算绩点
        sql = "select top 1 avg,gpa,order_num,speciality_num from exam_mark_rank_student where " \
              "student_id='%s' order by add_time desc" % stu_id
        marks = load_data_by_sql(sql)
        if len(marks) == 0:
            return Result(ok=False, msg="学分绩点出错")
        marks = marks[0]

        # 构造雷达图数据
        r_mark = self.get_radar_data(marks)

        # 查成绩波动图
        sql = "select course_name,pmark,course_type from view_stu_course_mark where student_id='%s' order by term_order" % stu_id
        df_mark = load_pandas_df(sql)
        df_mark = df_mark.drop_duplicates(subset='course_name')
        cn = df_mark['course_name'].values
        pm = df_mark.pmark.values
        mark_list = [{'course': cn[i], 'mark': pm[i]} for i in range(len(cn))]

        re = dict()
        re['basicInfo'] = stu
        re['mark'] = marks
        re['radarData'] = r_mark
        re['markList'] = mark_list
        re['courseCondition'] = self.course_judge(df_mark)
        return Result(re)

    def course_judge(self, df_mark):
        '''
        课程情况
        :param df_mark:
        :return:
        '''
        wd = WordCloud(font_path="/home/jimo/workspace/Git/great-design/kill-student-server/resource/SimHei.ttf")
        good = " ".join(df_mark[df_mark['course_type'] == '必'].sort_values(by=['pmark'], ascending=False).head()[
                            'course_name'].values)
        good_course = ", ".join(wd.process_text(good).keys())
        bad = " ".join(df_mark.sort_values(by=['pmark']).head()['course_name'].values)
        bad_course = ", ".join(wd.process_text(bad).keys())
        text = " ".join(df_mark[df_mark['course_type'] == '选']['course_name'].values)
        option_course = ", ".join(wd.process_text(text).keys())
        d = dict()
        d['good'] = good_course
        d['bad'] = bad_course
        d['option'] = option_course
        return d

    def get_radar_data(self, marks):
        r_mark = []
        d = dict()
        d['subject'] = '平均分'
        d['v'] = marks['avg']
        d['fullMark'] = 100
        r_mark.append(d)
        d = dict()
        d['subject'] = '绩点'
        d['v'] = marks['gpa'] / 4 * 100
        d['fullMark'] = 100
        r_mark.append(d)
        d = dict()
        d['subject'] = '排名'
        d['v'] = (1 - marks['order_num'] / marks['speciality_num']) * 100
        d['fullMark'] = 100
        r_mark.append(d)
        return r_mark
