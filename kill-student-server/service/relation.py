import json
import math
import threading
import time
import pyfpgrowth
import os

from util.config import TEMP_RELATION_FILE_PATH, TEMP_META_MARK_FILE_PATH
from util.data import load_pandas_df
from util.useful import dump_obj, load_dumped_file


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
    if goods2_cnt == 0:
        good_prob = 0
    else:
        good_prob = all_goods_cnt / goods2_cnt

    bads2_cnt = stu_bads2.count()['mark2']
    all_bads_cnt = stu_all_bads.count()['mark2']
    if bads2_cnt == 0:
        bad_prob = 0
    else:
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
    if cnt == 0:
        w_good, w_bad = 0, 0
    else:
        w_good = goods2_cnt / cnt
        w_bad = bads2_cnt / cnt
    bg_prob = w_good * good_prob + w_bad * bad_prob

    # print(goods2_cnt)
    # print(bads2_cnt)
    # print(cnt)

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

    def __init__(self, speciality_code, grade='2014', temp_file_dir='/tmp/'):
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
            # 这个包括所有课程
            # sql = "select DISTINCT(course_name),course_code from view_stu_course_mark where speciality_code='%s' and course_type='必'  \
            # and grade='%s'" % (self.speciality_code, self.grade)

            # 这个只有专业相关课程
            sql = "select t.Course_code as course_code,t.Course_name as course_name from train_plan_course t,train_plan_credit c " \
                  "where t.Course_big_type_id=c.sid \
                    and t.Grade='%s' and c.type_name like '%%专业%%'  and t.Speciality_code='%s'" % (
                      self.grade, self.speciality_code)

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
            record = dict()
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
            if slink['total'] > 30 and slink['prob'] > 0.1:
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

    def start(self):
        print("start")
        thread = CalRelation('2014')
        thread.start()
        self.threads['0'] = thread

    def stop(self):
        for thread in self.threads.values():
            print(thread)
            thread.stop()
        self.threads.clear()
        print("stop")

    def is_run(self):
        '''
        获取运行状态,如果无线程则没运行
        :return:
        '''
        return not len(self.threads) == 0


class CalRelation(threading.Thread):
    '''
    通过关联规则计算专业课程相关性
    '''

    def __init__(self, grade):
        threading.Thread.__init__(self)
        self.grade = grade
        self.time = time.time()
        self.specialities = self.get_specialities()
        self.is_run = True and self.process_unfinished()
        self.curr = 0

    def process_unfinished(self):
        '''读取进度文件,返回是否完成'''
        p = load_dumped_file(os.path.join(TEMP_RELATION_FILE_PATH, 'process.txt'))
        if p is None or p['finish'] == False:
            return True
        return False

    def get_specialities(self):
        '''获得专业代码'''
        return load_dumped_file(os.path.join(TEMP_META_MARK_FILE_PATH, 'speciality.txt'))

    def write_process(self, code, name):
        path = os.path.join(TEMP_RELATION_FILE_PATH, 'process.txt')
        p = load_dumped_file(path)
        if p is None:
            p = dict()
        p['process'] = self.curr * 1.0 / len(self.specialities)
        p['finish'] = self.curr == self.specialities
        p['time'] = p.get('time', 0) + (time.time() - self.time)
        if name is not None:
            names = p.get('names', [])
            names.append({'name': name, 'code': code})
            p['names'] = names
        dump_obj(path, p)

    def run(self):
        for s in self.specialities:
            self.curr += 1
            if not self.is_run:
                break
            if not os.path.exists(
                    os.path.join(TEMP_RELATION_FILE_PATH, s['speciality_code'] + '_' + self.grade + '_nodes.txt')):
                try:
                    self.cal_relation(s['speciality_code'], self.grade)
                    self.write_process(s['speciality_code'], s['speciality_name'])
                except Exception as e:
                    print('error')
        self.stop()

    def stop(self):
        self.write_process(None, None)
        self.is_run = False

    def cal_relation(self, speciality_code, grade):

        sql = "select t.Course_code as course_code from train_plan_course t," \
              "train_plan_credit c where t.Course_big_type_id=c.sid \
        and t.Grade='%s' and c.type_name like '%%专业%%'  and t.Speciality_code='%s'" % (grade, speciality_code)
        d1 = load_pandas_df(sql)
        if d1.empty:
            raise Exception()
        code_s = d1['course_code'].tolist()

        sql = "select student_id,course_name,course_code,pmark,mark,term_order from " \
              "view_stu_course_mark where speciality_code='%s' and grade='%s'" % (speciality_code, grade)
        df = load_pandas_df(sql)
        if df.empty:
            raise Exception()
        # 选出了与专业相关的课程
        dd = df[df['course_code'].isin(code_s)]
        dd = dd.drop_duplicates(subset=['student_id', 'course_code'])

        code = dd.groupby(['student_id'], as_index=False)['course_code'].apply(list)
        mark = dd.groupby(['student_id'], as_index=False)['pmark'].apply(list)
        d_mark = mark.to_dict()
        d_code = code.to_dict()
        transac = []
        for k, cd in d_code.items():
            mk = d_mark.get(k, [])
            arr = []
            for i in range(len(mk)):
                if mk[i] >= 90:
                    arr.append(cd[i] + '_2')
                elif mk[i] < 65:
                    arr.append(cd[i] + "_0")
            transac.append(arr)

        # 应用规则挖掘算法
        hold = len(d_mark) * 0.1  # 支持度0.1
        p = pyfpgrowth.find_frequent_patterns(transactions=transac, support_threshold=hold)
        rules = pyfpgrowth.generate_association_rules(p, 0.7)

        # 得到课程名和课程代码的关联,加上term_order,这里去重思想,按term_order最小的保留
        cnts = dd[['course_code', 'course_name', 'term_order']].sort_values(by='term_order').drop_duplicates(
            subset=['course_code', 'course_name'], keep='first')
        names = cnts['course_name'].tolist()
        codes = cnts['course_code'].tolist()
        term = cnts['term_order'].tolist()
        d_course_names = dict()
        for i in range(len(codes)):
            d_course_names[codes[i]] = {'name': names[i], 'term': term[i]}

        # 把rules翻译成课程名
        read_rule = []
        for k, v in rules.items():
            d = dict()
            for post in v[0]:
                post_item = d_course_names[post[:post.find('_')]]
                post_item['type'] = '差' if post[post.find('_') + 1:] == '0' else '好'
                d['post'] = post_item
                pres = []
                for pre in k:
                    pre_item = d_course_names[pre[:pre.find('_')]]
                    if pre_item['term'] < post_item['term']:
                        continue
                    pre_item['type'] = '差' if pre[pre.find('_') + 1:] == '0' else '好'
                    pres.append(pre_item)
                if len(pres) == 0:
                    continue
                d['pre'] = pres
                d['prob'] = v[1]
                read_rule.append(d)

        # 转化成可读形式,给用户看
        rule_str = []
        s_d = set()  # 去重
        for r in read_rule:
            s = []
            post = r['post']['name'] + ' ' + r['post']['type']
            pre = ''
            for p in r['pre']:
                pre += p['name'] + ' ' + p['type']
            if post + pre not in s_d:
                s.append(pre)
                s_d.add(post + pre)
                s.append("==>")
                s.append(post)
                s.append('的可信度为: ' + str(r['prob']))
                # print(" ".join(s))
                rule_str.append(" ".join(s))

        # 将read_rule变成nodes links结构
        d_size = dict()
        links = []
        for r in read_rule:
            d = dict()
            post = r['post']
            for pre in r['pre']:
                prob = r['prob'] if pre['type'] == post['type'] else 0.1 * r['prob']
                d_size[pre['name']] = d_size.get(pre['name'], 0) + prob
                # d_size[post['name']] = d_size.get(post['name'], 0) + prob
                d['source'] = pre['name']
                d['target'] = post['name']
                links.append(d)
        nodes = []
        for k, p in d_size.items():
            d = dict()
            d['category'] = 0
            d['name'] = k
            d['symbolSize'] = p
            d['itemStyle'] = {'color': '#e2e2e2'}
            nodes.append(d)

        # 将结果写入文件
        dump_obj(os.path.join(TEMP_RELATION_FILE_PATH, speciality_code + '_' + grade + '_links.txt'), links)
        dump_obj(os.path.join(TEMP_RELATION_FILE_PATH, speciality_code + '_' + grade + '_nodes.txt'), nodes)
        dump_obj(os.path.join(TEMP_RELATION_FILE_PATH, speciality_code + '_' + grade + '_read_rule.txt'), rule_str)
        dump_obj(os.path.join(TEMP_RELATION_FILE_PATH, speciality_code + '_' + grade + '_rules.txt'), read_rule)
