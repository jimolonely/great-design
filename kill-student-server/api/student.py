import fnmatch
import os
from datetime import datetime

import numpy as np
from flask_restful import Resource, request
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from wordcloud import WordCloud

from util.config import TEMP_COLLEGE_MARK_FILE_PATH, TEMP_SPECIALITY_MARK_FILE_PATH
from util.data import load_data_by_uri, load_pandas_df, load_data_by_sql
from util.dto import Result
from util.useful import load_dumped_file, txt_to_word_cloud_imgstr, month_delta

from datetime import date


class StuToTeacherAdviceWordCloud(Resource):
    '''
    返回学生对老师评价的词云图片的Base64编码
    '''

    def get(self, stuId):
        text = load_data_by_uri("/fun/getStuAdviceToTeacher", param={'stuId': stuId})
        if text is None or text == '':
            return Result(ok=False, msg="查无此人")
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
        sql = "select photo,student_id,name,sex,grade,college_name,speciality_name,nation_name,CONVERT(VARCHAR,birthday,23) " \
              "as birthday,state_type,party,family_address,student_mobilephone, graduation_school,rewards_punish,rid_region," \
              "individual_love,email,school_area,enrollment_mark from " \
              "view_student_full_info where student_id='%s'" % (stu_id)
        stu = load_data_by_sql(sql)
        if stu is None or len(stu) == 0:
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

        # 查奖励
        sql = "select student_name,college_name,speciality_code,speciality_name,grade,reason_type,reason_name,reason_level  \
         ,apply_score from view_my_score_add_apply where student_id='%s'" % stu_id
        df = load_pandas_df(sql)
        wd = WordCloud(font_path="/home/jimo/workspace/Git/great-design/kill-student-server/resource/SimHei.ttf")
        if df.empty:
            apply = ['该生没有奖励']
            labels = list(stu.values())[:10]
            score = 0.9 * marks.get('avg', 0)
        else:
            df['apply'] = df['reason_name'] + "-" + df['reason_type'] + "-" + df['reason_level']
            apply = list(df['apply'].values)
            labels = list(wd.process_text(",".join(df['apply'].values) + stu['individual_love']).keys())
            score = df.apply_score.sum() + 0.9 * marks.get('avg', 0)

        if stu['state_type'] == '在读':
            process = (month_delta(date(int(stu['grade']), 9, 1)) / 46) * 100
        else:
            process = 100

        re = dict()
        re['basicInfo'] = stu
        re['mark'] = marks
        re['process'] = process
        re['radarData'] = r_mark
        re['markList'] = mark_list
        re['courseCondition'] = self.course_judge(df_mark)
        re['apply'] = apply
        re['labels'] = labels
        re['score'] = score
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


class MultiStudenta(Resource):
    def post(self):
        args = request.form
        college_code = args.get('college_code', None)
        speciality_code = args.get('speciality_code', None)
        grade = args.get('grade', None)
        print(args)
        # try:
        #     if college_code != '':
        #         return Result(self.cal_college_studenta(college_code, grade))
        #     elif speciality_code != '':
        #         return Result(self.cal_speciality_studenta(speciality_code, grade))
        #     else:
        #         return Result(ok=False, msg="参数错误")
        # except Exception as e:
        #     return Result(ok=False, msg=str(e))
        if college_code != '':
            return Result(self.cal_college_studenta(college_code, grade))
        elif speciality_code != '':
            return Result(self.cal_speciality_studenta(speciality_code, grade))
        else:
            return Result(ok=False, msg="参数错误")

    def cal_college_studenta(self, college_code, grade):
        re = dict()
        sex, province, constellation = self.cal_stu_counts(college_code, grade, TEMP_COLLEGE_MARK_FILE_PATH)
        re['sex'] = sex
        re['province'] = province
        re['constellation'] = constellation
        re['apply'], re['labels'] = self.cal_stu_apply(college_code, grade, 0)
        re['course'] = self.cal_stu_course(college_code, grade, 0)
        return re

    def cal_speciality_studenta(self, speciality_code, grade):
        re = dict()
        sex, province, constellation = self.cal_stu_counts(speciality_code, grade, TEMP_SPECIALITY_MARK_FILE_PATH)
        re['sex'] = sex
        re['province'] = province
        re['constellation'] = constellation
        re['apply'], re['labels'] = self.cal_stu_apply(speciality_code, grade, 1)
        re['course'] = self.cal_stu_course(speciality_code, grade, 1)
        return re

    def cal_stu_counts(self, code, grade, path):
        '''
        计算性别,星座,地区的人数分布
        :param code:
        :param grade:
        :param path:
        :return:
        '''
        print(grade)
        sex = [{'value': 0, 'name': '男'}, {'value': 0, 'name': '女'}]
        if grade != '':
            file_name = code + "_" + grade + "*"
        else:
            file_name = code + "*"
        cfs = os.listdir(path)
        cf_select = fnmatch.filter(cfs, file_name)
        d_p = dict()
        d_c = dict()
        for name in cf_select:
            d = load_dumped_file(os.path.join(path, name))
            sex[0]['value'] = d['stuNum']['male']
            sex[1]['value'] = d['stuNum']['female']
            for c in d['constellation']['avgMark']:
                d_c[c['constellation']] = d_c.get(c['constellation'], 0) + c['count']
            for p in d['province']['avgMark']:
                d_p[p['province']] = d_p.get(p['province'], 0) + p['count']
        province = [{'value': v, 'name': k} for k, v in d_p.items()]
        constellation = [{'value': v, 'name': k} for k, v in d_c.items()]
        return sex, province, constellation

    def cal_stu_apply(self, code, grade, type):
        sql = None
        if type == 0:
            sql = "select student_name,college_name,speciality_code,speciality_name,grade,reason_type,reason_name,reason_level  \
                         from view_my_score_add_apply where college_code='%s'" % code
        elif type == 1:
            sql = "select student_name,college_name,speciality_code,speciality_name,grade,reason_type,reason_name,reason_level  \
                         from view_my_score_add_apply where speciality_code='%s'" % code
        if grade != '':
            sql = sql + " and grade='%s'" % grade
        print(sql)
        df = load_pandas_df(sql)
        if df.empty:
            raise Exception("无数据")
        d = dict()
        stu = ",".join(df['student_name'].values)
        d['student_name'] = txt_to_word_cloud_imgstr(stu, 400, 300)
        if type == 0:
            d['speciality_name'] = txt_to_word_cloud_imgstr(",".join(df['speciality_name'].values), 400, 300)
        d['reason_type'] = txt_to_word_cloud_imgstr(",".join(df['reason_type'].values), 400, 300)
        name = ",".join(df['reason_name'].values)
        d['reason_name'] = txt_to_word_cloud_imgstr(name, 400, 300)
        d['reason_level'] = txt_to_word_cloud_imgstr(",".join(df['reason_level'].values), 400, 300)
        wd = WordCloud(font_path="/home/jimo/workspace/Git/great-design/kill-student-server/resource/SimHei.ttf")
        labels = [k[0] for k in sorted(wd.process_text(name + "," + stu).items(), key=lambda t: t[1], reverse=True)]
        return d, labels[:10]

    def cal_stu_course(self, code, grade, type):
        sql = None
        if type == 0:
            sql = " select course_name from view_stu_course_mark where college_code='%s' and course_type='选'" % code
        elif type == 1:
            sql = " select course_name from view_stu_course_mark where speciality_code='%s' and course_type='选'" % code
        if grade != '':
            sql = sql + " and grade='%s'" % grade
        # 群体选课偏好
        df = load_pandas_df(sql)
        return txt_to_word_cloud_imgstr(",".join(df['course_name'].values), 400, 300)
