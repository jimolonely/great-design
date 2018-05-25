import base64
import json
from io import BytesIO

from wordcloud import WordCloud


def txt_to_word_cloud_imgstr(txt, width=600, height=400):
    '''
    将文本转为词云图片的base64编码字符串返回
    :param self:
    :param txt:
    :return:
    '''
    wd = WordCloud(font_path="/home/jimo/workspace/Git/great-design/kill-student-server/resource/SimHei.ttf",
                   max_font_size=60, \
                   width=width, height=height).generate(txt)
    b = BytesIO()
    wd.to_image().save(b, "PNG")
    img_str = base64.b64encode(b.getvalue())
    return img_str.decode("ascii")


def dump_obj(path, obj):
    '''先清空再保存对象到文件'''
    with open(path, 'w') as f:
        json.dump(obj, f, ensure_ascii=False)


def load_dumped_file(path):
    '''
    从文件加载对象
    :param path:
    :return:
    '''
    try:
        with open(path, 'r') as f:
            obj = json.load(f)
            return obj
    except:
        return None
