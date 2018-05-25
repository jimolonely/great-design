import base64
import json
from io import BytesIO

from wordcloud import WordCloud

from datetime import datetime, date


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


def month_delta(start_date, end_date=datetime.now().date()):
    """
    返回 end_date  - start_date  的差值
        :param start_date:
        :param end_date:
        :return:  month_delta   int
    """
    flag = True
    if start_date > end_date:
        start_date, end_date = end_date, start_date
        flag = False
    year_diff = end_date.year - start_date.year
    end_month = year_diff * 12 + end_date.month
    delta = end_month - start_date.month
    # return -delta if flag is False else delta
    return abs(delta)
