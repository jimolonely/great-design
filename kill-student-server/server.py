from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from api.course import Relation, Difficulty, CourseTeacherCompare, TeacherCourseCompare, \
    RelationCompute, GetThreadState, \
    ShowCourseRelation
from api.mark import CollegeMarkInitData, CollegeMark, SpecialityCluster
from api.student import StuToTeacherAdviceWordCloud, StuFailPredict, Studenta, MultiStudenta
from api.teacher import TeacherCourseAdviceWordCloud, TeacherAllAdviceWordCloud

# from api.common import LoginFail

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

# api.add_resource(LoginFail, '/login')

api.add_resource(StuToTeacherAdviceWordCloud, '/fun/<stuId>')
api.add_resource(StuFailPredict, '/stu/get-undo-course/<stu_id>', '/stu/fail-predict')
api.add_resource(Studenta, '/stu/studenta/<stu_id>')
api.add_resource(MultiStudenta, '/stu/multi-studenta')

api.add_resource(TeacherCourseAdviceWordCloud, '/teacher/wc/<teacher_name>/<course_name>')
api.add_resource(TeacherAllAdviceWordCloud, '/teacher/wc/<teacher_name>')

# course
api.add_resource(Relation, '/course/relation/<course_code1>/<course_code2>')
api.add_resource(Difficulty, '/course/difficulty/<course_code>')
api.add_resource(CourseTeacherCompare, '/course/teacher-compare/<course_code>')
api.add_resource(TeacherCourseCompare, '/course/teacher-course-compare/<teacher_name>')
api.add_resource(RelationCompute, '/course/relation-compute')
api.add_resource(GetThreadState, '/course/relation-compute/get-state')
api.add_resource(ShowCourseRelation, '/course/relation-show/complete-speciality',
                 '/course/relation-show/get-nodes-links')
# mark
api.add_resource(CollegeMarkInitData, '/mark/get_meta_data')
api.add_resource(CollegeMark, '/mark/college/<college>/<grade>', '/mark/college/<college>/')
api.add_resource(SpecialityCluster, '/mark/speciality_cluster/<grade>/<speciality_code>/<n_clusters>',
                 '/mark/speciality_cluster/<grade>/<speciality_code>')


@app.before_request
def authenticate():
    pass
    # args = request.args
    # print(args)
    # abort(jsonify(Result(ok=False, msg="login failed")))


if __name__ == '__main__':
    app.run(debug=True, port=8082, host='0.0.0.0')
