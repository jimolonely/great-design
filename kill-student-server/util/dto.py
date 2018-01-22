def Result(data=None, ok=True, msg=''):
    '''
    封装返回数据的结构
    '''
    return {
        'ok': ok,
        'data': data,
        'msg': msg
    }
