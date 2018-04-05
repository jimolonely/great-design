import json
import math
import threading
import time

from util.config import TEMP_FILE_PATH
from util.data import load_pandas_df
from util.useful import dump_obj


def similar_of_two_course(course_code1, course_code2, speciality_code=None):
    '''
    计算2门课程的相似度
    :param course_code1:
    :param course_code2:
    :param speciality_code:当为None时表示不考虑专业
    :return:
    '''
    sql = "select DISTINCT(m1.student_id),m1.course_code as code1,m2.course_code as code2,m1.course_name as name1,m2.course_name as name2,m1.pmark as mark1,m2.pmark as mark2, \
    m1.speciality_code from view_stu_course_mark m1 join view_stu_course_mark m2 on m1.student_id=m2.student_id \
    where m1.course_code='%s' and m2.course_code='%s' " % (course_code1, course_code2)

    if speciality_code is not None:
        sql = sql + " and m1.speciality_code='" + speciality_code + "'"

    df = load_pandas_df(sql)

    # 小于30个人没有参考价值
    if len(df) < 30:
        return {
            'total': 0,
            'prob': "%.2f" % 0.0,
            'bg_prob': "%.2f" % 0.0
        }

    # 求每门课成绩的平均值
    mark_mean1 = float(df.agg({'mark1': 'mean'}))
    mark_mean2 = float(df.agg({'mark2': 'mean'}))

    dist1 = (100 - mark_mean1) / 2
    dist2 = (100 - mark_mean2) / 2

    # 求优秀的分数线
    good_mark1 = mark_mean1 + (100 - mark_mean1) / 2
    good_mark2 = mark_mean2 + (100 - mark_mean2) / 2

    bad_mark1 = bad_mark(mark_mean1, dist1)
    bad_mark2 = bad_mark(mark_mean2, dist2)

    # 过滤出优秀和差的学生数据集
    stu_goods1 = df[df.mark1 > good_mark1]
    stu_goods2 = df[df.mark2 > good_mark2]
    stu_all_goods = stu_goods1[stu_goods1.mark2 > good_mark2]

    stu_bads1 = df[df.mark1 < bad_mark1]
    stu_bads2 = df[df.mark2 < bad_mark2]
    stu_all_bads = stu_bads1[stu_bads1.mark2 < bad_mark2]

    temp = df[df.mark1 <= good_mark1]
    stu_normal1 = temp[temp.mark2 >= bad_mark1]
    temp = stu_normal1[stu_normal1.mark2 >= bad_mark2]
    stu_all_normal = temp[temp.mark2 <= good_mark2]

    # 计算个数和比例
    goods2_cnt = stu_goods2.count()['mark1']
    all_goods_cnt = stu_all_goods.count()['mark1']
    good_prob = all_goods_cnt / goods2_cnt

    bads2_cnt = stu_bads2.count()['mark2']
    all_bads_cnt = stu_all_bads.count()['mark2']
    bad_prob = all_bads_cnt / bads2_cnt

    all_cnt = df.count()['student_id']
    normal2_cnt = all_cnt - goods2_cnt - bads2_cnt
    all_normal_cnt = stu_all_normal.count()['mark2']
    normal_prob = all_normal_cnt / normal2_cnt

    # 最后按照比例分配权重
    w_good = goods2_cnt / all_cnt
    w_bad = bads2_cnt / all_cnt
    w_normal = normal2_cnt / all_cnt
    final_prob = w_good * good_prob + w_bad * bad_prob + w_normal * normal_prob

    # debug
    cnt = goods2_cnt + bads2_cnt
    w_good = goods2_cnt / cnt
    w_bad = bads2_cnt / cnt
    bg_prob = w_good * good_prob + w_bad * bad_prob

    # 返回总数据量,最后的比例结果
    return {
        'total': int(all_cnt),
        'prob': "%.2f" % (final_prob * 100),
        'bg_prob': "%.2f" % (bg_prob * 100)
    }


def bad_mark(mark_mean, dist):
    '''
    求差的分数线
    :param mark_mean:
    :param dist:
    :return:
    '''
    line = mark_mean - dist
    return line if line > 60 else 60.0


def good_mark(mark_mean):
    '''
    求优秀的分数线,差就是小于平均值的分数
    '''
    return mark_mean + (100 - mark_mean) / 2


class CalSpecialityRelationThread(threading.Thread):
    '''
    计算一个专业相关性的线程
    '''

    def __init__(self, speciality_code, grade='2015', temp_file_dir='/tmp/'):
        threading.Thread.__init__(self)
        self.speciality_code = speciality_code
        self.grade = grade
        self.temp_file_dir = temp_file_dir + self.speciality_code
        self.course_records = self.get_course_code()
        self.beginIndex = 0
        self.endIndex = len(self.course_records)
        self.isRun = True  # 控制开关
        self.single_links = []
        self.time_spend = 0  # 总共计算的时间,按秒记
        self.isFinished = self.get_process()

    def get_process(self):
        try:
            with open(self.temp_file_dir + '_process.txt', 'r') as f:
                process = json.load(f)
                self.beginIndex = process.get('beginIndex', 0)
                self.time_spend = process.get('timeSpend', 0)
                if process.get('isFinished', False):
                    self.isRun = False
                    return True
        except:
            pass
        return False

    def run(self):
        '''
        先读取process记录,取出计算了多少
        再开始计算links,中途保存结果
        '''
        if self.isRun:
            self.get_single_links()
            if self.beginIndex == self.endIndex:
                links, nodes = self.get_nodes_and_links()
                # 存到文件里
                dump_obj(self.temp_file_dir + '_links.txt', links)
                dump_obj(self.temp_file_dir + '_nodes.txt', nodes)
                self.isFinished = True
                self.stop()

    def write_process(self):
        process = dict()
        process['specialityCode'] = self.speciality_code
        process['beginIndex'] = self.beginIndex
        process['endIndex'] = self.endIndex
        process['isFinished'] = self.isFinished
        process['timeSpend'] = self.time_spend
        # 写入文件
        dump_obj(self.temp_file_dir + '_process.txt', process)

    def stop(self):
        '''停止本次计算,保存结果,清理垃圾'''
        self.isRun = False
        self.write_process()
        print('已停止')

    def get_course_code(self):
        '''如果本地没有,则从数据库查出课程名和代码,然后组合成一对对的返回'''
        t_path = self.temp_file_dir + '_course_records.txt'
        try:
            with open(t_path, 'r') as f:
                c = json.load(f)
                return c
        except:
            sql = "select DISTINCT(course_name),course_code from view_stu_course_mark where speciality_code='%s' and course_type='必'  \
            and grade='%s'" % (self.speciality_code, self.grade)
            df = load_pandas_df(sql)
            d_records = df.to_dict('records')
            records = []
            n = len(d_records)
            for i in range(n - 1):
                for j in range(i + 1, n):
                    t = (d_records[i], d_records[j])
                    records.append(t)
            dump_obj(t_path, records)
        return records

    def cal_relation(self, code1, code2):
        '''计算相似度调用'''
        # url2 = 'http://localhost:8082/course/relation/'
        # url = url2 + code1 + '/' + code2
        # re = requests.get(url)
        # return re.json()['data']
        return similar_of_two_course(code1, code2)

    def drop_nan(self, num):
        '''如果非数字,则返回0'''
        return 0 if math.isnan(num) else num / 100

    def get_single_links(self):
        '''计算所有课程的两两关系,复杂度为n(n-1)/2'''
        t_path = self.temp_file_dir + '_single_links.txt'
        self.single_links.clear()  # 因为每次调用run方法,都需要重新执行
        # 先从文件中读出已有的
        try:
            with open(t_path, 'r') as f:
                l = f.readlines()
                for x in l:
                    d = json.loads(x)
                    self.single_links.append(d)
        except:
            pass

        batch_link = []  # 辅助写入文件的
        begin_time = time.time()
        for i in range(self.beginIndex, self.endIndex):
            if not self.isRun:
                break
            code1 = self.course_records[i][0]['course_code']
            code2 = self.course_records[i][1]['course_code']
            result = self.cal_relation(code1, code2)
            link = dict()
            link['source'] = self.course_records[i][0]['course_name']
            link['target'] = self.course_records[i][1]['course_name']
            link['prob'] = self.drop_nan(float(result['prob']))
            link['bg_prob'] = self.drop_nan(float(result['bg_prob']))
            link['total'] = result['total']
            self.single_links.append(link)
            batch_link.append(link)
            # 周期性地写入文件,保存结果,因为计算量很大,需要很长时间
            if len(batch_link) > 30 or (i == self.endIndex - 1):
                with open(t_path, 'a') as f:
                    for x in batch_link:
                        json.dump(x, f)
                        f.write('\n')
                    end_time = time.time()
                    # print('写入%d条信息,耗时%.2f 秒' % (len(batch_link),end_time-begin_time))
                    batch_link.clear()
                    self.time_spend += end_time - begin_time
                    begin_time = end_time
                    self.beginIndex = i + 1
                self.write_process()

    def add_one_node_record(self, nodeRecord, name, prob):
        if name in nodeRecord:
            nodeRecord[name]['edgeCount'] += 1
            nodeRecord[name]['probSum'] += prob
        else:
            record = {}
            record['name'] = name
            record['edgeCount'] = 1
            record['probSum'] = prob
            nodeRecord[name] = record

    def get_nodes_and_links(self):
        '''根据单个的课程间概率生成echarts展示的数据结构
        包括nodes和links
        nodes单个的结构如下:
        {
            category: 0,
            name: '高等数学',
            value: 10,
            symbolSize: 50 //圆圈的大小,一般大于30,这里我用与之相连的课程数和他们的概率来计算
        }
        links的单个结构如下:
        { source: '高等数学', target: '大学物理' }
        '''
        nodes = []
        nodeRecord = dict()  # 帮助计算node,存储的结构{name:{edgeCount:0,probSum:0.0}}
        links = []
        for slink in self.single_links:
            # 舍弃掉那些人数少的例子
            if slink['total'] > 30:
                link = dict()
                link['source'] = slink['source']
                link['target'] = slink['target']
                links.append(link)
                self.add_one_node_record(nodeRecord, slink['source'], slink['prob'])
                self.add_one_node_record(nodeRecord, slink['target'], slink['prob'])
        # 计算nodes
        for name, v in nodeRecord.items():
            node = dict()
            node['category'] = 0
            node['name'] = name
            node['symbolSize'] = v['edgeCount'] + v['probSum'] * 2
            nodes.append(node)
        return links, nodes


class RunThread():
    '''
    因为直接在flask的Resource里保存线程,每次获得的都是不同的实例,所以有这个辅助类
    '''

    def __init__(self):
        self.threads = dict()

    def start(self, codes):
        print("start")
        for code in codes:
            thread = CalSpecialityRelationThread(code, temp_file_dir=TEMP_FILE_PATH)
            thread.start()
            self.threads[code] = thread

    def stop(self):
        for thread in self.threads.values():
            print(thread)
            thread.stop()
        self.threads.clear()
        print("stop")
