from flask_restful import Resource, request

from util.dto import Result

from service.relation import *
from util.data import load_pandas_df
import numpy as np

from util.config import TEMP_RELATION_FILE_PATH
from util.useful import load_dumped_file
import os


class Relation(Resource):
    '''两门课程的相关性'''

    def get(self, course_code1, course_code2):
        # 如果相同直接返回1
        if course_code2 == course_code1:
            return Result(data={
                'total': 0,
                'prob': "%.2f" % 100,
                'bg_prob': "%.2f" % 100
            })
        return Result(data=similar_of_two_course(course_code1, course_code2))


class Difficulty(Resource):
    '''
    课程难度
    '''

    def get(self, course_code):
        sql = "select course_code,course_name,teach_class_id,pmark as mark ,teacher,grade \
        from view_stu_course_mark where course_code='%s'" % course_code
        df = load_pandas_df(sql)
        if df.empty:
            return Result(ok=False, msg='无此课程')
        course_name = df.iloc[0]['course_name']
        mean_mark = self.get_group_key_value(df.groupby('grade'), 'mean')
        # 计算挂科率
        fail_cnt = self.get_group_key_value(df[df.mark < 60.0].groupby('grade'), 'count')
        normal_cnt = self.get_group_key_value(df.groupby('grade'), 'count')
        hang_rate = {}
        for k in normal_cnt.keys():
            hang_rate[k] = fail_cnt.get(k, 0) / normal_cnt[k]
        # 封装数据
        # [{year:'2018',mean_mark:70,hang_rate:20%},...]
        re = dict()
        data = []
        mark = []
        for k in mean_mark.keys():
            d = {}
            d['year'] = k
            d['mean_mark'] = mean_mark.get(k, 0)
            d['hang_rate'] = hang_rate.get(k, 0) * 100
            data.append(d)
            mark.append(1 - mean_mark.get(k, 0) / 100 + hang_rate.get(k, 0))
        re['data'] = data
        re['mark'] = float(np.sum(mark) / (2 * len(mean_mark))) * 100
        re['course'] = course_name
        return Result(re)

    def get_group_key_value(self, g, func):
        keys = list(g.groups.keys())
        count = g.agg({'mark': func})
        values = list(count['mark'].values)
        d = {}
        for i in range(len(keys)):
            d[keys[i]] = values[i]
        return d


class CourseTeacherCompare(Resource):
    '''
    同一门课不同老师的多维度比较
    '''

    def get(self, course_code):
        sql = "select course_code,course_name,pmark as mark,teacher,term_name \
        from view_stu_course_mark where course_code='%s' and exam_type='正考'" % course_code
        df = load_pandas_df(sql)
        if df.empty:
            return Result(ok=False, msg="查无此课程")
        # 计算各个老师的平均分
        g = df.groupby(['teacher', 'term_name'])
        tea_mean_mark = g.agg({'mark': 'mean', 'course_code': 'count'})
        tea_mean_mark_dict = tea_mean_mark.to_dict()
        mean_marks = tea_mean_mark_dict['mark']
        tea_marks = {}
        for k in mean_marks.keys():
            marks = tea_marks.get(k[0], [])
            marks.append(mean_marks[k])
            tea_marks[k[0]] = marks

        tea_final_mean_marks, mean_std = self.cal_rate(tea_marks)

        # 计算各个老师的挂科率
        fail_dict = df[df.mark < 60.0].groupby(['teacher', 'term_name']).agg({'course_code': 'count'}).to_dict()[
            'course_code']
        all_dict = tea_mean_mark.to_dict()['course_code']
        hang_rate, hang_std = self.cal_my_rate(fail_dict, all_dict)

        # 计算高分率(>=85)
        high_dict = df[df.mark >= 85.0].groupby(['teacher', 'term_name']).agg({'course_code': 'count'}).to_dict()[
            'course_code']
        high_rate, high_std = self.cal_my_rate(high_dict, all_dict)

        # 老师带过的学生数量
        tea_stu_count = df.groupby('teacher').agg({'mark': 'count'}).to_dict()['mark']
        '''
        {'任自珍': 109,
         '冯威': 104,
         '刘成龙': 242}
        '''

        # 构建返回集
        re = dict()
        data = []
        for k in tea_final_mean_marks.keys():
            d = dict()
            d['name'] = k
            d['mean_mark'] = tea_final_mean_marks.get(k, 0)
            d['hang_rate'] = hang_rate.get(k, 0) * 100
            d['high_rate'] = high_rate.get(k, 0) * 100
            d['stu_num'] = int(tea_stu_count.get(k, 0))
            d['hang_std'] = hang_std.get(k, 0.0)
            d['high_std'] = high_std.get(k, 0.0)
            d['mean_std'] = mean_std.get(k, 0.0)
            data.append(d)
        re['data'] = data
        re['course'] = df.iloc[0]['course_name']
        return Result(re)

    def cal_my_rate(self, part_dict, all_dict):
        '''
        计算高分率和挂科率
        :param part_dict:
        :param all_dict:
        :return:
        '''
        temp_dict = dict()
        for k in all_dict.keys():
            fail_cnt = part_dict.get(k, 0)
            hang_list = temp_dict.get(k[0], [])
            hang_list.append(fail_cnt / all_dict[k])
            temp_dict[k[0]] = hang_list
        return self.cal_rate(temp_dict)

    def cal_rate(self, dict_list):
        '''
        提取出的公共方法
        :param dict_list:
        {'任自珍': [68.504587155963307],
        '冯威': [69.25],
        '刘成龙': [68.522935779816507, 73.375939849624061],...}
        :return:
        {'任自珍': 0.082568807339449546,
         '冯威': 0.17307692307692307,
         '刘成龙': 0.13602814375388012}
        '''
        rate = dict()
        std = dict()  # 标准差
        for name in dict_list.keys():
            hang_list = dict_list[name]
            rate[name] = sum(hang_list) / len(hang_list)
            std[name] = np.std(hang_list)
        return rate, std


class TeacherCourseCompare(Resource):
    '''计算一个老师的不同课程的均分,挂科率,高分率,波动性对比'''

    def get(self, teacher_name):
        sql = "select course_code,course_name,pmark,teacher \
            from view_stu_course_mark where teacher='%s'" % teacher_name
        df = load_pandas_df(sql)
        if df.empty:
            return Result(ok=False, msg="查无此老师数据")
        g = df.groupby(['course_name'])
        d_all = g.agg({'pmark': 'mean', 'course_code': 'count'}).rename(
            columns={'pmark': 'mean', 'course_code': 'count'}).to_dict()
        d_std = g.agg({'pmark': 'std'}).rename(columns={'pmark': 'std'}).to_dict()['std']
        d_hang_count = df[df['pmark'] < 60].groupby('course_name').agg({'pmark': 'count'}).rename(
            columns={'pmark': 'count'}).to_dict()['count']
        d_high_count = df[df['pmark'] >= 85].groupby('course_name').agg({'pmark': 'count'}).rename(
            columns={'pmark': 'count'}).to_dict()['count']

        d_all_mean = d_all['mean']
        d_all_count = d_all['count']
        data = []
        for course_name, cnt in d_all_count.items():
            d = dict()
            d['name'] = course_name
            d['mean_mark'] = d_all_mean.get(course_name, 0)
            d['hang_rate'] = (d_hang_count.get(course_name, 0) / cnt) * 100
            d['high_rate'] = (d_high_count.get(course_name, 0) / cnt) * 100
            d['stu_num'] = int(cnt)
            d['mean_std'] = d_std.get(course_name, 0.0)
            data.append(d)
        re = dict()
        re['data'] = data
        re['course'] = df.iloc[0]['teacher']
        return Result(re)


temp = RunThread()


class RelationCompute(Resource):
    '''
    计算相关性接口
    '''

    def get(self, state=None):
        '''
        用于查询计算进度
        :return:
        '''
        p = load_dumped_file(os.path.join(TEMP_RELATION_FILE_PATH, 'process.txt'))
        if p is None:
            p = {}
        result = dict()
        result['names'] = p.get('names', [])
        result['time'] = p.get('time', 0)
        result['process'] = p.get('process', 0) * 100
        result['finish'] = p.get('finish', False)
        return Result(data=result)

    def post(self):
        '''
        控制计算的开始和停止
        :return:
        '''
        # args: ImmutableMultiDict([('speciality_codes[0]', '12'), ('speciality_codes[1]', '34'), ('run', 'true')])
        # args = request.form.to_dict()
        global temp

        args = request.form
        # 获取参数
        run = True if args['run'] == 'true' else False

        if run:
            temp.start()
        else:
            temp.stop()
        return Result(data="ok")


class GetThreadState(Resource):
    def get(self):
        '''
        获取线程状态
        :return:
        '''
        global temp
        return Result(data=temp.is_run())


class ShowCourseRelation(Resource):
    def get(self):
        '''
        从文件里获取计算好的专业nodes和links列表
        :return:[{
            code:'1010',
            name:''
        }]
        '''
        p = load_dumped_file(os.path.join(TEMP_RELATION_FILE_PATH, 'process.txt'))
        if p is None:
            p = {}
        result = p.get('names', [])
        return Result(data=result)

    def post(self):
        '''
        post方式就从文件读取nodes和links返回
        :return:
        '''
        args = request.form
        code = args.get('code', None)
        top_node_num = int(args.get('topNodeNum', 0))
        max_node_size = int(args.get('maxNodeSize', 30))
        re = dict()
        re['nodes'] = []
        re['links'] = []
        re['originNodeNum'] = 0
        if code:
            nodes = load_dumped_file(os.path.join(TEMP_RELATION_FILE_PATH, code + '_2014_nodes.txt'))
            links = load_dumped_file(os.path.join(TEMP_RELATION_FILE_PATH, code + '_2014_links.txt'))
            re['originNodeNum'] = len(nodes)
            re['nodes'] = self.adjust_graph(nodes, top_node_num, max_node_size)
            re['links'] = links
        return Result(data=re)

    def adjust_graph(self, nodes, top_node_num, max_node_size=30):
        '''
        矫正关系图
        :param max_node_size:最大节点大小,建议30
        :param top_node_num: 最多显示多少个从大到小排序的节点
        :return:
        '''
        if len(nodes) == 0:
            return []
        if top_node_num <= 1:
            top_node_num = len(nodes)
        # 找出最大的
        nodes = sorted(nodes, key=lambda n: n['symbolSize'], reverse=True)
        max_size = nodes[0]['symbolSize']
        scale = max_size / max_node_size
        nodes_now = []
        for node in nodes[:top_node_num]:
            node['symbolSize'] /= scale
            # 舍去小的
            if node['symbolSize'] > 1:
                nodes_now.append(node)
        return nodes_now
