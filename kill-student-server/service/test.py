import threading
import time

from util.useful import load_dumped_file, dump_obj
from util.config import TEMP_RELATION_FILE_PATH
import os

exitFlag = 0


class myThread(threading.Thread):  # 继承父类threading.Thread
    def __init__(self, threadID, name, counter):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name = name
        self.counter = counter
        self.data = dict()
        self.is_run = True

    def run(self):  # 把要执行的代码写到run函数里面 线程在创建后会直接运行run函数
        print("Starting " + self.name)
        while self.is_run:
            self.print_time(self.name, self.counter, 5)
            self.print_time(self.name + '2', self.counter, 4)
            self.print_time(self.name + '3', self.counter, 4)
            self.print_time(self.name + '4', self.counter, 4)
            self.print_time(self.name + '5', self.counter, 4)
            if len(self.data) >= 5:
                print("Exiting " + self.name)
                self.is_run = False

    def print_time(self, threadName, delay, counter):
        # if exitFlag:
        #     (threading.Thread).exit()
        time.sleep(delay)
        print("%s: %s" % (threadName, time.ctime(time.time())))
        counter -= 1
        self.data[threadName] = counter


# # 创建新线程
# thread1 = myThread(1, "Thread-1", 1)
# thread2 = myThread(2, "Thread-2", 1)
#
# # 开启线程
# thread1.start()
# thread2.start()
#
# print("Exiting Main Thread")

###########debug relation graph color############

# path = os.path.join(TEMP_RELATION_FILE_PATH, "0402_2014_nodes.txt")
# nodes = load_dumped_file(path)
# re = []
# for n in nodes:
#     n['label'] = {'color': '#000'}
#     re.append(n)
# dump_obj(path, re)

path = os.path.join(TEMP_RELATION_FILE_PATH, "0402_2014_links.txt")
nodes = load_dumped_file(path)
re = []
for n in nodes:
    n['lineStyle'] = {'color': '#000'}
    re.append(n)
dump_obj(path, re)
