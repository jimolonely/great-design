from util.data import load_pandas_df


def similar_of_two_course(course_code1, course_code2):
    '''
    计算2门课程的相似度
    :param course_code1:
    :param course_code2:
    :return:
    '''
    sql = "select DISTINCT(m1.student_id),m1.course_code as code1,m2.course_code as code2,m1.course_name as name1,m2.course_name as name2,m1.pmark as mark1,m2.pmark as mark2, \
    m1.speciality_code from view_stu_course_mark m1 join view_stu_course_mark m2 on m1.student_id=m2.student_id \
    where m1.course_code='%s' and m2.course_code='%s'" % (course_code1, course_code2)
    df = load_pandas_df(sql)

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


# 求差的分数线
def bad_mark(mark_mean, dist):
    line = mark_mean - dist
    return line if line > 60 else 60.0


def good_mark(mark_mean):
    '''
    求优秀的分数线,差就是小于平均值的分数
    '''
    return mark_mean + (100 - mark_mean) / 2


def filter_data():
    pass
