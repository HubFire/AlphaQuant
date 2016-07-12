# coding:utf-8
from __future__ import unicode_literals

from django.db import models

#  导入django自带的用户认证系统
from django.contrib.auth.models import User

# Create your models here.

#  帖子表
class Article(models.Model):
    title = models.CharField(u'文章标题',max_length=64)
    category = models.ForeignKey('Category',verbose_name='版块名')
    priority = models.IntegerField(u'优先级',default=1000)
    author = models.ForeignKey("UserProfile")
    content = models.TextField(u'内容')
    view_count = models.IntegerField(u'浏览数',default=0)
   #  breif = models.TextField(max_length=512,default='none.....')
    hidden = models.BooleanField(default=False)
   # head_img = models.ImageField(upload_to="upload/bbs_summary/")
    publish_date = models.DateTimeField(auto_now=True )

    def __unicode__(self):
        return "%s, author:%s" %(self.title,self.author)


#评论表
class Comment(models.Model):
    article = models.ForeignKey('Article')
    user = models.ForeignKey('UserProfile')
    # python的自关联,实现多层评论,需要别名
    #parent_comment = models.ForeignKey('self',related_name='p_comment',blank=True,null=True)
    content = models.TextField(max_length=1000)
    date = models.DateTimeField(auto_now= True)

    def __unicode__(self):
        return "%s, user:%s" % (self.content, self.user)


#点赞表
# class ThumbUp(models.Model):
#     article = models.ForeignKey('Article')
#     user = models.ForeignKey('UserProfile')
#     date = models.DateTimeField(auto_now=True)
#
#     def __unicode__(self):
#         return "%user:%s" % (self.user)

#版块表
class Category(models.Model):
    name = models.CharField(max_length=32,unique=True)
    #实现管理员和版块之间的多对多关系
    admin = models.ManyToManyField("UserProfile")
    def __unicode__(self):
        return self.name

#策略表
class Policy(models.Model):
    uuid = models.CharField(max_length=64)
    author= models.ForeignKey("UserProfile")
    name = models.CharField(max_length=64)
    content = models.TextField(u'内容')
    update_time = models.DateTimeField(auto_now=True )
    # remark = models.CharField(max_length=255)
    # backtest_count = models.IntegerField(default=0)
    def __unicode__(self):
        return self.name

#任务表
class Task(models.Model):
    uuid = models.CharField(max_length=64)
    user = models.ForeignKey("UserProfile")
    policy = models.ForeignKey("Policy")
    parameter = models.CharField(max_length=255)
    taskType = models.IntegerField(u'任务类型,0是编译,1是回测')
    status = models.IntegerField(u'任务状态')

    def __unicode__(self):
        return self.id

#结果表
class Current_result(models.Model):
    task = models.ForeignKey("Task")
    offset = models.IntegerField()
    content = models.TextField()
    finish_flag = models.IntegerField(u'是否结束')

    def __unicode__(self):
        return self.task.id

# 日志表
class Log(models.Model):
    task = models.ForeignKey("Task")
    offset = models.IntegerField()
    content = models.TextField()
    finish_flag = models.IntegerField()

    def __unicode__(self):
        return self.task.id

#结果信息表
class Result(models.Model):
    task = models.ForeignKey("Task")
    strategy_return = models.FloatField(null=True)
    basic_return = models.FloatField(null=True)
    alpha = models.FloatField(null=True)
    beta = models.FloatField(null=True)
    sharp = models.FloatField(null=True)
    maxdown = models.FloatField(null=True)

    def __unicode__(self):
        return self.task.id

#用户表
class UserProfile(models.Model):
    #集成自带的认证系统
    user = models.OneToOneField(User)
    name = models.CharField(max_length=32)
    wechat = models.CharField(max_length=255,null=True,blank=True)
    resume = models.CharField(max_length=255,default="这个家伙很懒，什么都没留下")
    img_path = models.CharField(max_length=128,default='/static/head-image/default.jpg')
   # friends = models.ManyToManyField("self",blank=True)
   # online = models.BooleanField(default=False)

    def __unicode__(self):
        return self.name

#用户组
# class UserGroup(models.Model):
#     name = models.CharField(max_length=32,unique=True)
#
#     def __unicode__(self):
#         return self.name

class Editor(models.Model):
    fontsize = models.CharField(max_length=10,default='14')
    theme = models.CharField(max_length=20,default='monokai')
    wropmode = models.CharField(max_length=10,default='false')
    user = models.OneToOneField("UserProfile")