from collections import Counter
import numpy as np
from flask_restful import Resource
from sklearn.cluster import KMeans

from util.dto import Result
from service.mark import load_college_grades, load_college_marks

from util.data import load_data_by_sql, load_pandas_df


class CollegeMarkInitData(Resource):
    def get(self):
        '''
        将学院和年级以数组形式返回
        :return:
        '''
        re = dict()
        re['colleges'], re['grades'] = load_college_grades()
        return Result(re)


class CollegeMark(Resource):
    def get(self, college, grade):
        d = None
        if college == '' and grade == '':
            pass
        elif college == '' and grade != '':
            pass
        elif grade == '' and grade != '':
            code = college[college.find("_") + 1:]
            pass
        else:
            code = college[college.find("_") + 1:]
            d = load_college_marks(code, grade)
        return Result(ok=False, msg="无数据") if d is None else Result(d)


class SpecialityCluster(Resource):
    '''专业聚类分析'''

    def __init__(self):
        self.grade = ''
        self.speciality_code = ''
        self.n_clusters = 3

    def get(self, grade, speciality_code, n_clusters=3):
        self.grade = grade
        self.speciality_code = speciality_code
        self.n_clusters = n_clusters
        try:
            return Result(self.cluster())
        except Exception as e:
            return Result(ok=False, msg=str(e))

    def load_course_code(self):
        '''加载专业相关的课程代码'''
        sql = "select t.Course_code as course_code from train_plan_course t,train_plan_credit c where t.Course_big_type_id=c.sid \
        and t.Grade='%s' and c.type_name like '%%专业%%'  and t.Speciality_code='%s'" % (self.grade, self.speciality_code)
        dd = load_data_by_sql(sql)
        if dd is None or len(dd) == 0:
            raise Exception("无数据")
        return set([d['course_code'] for d in dd])

    def load_mark_data(self):
        sql = "select * from view_stu_course_mark where speciality_code='%s' and grade='%s'" % (
            self.speciality_code, self.grade)
        df = load_pandas_df(sql)
        # 选出了与专业相关的课程
        return df[df['course_code'].isin(self.load_course_code())]

    def prepare_data(self):
        '''
        :return:
        md:{('20122639', '杨永虎'): [96.0,
          91.0,
          88.0,
          77.0,...],...}
        x:[[xxx],[xxx]]
        '''
        dd = self.load_mark_data()
        m = dd.drop_duplicates(subset=['student_id', 'course_code']).groupby(['student_id', 'name'], as_index=False)[
            'pmark'].apply(list)
        md = m.to_dict()
        marks = list(m)
        cnt = [len(m) for m in marks]
        most_len = next(iter(Counter(cnt)))
        x = []
        for a in marks:
            if most_len > len(a):
                s = most_len - len(a)
                for i in range(s):
                    a.append(60)
            else:
                a = a[:most_len]
            x.append(a)
        return x, md

    def cluster(self):
        '''
        :return: {0(类别):{'stu':[人名..],'center':[中心分数]},1:...}
        '''
        x, md = self.prepare_data()
        X = np.array(x)
        kmeans = KMeans(n_clusters=self.n_clusters).fit(X)
        cls_index = list(kmeans.labels_)
        keys = list(md)
        stu = {}
        for i in range(len(cls_index)):
            stu[cls_index[i]] = stu.get(cls_index[i], [])
            stu[cls_index[i]].append(keys[i][1])
        center = kmeans.cluster_centers_
        cls = {}
        for i in range(3):
            cls[i] = dict()
            cls[i]['stu'] = stu[i]
            cls[i]['center'] = list(center[i])
        return cls
