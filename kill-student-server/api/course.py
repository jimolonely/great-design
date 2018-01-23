from flask_restful import Resource

from util.dto import Result

from service.relation import *
from util.data import load_pandas_df


class Relation(Resource):
    def get(self, course_code1, course_code2):
        return Result(data=similar_of_two_course(course_code1, course_code2))


class Difficulty(Resource):
    def get(self, course_code):
        sql = "select course_code,course_name,teach_class_id,pmark as mark ,teacher,grade \
        from view_stu_course_mark where course_code='%s'" % course_code
        df = load_pandas_df(sql)
        if df.empty:
            return Result(ok=False, msg='无此课程')
        mean_mark = self.get_group_key_value(df.groupby('grade'), 'mean')
        # 计算挂科率
        fail_cnt = self.get_group_key_value(df[df.mark < 60.0].groupby('grade'), 'count')
        normal_cnt = self.get_group_key_value(df.groupby('grade'), 'count')
        hang_rate = {}
        for k in normal_cnt.keys():
            hang_rate[k] = fail_cnt.get(k, 0) / normal_cnt[k]
        # 封装数据
        # [{year:'2018',mean_mark:70,hang_rate:20%},...]
        data = []
        for k in mean_mark.keys():
            d = {}
            d['year'] = k
            d['mean_mark'] = mean_mark.get(k, 0)
            d['hang_rate'] = hang_rate.get(k, 0) * 100
            data.append(d)
        return Result(data)

    def get_group_key_value(self, g, func):
        keys = list(g.groups.keys())
        count = g.agg({'mark': func})
        values = list(count['mark'].values)
        d = {}
        for i in range(len(keys)):
            d[keys[i]] = values[i]
        return d
