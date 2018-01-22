from flask_restful import Resource

from util.data import load_pandas_df
from util.useful import txt_to_word_cloud_imgstr
from util.dto import Result


class TeacherCourseAdviceWordCloud(Resource):
    def get(self, teacher_name, course_name):
        '''
        :return: 老师某门课的评价
        '''
        sql = "select cr.advice1,tr.course_name,cr.student_id from teach_record tr \
        join appraise_course_record cr on tr.course_code=cr.course_code and tr.term_id=cr.term_id \
        where course_name='%s' and teacher_name='%s'" % (course_name, teacher_name)
        df = load_pandas_df(sql)
        if df.empty:
            return Result(ok=False, msg="查无数据")
        words = str(set(df['advice1'])).replace('nbsp', '')
        return Result(txt_to_word_cloud_imgstr(words))


class TeacherAllAdviceWordCloud(Resource):
    def get(self, teacher_name):
        sql = "select teacher_name,teacher_appraise,best_course_appraise as best,worst_course_appraise as worst \
        from appraise_term_record where teacher_name='%s'" % (teacher_name)
        df = load_pandas_df(sql)
        # if df.empty:
        #     return Result(ok=False, msg="查无此人")
        words = str(set(df['best']) | set(df['teacher_appraise'])).replace('nbsp', '')
        best_img_str = txt_to_word_cloud_imgstr(words)
        bads = str(set(df['worst'])).replace('nbsp', '')
        bad_img_str = txt_to_word_cloud_imgstr(bads)
        data = {
            'best': best_img_str,
            'bad': bad_img_str
        }
        return Result(data)
