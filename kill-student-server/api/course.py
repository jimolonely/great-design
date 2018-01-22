from flask_restful import Resource

from util.dto import Result

from service.relation import *


class Relation(Resource):
    def get(self, course_code1, course_code2):
        return Result(data=similar_of_two_course(course_code1, course_code2))
