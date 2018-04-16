import threading
import numpy as np

from util.data import load_pandas_df


class CollegeMarks(threading.Thread):
    '''
    计算学院成绩分析
    '''

    def __init__(self, college_code, grade):
        threading.Thread.__init__(self)
        self.college_code = college_code
        self.grade = grade
        self.df = self.load_college_mark_df()
        self.marks = self.get_avg_stu_marks_df()
        self.data = dict()

    def run(self):
        self.get_stu_num_by_sex()
        self.get_mean_mark()
        self.get_good_stu_num()
        self.get_bad_stu_num()
        self.get_fail_stu_num()
        if len(self.data) >= 5:  # 标志着所有计算完成,可以写入存储了
            self.write_to_file()

    def write_to_file(self):
        pass

    def load_college_mark_df(self):
        '''
        返回需要的学院数据
        :return:
        '''
        sql = "select *,CONVERT(VARCHAR,birthday,112) as birth from view_stu_course_mark " \
              "where college_code='%s' and grade='%s'" % (self.college_code, self.grade)
        self.df = load_pandas_df(sql)

    def get_avg_stu_marks_df(self):
        '''
        要根据学生id聚类然后计算其平均分
        :return:
        '''
        g = self.df.groupby(
            ['student_id', 'college_code', 'college_name', 'sex', 'name', 'birth', 'class_code', 'class_name',
             'nation_name', 'party', 'province', 'city', 'speciality_code', 'speciality_name', 'grade'],
            as_index=False)  # 保留列
        self.marks = g.agg({'pmark': 'mean'})

    def change_key(self, d):
        if '女' in d:
            d['female'] = d.pop('女')
        if '男' in d:
            d['male'] = d.pop('男')
        return d

    def get_stu_num_by_sex(self):
        '''
        获得男女人数
        :return: {'女': 176, '男': 517}
        '''
        if 'stuNum' not in self.data:
            sex_cnt = dict(self.marks['sex'].value_counts())
            self.data['stuNum'] = self.change_key(sex_cnt)

    def get_mean_mark(self):
        '''
        获得总的和不同性别的平均分
        :return:
        '''
        if 'avgMark' not in self.data:
            total_avg = self.marks['pmark'].mean()
            d = self.marks.groupby('sex', as_index=False).agg({'pmark': np.average}).to_dict()
            avg = dict()
            avg['totalAvg'] = total_avg
            for i in range(len(d['sex'])):
                avg[d['sex'][i]] = d['pmark'][i]
            self.data['avgMark'] = self.change_key(avg)

    def get_good_stu_num(self):
        '''返回学霸人数'''
        if 'goodStuNum' not in self.data:
            d = self.marks[self.marks['pmark'] > 90].groupby('sex', as_index=False).agg({'pmark': 'count'}).to_dict()
            num = dict()
            for i in range(len(d['sex'])):
                num[d['sex'][i]] = num['pmark'][i]
            self.data['goodStuNum'] = self.change_key(num)

    def get_bad_stu_num(self):
        '''返回学渣人数'''
        if 'badStuNum' not in self.data:
            d = self.marks[self.marks['pmark'] < 65].groupby('sex', as_index=False).agg({'pmark': 'count'}).to_dict()
            num = dict()
            for i in range(len(d['sex'])):
                num[d['sex'][i]] = num['pmark'][i]
            self.data['badStuNum'] = self.change_key(num)

    def get_fail_stu_num(self):
        '''计算挂科人数'''
        if 'failStuNum' not in self.data:
            d = self.df[self.df['pmark'] < 60].drop_duplicates(subset=['student_id']) \
                .groupby('sex', as_index=False).agg({'pmark': 'count'}).to_dict()
            num = dict()
            for i in range(len(d['sex'])):
                num[d['sex'][i]] = num['pmark'][i]
            self.data['failStuNum'] = self.change_key(num)
