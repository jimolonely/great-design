from flask_restful import Resource

from util.data import load_data_by_uri
from util.dto import Result
from util.useful import txt_to_word_cloud_imgstr


class StuToTeacherAdviceWordCloud(Resource):
    '''
    返回学生对老师评价的词云图片的Base64编码
    '''

    def get(self, stuId):
        text = load_data_by_uri("/fun/getStuAdviceToTeacher", param={'stuId': stuId})
        return Result(data=txt_to_word_cloud_imgstr(text))
