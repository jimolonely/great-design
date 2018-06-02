import requests
import pandas as pd
from util.config import DATA_SERVER_BASE_URL

# base_url = 'http://192.168.1.146:8081'
base_url = DATA_SERVER_BASE_URL

sql_url = base_url + '/test/data'


def load_data_by_sql(sql):
    '''
    从服务器访问数据
    传入sql
    返回list(json)
    '''
    param = {'sql': sql}
    return load_data(sql_url, param=param)


def load_pandas_df(sql):
    '''
    返回pandas的DataFrame
    '''
    return pd.DataFrame(load_data_by_sql(sql))


def load_data(url, param=None, method_type='GET'):
    '''
    加载数据的元方法
    :param url:
    :param param:
    :param method_type:
    :return:
    '''
    re = None
    if method_type == 'GET':
        re = requests.get(url, params=param)
    elif method_type == 'POST':
        re = requests.post(url)
    try:
        return (re.json()).get('data', None)
    except:
        print(re)
        return None


def load_data_by_uri(uri, param=None):
    '''
    :param uri: 资源相对位置
    :param param: 参数
    :return: data
    '''
    return load_data(base_url + uri, param)
