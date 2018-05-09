from datetime import datetime

from flask_restful import Resource

from util.data import load_data_by_uri, load_pandas_df
from util.dto import Result
from util.useful import txt_to_word_cloud_imgstr


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
        df3 = df2[df2['year'] >= year]
        df3 = df3[df3['term'] >= term]
        course_all = list(df3['course_name'].values)
        return Result(course_all)
