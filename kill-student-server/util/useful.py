import base64
from io import BytesIO
from wordcloud import WordCloud


def txt_to_word_cloud_imgstr(txt):
    '''
    将文本转为词云图片的base64编码字符串返回
    :param self:
    :param txt:
    :return:
    '''
    wd = WordCloud(font_path="/home/jimo/workspace/Git/great-design/kill-student-server/resource/SimHei.ttf",
                   max_font_size=60, \
                   width=600, height=400).generate(txt)
    b = BytesIO()
    wd.to_image().save(b, "PNG")
    img_str = base64.b64encode(b.getvalue())
    return img_str.decode("ascii")
