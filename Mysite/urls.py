"""Mysite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin

from testQuant import views as alphaquant_views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', alphaquant_views.index, name='/'),
    url(r'^community/(\d+)/$', alphaquant_views.community, name='community'),
    url(r'^articles/(\d+)/$', alphaquant_views.article_detail, name='article'),
    url(r'^articles/new/$', alphaquant_views.new_article, name='new_article'),
    url(r'^new_comment/(\d+)/$', alphaquant_views.new_comment, name='new_comment'),
    url(r'^edit_article/(\d+)/$', alphaquant_views.edit_article, name='edit_article'),

    url(r'^logout/$', alphaquant_views.account_logout, name='logout'),
    url(r'^login/$', alphaquant_views.account_login, name='login'),
    url(r'^regist/$', alphaquant_views.account_regist, name='regist'),
    url(r'^user/account/index$', alphaquant_views.account_info, name='account'),
    url(r'^user/(\d+)/$', alphaquant_views.user_account_info, name='user_account'),
    url(r'^upload_head_img/$', alphaquant_views.upload_head_img, name='upload_head_img'),


    url(r'^policy_list/', alphaquant_views.showPolicy_list, name='policy_list'),
    url(r'^createPolicy/$', alphaquant_views.createPolicy, name='createPolicy'),
    url(r'policy/$',alphaquant_views.showPolicy, name='policy'),
    url(r'deletePolicy/$', alphaquant_views.deletePolicy, name='deletePolicy'),
    url(r'savePolicy/$', alphaquant_views.savePolicy, name='savePolicy'),
    url(r'buildPolicy/$', alphaquant_views.buildPolicy, name='buildPolicy'),
    url(r'getPolicyResult/$',alphaquant_views.getPolicyResult, name='getPolicyResult',),
    url(r'^backtestPolicy/$', alphaquant_views.backtestPolicy,name='backtestPolicy'),
    url(r'^getResultInfo/$', alphaquant_views.getResultInfo, name='getResultInfo'),
    url(r'^getBacktestInfo/$', alphaquant_views.getBacktestInfo,name='getBacktestInfo'),
    url(r'^setEditorInfo/$', alphaquant_views.setEditorInfo, name='setEditorInfo'),
]
