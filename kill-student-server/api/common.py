from flask_restful import Resource

from util.dto import Result


class LoginFail(Resource):
    def get(self):
        return Result(ok=False, msg="请登录")
