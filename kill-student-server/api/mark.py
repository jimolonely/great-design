from flask_restful import Resource
from util.dto import Result
from service.mark import load_college_grades, load_college_marks


class CollegeMarkInitData(Resource):
    def get(self):
        '''
        将学院和年级以数组形式返回
        :return:
        '''
        re = dict()
        re['colleges'], re['grades'] = load_college_grades()
        return Result(re)


class CollegeMark(Resource):
    def get(self, college, grade):
        d = None
        if college == '' and grade == '':
            pass
        elif college == '' and grade != '':
            pass
        elif grade == '' and grade != '':
            code = college[college.find("_") + 1:]
            pass
        else:
            code = college[college.find("_") + 1:]
            d = load_college_marks(code, grade)
        return Result(ok=False, msg="无数据") if d is None else Result(d)
