from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from api.course import Relation, Difficulty, CourseTeacherCompare, RelationCompute, GetThreadState, \
    ShowCourseRelation
from api.student import StuToTeacherAdviceWordCloud
from api.teacher import TeacherCourseAdviceWordCloud, TeacherAllAdviceWordCloud

errors = {
    'KeyError': {
        'ok': False,
        'msg': 'error',
        'data': None
    }
}

app = Flask(__name__)
api = Api(app, errors=errors)
CORS(app)

api.add_resource(StuToTeacherAdviceWordCloud, '/fun/<stuId>')
api.add_resource(TeacherCourseAdviceWordCloud, '/teacher/wc/<teacher_name>/<course_name>')
api.add_resource(TeacherAllAdviceWordCloud, '/teacher/wc/<teacher_name>')
api.add_resource(Relation, '/course/relation/<course_code1>/<course_code2>')
api.add_resource(Difficulty, '/course/difficulty/<course_code>')
api.add_resource(CourseTeacherCompare, '/course/teacher-compare/<course_code>')
api.add_resource(RelationCompute, '/course/relation-compute')
api.add_resource(GetThreadState, '/course/relation-compute/get-state')
api.add_resource(ShowCourseRelation, '/course/relation-show/complete-speciality')

if __name__ == '__main__':
    app.run(debug=True, port=8082, host='0.0.0.0')
