from service.mark import MarkMetaInfo
from util.config import MarkMetaType
from util.data import load_data_by_sql
from util.useful import dump_obj, load_dumped_file
from util.config import TEMP_META_MARK_FILE_PATH

import os


def cal_mark():
    if not os.path.exists(TEMP_META_MARK_FILE_PATH):
        os.makedirs(TEMP_META_MARK_FILE_PATH)
    # 查出grade
    grade = load_meta_data("select DISTINCT grade from view_stu_course_mark", 'grade.txt')
    # 查出college
    sql = "select DISTINCT college_code,college_name from view_stu_course_mark"
    college = load_meta_data(sql, 'college.txt')
    # 查出speciality
    sql = "select DISTINCT speciality_code,speciality_name from view_stu_course_mark"
    speciality = load_meta_data(sql, 'speciality.txt')
    # 查出class TODO

    # 开始开启计算线程
    for g in grade:
        for c in college:
            t = MarkMetaInfo(c['college_name'], c['college_code'], g['grade'], MarkMetaType.COLLEGE)
            t.start()
        for s in speciality:
            t = MarkMetaInfo(s['speciality_name'], s['speciality_code'], g['grade'], MarkMetaType.SPECIALITY)
            t.start()
            t.join()


def load_meta_data(sql, file_name):
    path = os.path.join(TEMP_META_MARK_FILE_PATH, file_name)
    if os.path.exists(path):
        data = load_dumped_file(path)
    else:
        data = load_data_by_sql(sql)
        dump_obj(path, data)
    return data


cal_mark()
