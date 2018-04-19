import os
import threading
import time
import numpy as np

from util.config import MarkMetaType
from util.config import TEMP_COLLEGE_MARK_FILE_PATH, TEMP_CLASS_MARK_FILE_PATH, \
    TEMP_SPECIALITY_MARK_FILE_PATH
from util.data import load_pandas_df
from util.useful import dump_obj


class MarkMetaInfo(threading.Thread):
    '''
    计算成绩分析元数据
    '''

    def __init__(self, name, code, grade, type=MarkMetaType.COLLEGE):
        threading.Thread.__init__(self)
        self.is_run = True
        self.name = name
        self.code = code
        self.grade = grade
        self.type = type
        self.path = self.get_path()
        self.df = self.load_college_mark_df()
        self.marks = self.get_avg_stu_marks_df()
        self.data = dict()
        self.start_time = time.time()

    def run(self):
        while self.is_run:
            self.get_stu_num_by_sex()
            self.get_mean_mark()
            self.get_good_stu_num()
            self.get_bad_stu_num()
            self.get_fail_stu_num()
            self.get_property_result('constellation')
            self.get_property_result('province')
            self.get_property_result('nation_name')
            # TODO
            if len(self.data) >= 8:  # 标志着所有计算完成,可以写入存储了
                self.write_to_file()
                self.is_run = False
                print('退出 %s-%s-%s 线程' % (self.name, self.code, self.grade))

    def get_path(self):
        self.start_time = time.time()
        if self.type == MarkMetaType.COLLEGE:
            path = TEMP_COLLEGE_MARK_FILE_PATH
        elif self.type == MarkMetaType.SPECIALITY:
            path = TEMP_SPECIALITY_MARK_FILE_PATH
        else:
            path = TEMP_CLASS_MARK_FILE_PATH
        return path

    def write_to_file(self):
        if not os.path.exists(self.path):
            os.makedirs(self.path)
        self.data['name'] = self.name
        self.data['code'] = self.code
        self.data['grade'] = self.grade
        self.data['timeSpend'] = time.time() - self.start_time
        dump_obj(os.path.join(self.path, self.code + '_' + self.grade + '_mark.txt'), self.data)

    def load_college_mark_df(self):
        '''
        返回需要的学院数据
        :return:
        '''
        # 先判断是否已经计算过了
        if os.path.exists(os.path.join(self.path, self.code + '_' + self.grade + '_mark.txt')):
            print('已存在%s-%s-%s' % (self.name, self.code, self.grade))
            self.is_run = False
            return None
        if self.type == MarkMetaType.CLASS:
            sql = "select *,CONVERT(VARCHAR,birthday,112) as birth from view_stu_course_mark " \
                  "where class_code='%s' and grade='%s'" % (self.code, self.grade)
        elif self.type == MarkMetaType.SPECIALITY:
            sql = "select *,CONVERT(VARCHAR,birthday,112) as birth from view_stu_course_mark " \
                  "where speciality_code='%s' and grade='%s'" % (self.code, self.grade)
        else:
            sql = "select *,CONVERT(VARCHAR,birthday,112) as birth from view_stu_course_mark " \
                  "where college_code='%s' and grade='%s'" % (self.code, self.grade)
        df = load_pandas_df(sql)
        if df.empty:  # 没数据就退出线程
            self.is_run = False
            print('线程%s-%s-%s无数据退出' % (self.name, self.code, self.grade))
        else:
            df['constellation'] = df.apply(self.get_constellation, axis=1)  # 增加星座列
        return df

    def get_constellation(self, row):
        '''根据生日得出星座'''
        birth = str(row['birth'])[4:]
        if (birth >= '1222' and birth <= '1231') or (birth >= '0101' and birth <= '0119'):
            return '魔羯座'
        elif birth >= '0120' and birth <= '0218':
            return '水瓶座'
        elif birth >= '0217' and birth <= '0320':
            return '双鱼座'
        elif birth >= '0319' and birth <= '0420':
            return '白羊座'
        elif birth >= '0419' and birth <= '0520':
            return '金牛座'
        elif birth >= '0519' and birth <= '0621':
            return '双子座'
        elif birth >= '0620' and birth <= '0722':
            return '巨蟹座'
        elif birth >= '0721' and birth <= '0822':
            return '狮子座'
        elif birth >= '0821' and birth <= '0922':
            return '处女座'
        elif birth >= '0921' and birth <= '1022':
            return '天秤座'
        elif birth >= '1023' and birth <= '1121':
            return '天蝎座'
        elif birth >= '1122' and birth <= '1221':
            return '射手座'
        else:
            return '未知星座'

    def get_avg_stu_marks_df(self):
        '''
        要根据学生id聚类然后计算其平均分
        :return:
        '''
        if self.df is not None and not self.df.empty:
            g = self.df.groupby(
                ['student_id', 'college_code', 'college_name', 'sex', 'name', 'birth', 'class_code',
                 'class_name', 'nation_name', 'party', 'province', 'city', 'speciality_code',
                 'speciality_name', 'grade', 'constellation'],
                as_index=False)  # 保留列
            marks = g.agg({'pmark': 'mean'})
            return marks
        return None

    def change_key(self, d):
        '''始终保持男女key的存在'''
        d['female'] = d.pop('女').item() if '女' in d else  0
        d['male'] = d.pop('男').item() if '男' in d else  0
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
            # AttributeError: 'float' object has no attribute 'item'
            # [留学生]工商管理 ,[留学生]计算机科学与技术 2010
            total_avg = self.marks['pmark'].mean().item()
            d = self.marks.groupby('sex', as_index=False).agg({'pmark': np.average}).to_dict()
            avg = dict()
            avg['totalAvg'] = total_avg
            for i in range(len(d['sex'])):
                avg[d['sex'][i]] = d['pmark'][i]
            self.data['avgMark'] = self.change_key(avg)

    def get_good_stu_num(self):
        '''返回学霸人数'''
        if 'goodStuNum' not in self.data:
            d = self.marks[self.marks['pmark'] > 90].groupby('sex', as_index=False) \
                .agg({'pmark': 'count'}).to_dict()
            num = dict()
            for i in range(len(d['sex'])):
                num[d['sex'][i]] = d['pmark'][i]
            self.data['goodStuNum'] = self.change_key(num)

    def get_bad_stu_num(self):
        '''返回学渣人数'''
        if 'badStuNum' not in self.data:
            d = self.marks[self.marks['pmark'] < 65].groupby('sex', as_index=False) \
                .agg({'pmark': 'count'}).to_dict()
            num = dict()
            for i in range(len(d['sex'])):
                num[d['sex'][i]] = d['pmark'][i]
            self.data['badStuNum'] = self.change_key(num)

    def get_fail_stu_num(self):
        '''计算挂科人数'''
        if 'failStuNum' not in self.data:
            d = self.df[self.df['pmark'] < 60].drop_duplicates(subset=['student_id']) \
                .groupby('sex', as_index=False).agg({'pmark': 'count'}).to_dict()
            num = dict()
            for i in range(len(d['sex'])):
                num[d['sex'][i]] = d['pmark'][i]
            self.data['failStuNum'] = self.change_key(num)

    def calStuNumHelper(self, marks, property):
        '''公共代码'''
        stuNum = []
        d = marks.groupby([property, 'sex'], as_index=False) \
            .agg({'pmark': 'count'}).rename(columns={'pmark': 'count'}).to_dict()
        for i in range(len(d['sex'])):
            t = dict()
            t[property] = d[property][i]
            t['sex'] = d['sex'][i]
            t['count'] = d['count'][i].item()
            stuNum.append(t)
        return stuNum

    def calAvgMarkHelper(self, property):
        avgMarkd = self.marks.groupby([property, 'sex'], as_index=False) \
            .agg({'pmark': 'mean', 'grade': 'count'}).rename(
            columns={'pmark': 'mean', 'grade': 'count'}).to_dict()
        avgMark = []
        for i in range(len(avgMarkd['sex'])):
            d = dict()
            d[property] = avgMarkd[property][i]
            d['sex'] = avgMarkd['sex'][i]
            d['mean'] = avgMarkd['mean'][i].item()
            d['count'] = avgMarkd['count'][i].item()
            avgMark.append(d)
        return avgMark

    def get_property_result(self, property):
        '''
        计算各项属性
        property = 'constellation','province','nation_name'
        '''
        if property not in self.data:
            # 按性别求平均分和人数
            re = dict()
            re['avgMark'] = self.calAvgMarkHelper(property)
            # 按求学霸人数
            re['goodStuNum'] = self.calStuNumHelper(self.marks[self.marks['pmark'] > 90], property)
            # 按求渣人数
            re['badStuNum'] = self.calStuNumHelper(self.marks[self.marks['pmark'] < 65], property)
            # 按求挂科人数
            re['failStuNum'] = self.calStuNumHelper(self.df[self.df['pmark'] < 60]
                                                    .drop_duplicates(subset=['student_id']), property)
            self.data[property] = re


'''
测试代码
'''


def test_college():
    colleges = ['04', '03']
    grades = ['2014', '2013']
    for c in colleges:
        for g in grades:
            t = MarkMetaInfo(c, g)
            t.start()


# test_college()

# 测试下没数据的情况
def test_no_data():
    t = MarkMetaInfo('班级', '0403201503', '2014', MarkMetaType.CLASS)
    t.start()


# test_no_data()

def test_class():
    classs = ['0403201503', '0403201603']
    grades = ['2014', '2015']
    for c in classs:
        for g in grades:
            t = MarkMetaInfo('班级', c, g, MarkMetaType.CLASS)
            t.start()


# test_class()

def test_speciality():
    classs = ['0403']
    grades = ['2014', '2015']
    for c in classs:
        for g in grades:
            t = MarkMetaInfo('专业', c, g, MarkMetaType.SPECIALITY)
            t.start()

# test_speciality()
