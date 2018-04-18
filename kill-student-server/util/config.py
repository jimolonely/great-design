from enum import Enum

'''
配置一些常量
'''
TEMP_RELATION_FILE_PATH = '/home/jimo/workspace/Git/great-design/relation-data/'
TEMP_COLLEGE_MARK_FILE_PATH = '/home/jimo/workspace/Git/great-design/mark/college/'
TEMP_SPECIALITY_MARK_FILE_PATH = '/home/jimo/workspace/Git/great-design/mark/speciality/'
TEMP_CLASS_MARK_FILE_PATH = '/home/jimo/workspace/Git/great-design/mark/class/'


class MarkMetaType(Enum):
    COLLEGE = 0
    SPECIALITY = 1
    CLASS = 2

# c = MarkMetaType.CLASS
# print(c==MarkMetaType.CLASS)
# print(c==MarkMetaType.COLLEGE)
