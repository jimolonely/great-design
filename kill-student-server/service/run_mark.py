from service.mark import MarkMetaInfo
from util.config import MarkMetaType
from util.data import load_data_by_sql
from util.useful import dump_obj
from util.config import TEMP_META_MARK_FILE_PATH

import os


def cal_mark():
    if not os.path.exists(TEMP_META_MARK_FILE_PATH):
        os.makedirs(TEMP_META_MARK_FILE_PATH)
    # 查出grade
    sql = "select DISTINCT grade from view_stu_course_mark"
    grade = load_data_by_sql(sql)
    dump_obj(os.path.join(TEMP_META_MARK_FILE_PATH, 'grade.txt'), grade)
    # 查出college
    sql = "select DISTINCT college_code,college_name from view_stu_course_mark"
    college = load_data_by_sql(sql)
    dump_obj(os.path.join(TEMP_META_MARK_FILE_PATH, 'college.txt'), college)
    # 查出speciality
    sql = "select DISTINCT speciality_code,speciality_name from view_stu_course_mark"
    speciality = load_data_by_sql(sql)
    dump_obj(os.path.join(TEMP_META_MARK_FILE_PATH, 'speciality.txt'), college)
    # 查出class TODO

    # 开始开启计算线程
    for g in grade:
        for c in college:
            t = MarkMetaInfo(c['college_name'], c['college_code'], g['grade'], MarkMetaType.COLLEGE)
            t.start()
        for s in speciality:
            t = MarkMetaInfo(s['speciality_name'], s['speciality_code'], g['grade'], MarkMetaType.SPECIALITY)
            t.start()


cal_mark()
