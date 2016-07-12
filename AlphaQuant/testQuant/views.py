# coding:utf-8
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect, JsonResponse, FileResponse
from django.http import Http404
from django.core.exceptions import ObjectDoesNotExist
from models import *
from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from PIL import Image
import StringIO
import uuid
import  os

# Create your views here.


def index(request):
    return render(request, 'index.html')


def showPolicy_list(request):
    if request.user.is_authenticated():
        author = request.user.userprofile.id
        policy_list = Policy.objects.filter(author_id=author).order_by('-update_time')

        return render(request, 'policy_list.html', {'polist_list': policy_list})
    else:
        return HttpResponseRedirect('/login/')


def showPolicy(request):
    p_uuid = request.build_absolute_uri().split("?id=")[1]
    policy = ""
    if p_uuid:
        try:
            policy = Policy.objects.get(uuid=p_uuid)

        except ObjectDoesNotExist as e:
            return render(request, '404.html', {'err_msg': u'该策略不存在!'})
    try:
        editor = Editor.objects.get(user_id=request.user.userprofile.id)
    except ObjectDoesNotExist as e:
        editor = Editor(fontsize='14', theme='monokai', wropmode=False, user_id=request.user.userprofile.id)
        editor.save()
    return render(request, 'policy.html', {'policy': policy, 'editor': editor})


def createPolicy(request):
    p_uuid = uuid.uuid1()
    author = request.user.userprofile.id
    name = '这是一个简单的策略'
    policy = Policy(uuid=p_uuid, author_id=author, name=name)
    policy.save()
    # return render(request, 'policy_list.html',{'newPolicy':policy})
    return HttpResponseRedirect('/policy?id=' + (str)(policy.uuid))


def deletePolicy(request):
    if request.method == 'POST':
        policy_ids = request.POST.get('policy_ids')
        policy_ids = policy_ids.split(",")
        for policy_id in policy_ids:
            if policy_id:
                Policy.objects.get(id=policy_id).delete()
        return HttpResponse("删除成功")


def savePolicy(request):
    if request.method == 'POST':
        policy_id = request.POST.get('policy_id')
        content = request.POST.get('content')
        name = request.POST.get('name')
        if policy_id:
            try:
                policy = Policy.objects.get(id=policy_id)
                policy.name = name
                policy.content = content
                policy.save()
            except ObjectDoesNotExist as e:
                return render(request, '404.html', {'err_msg': u'该策略不存在!'})
    return HttpResponse()


def buildPolicy(request):
    if request.method == 'POST':
        policy_id = request.POST.get('policy_id')
        parameter = request.POST.get('parameter')
        t_uuid = uuid.uuid1()
        taskType = 0
        status = 0
        user_id = request.user.userprofile.id
        newTask = Task(uuid=t_uuid, parameter=parameter, taskType=taskType, status=status, policy_id=policy_id,
                       user_id=user_id)
        newTask.save()
        task_id = newTask.id
        return HttpResponse(task_id)
    else:
        return HttpResponse("build error")


# 获取结果集
def getPolicyResult(request):
    task_id = request.POST.get('taskId')
    offset = request.POST.get('offset')
    currentResult = Current_result.objects.filter(task_id=task_id, offset=offset)
    if len(currentResult) > 0:
        result = getChartResult(task_id, offset)
        currentLog = Log.objects.filter(offset=(offset), task_id=task_id)
        if len(currentLog) > 0:
            result['log'] = getLogResult(task_id, offset)
        else:
            result['log'] = ""
        return JsonResponse(result)
    else:
        return HttpResponse('not exist')


def getChartResult(task_id, offset):
    time = []
    tmp = []
    stock_price = []
    b = []
    c = []
    cResult = Current_result.objects.get(task_id=task_id, offset=offset)
    finish_flag = cResult.finish_flag
    content = cResult.content
    content = eval(content)
    length = len(content)

    for lt in range(length):
        time=content[lt]['time']
        tmp = content[lt]['content']
        stock_price.append(time+" "+(str)(tmp[0]))
        b.append(time+" "+(str)(tmp[1]))
        c.append(time+" "+(str)(tmp[2]))
    result = {'stock_price': stock_price, "b": b, "c": c, 'finish_flag': finish_flag}
    #print result["b"]
    return result


# 获取日志信息
def getLogResult(task_id, offset):
    log = Log.objects.get(task_id=task_id, offset=offset)
    content = log.content[1:-1]
    return (content)


# 获取策略结果信息
def getResultInfo(request):
    task_id = request.POST.get('taskId')
    print task_id
    result = Result.objects.get(task_id=task_id)
    strategy_return = result.strategy_return
    basic_return = result.basic_return
    alpha = result.alpha
    beta = result.beta
    sharp = result.sharp
    maxdown = result.maxdown
    resultInfo = {'strategy_return': strategy_return, 'basic_return': basic_return, 'alpha': alpha,
                  'beta': beta, 'sharp': sharp, 'maxdown': maxdown}
    return JsonResponse(resultInfo)


def backtestPolicy(request):
    # task_id = request.GET.values
    task_id = request.build_absolute_uri().split("?task_id=")[1]
    print task_id
    return render(request, 'backtest.html', {'task_id': task_id})


def getBacktestInfo(request):
    task_id = request.POST.get('taskId')
    task = Task.objects.get(id=task_id)
    parameter = task.parameter.split(',')
    policy_name = task.policy.name
    task = {'company': parameter[0], 'beginTime': parameter[1], 'endTime': parameter[2], 'money': parameter[3],
            "rate": parameter[4], "policy_name": policy_name}
    return JsonResponse(task)


def setEditorInfo(request):
    if request.method == 'POST':
        fontsize = request.POST.get('fontsize')
        theme = request.POST.get('theme')
        wropmode = request.POST.get('wropmode')
        editor = Editor.objects.get(user_id=request.user.userprofile.id)
        if fontsize:
            editor.fontsize = fontsize
        if theme:
            editor.theme = theme
        if wropmode:
            editor.wropmode = wropmode
        editor.save()
        return HttpResponse()


def community(request, category_id):
    article = Article.objects.filter(category_id=category_id).order_by('-publish_date')
    category = Category.objects.all().order_by('id')
    return render(request, 'community.html', {'articles': article, 'category_list': category,})


def article_detail(request, article_id):
    try:
        article = Article.objects.get(id=article_id)
        comments_list = Comment.objects.filter(article_id=article_id)
        userprofile = UserProfile.objects.get(id=article.author_id)
        article.view_count += 1  # 设置浏览量
        article.save()
    except ObjectDoesNotExist as e:
        return render(request, '404.html', {'err_msg': u'文章不存在'})
    return render(request, 'article.html', {
        'article': article,
        'comments_list': comments_list,
        'userprofile':userprofile
    })


def new_article(request):
    if request.user.is_authenticated():
        if request.method == 'POST':
            article_id = request.POST.get('article_id')
            category = request.POST.get("category_id")
            title = request.POST.get('new_article_title')
            author = request.user.userprofile.id
            content = request.POST.get("article_content")
            if article_id:
                article = Article.objects.get(id=article_id)
                article.category_id = category
                article.title = title
                article.content = content
                article.save()
                return render(request, 'new_article.html', {'update_article': article})
            else:
                newArticle = Article(category_id=category, title=title, author_id=author, content=content)
                newArticle.save()
                return render(request, 'new_article.html', {'newArticle': newArticle})
        category = Category.objects.all().order_by('id')
        return render(request, 'new_article.html', {'category_list': category})
    else:
        return HttpResponseRedirect('/login/')


def edit_article(request, article_id):
    try:
        article = Article.objects.get(id=article_id)
    except ObjectDoesNotExist as e:
        return render(request, '404.html', {'err_msg': u'文章不存在'})
    category = Category.objects.all()
    return render(request, 'new_article.html', {
        'category_list': category,
        'article': article,
    })


def new_comment(request, article_id):
    if request.user.is_authenticated():
        if request.method == 'POST':
            user_id = request.user.userprofile.id
            content = request.POST.get("comment_content")
            newComment = Comment(content=content, user_id=user_id, article_id=article_id)
            newComment.save()
        return HttpResponseRedirect('/articles/' + article_id)
    else:
        return HttpResponseRedirect('/login/')


def account_login(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect('/')
    else:
        err_msg = ''
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return HttpResponseRedirect('/community/1')
            else:
                err_msg = '用户名或密码错误'
        return render(request, 'login.html', {'err_msg': err_msg})


def account_logout(request):
    logout(request)  # 自带的logout方法
    return HttpResponseRedirect('/login/')


def account_regist(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect('/')
    else:
        if request.method == 'POST':
            username = request.POST.get("username")
            password = request.POST.get("password")
            re_password = request.POST.get("re_password")
            email = request.POST.get("email")
            nickname = request.POST.get('nickname')
            err_msg = ''
            if password != re_password:
                err_msg = "密码不一致"
                return render(request, 'regist.html', {'err_msg': err_msg})
            filter_username = User.objects.filter(username=username)
            if len(filter_username) > 0:
                err_msg = "用户名已存在"
                return render(request, 'regist.html', {'err_msg': err_msg})
            filter_email = User.objects.filter(email=email)
            if len(filter_email) > 0:
                err_msg = "该邮箱已经注册"
                return render(request, 'regist.html', {'err_msg': err_msg})

            user = User()
            user.username = username
            user.set_password(password)
            user.email = email
            user.save()
            userprofile = UserProfile()
            userprofile.name = nickname
            userprofile.user_id = user.id
            userprofile.save()
            return HttpResponseRedirect('/login')
        else:
            return render(request, 'regist.html')


def account_info(request):
    userInfo = request.user.userprofile
    article = Article.objects.filter(author_id=userInfo.id).order_by('-publish_date')
    return render(request, 'account.html',{'userInfo':userInfo,'isSelf':True,'articles':article})


def user_account_info(request, user_id):
    try:
        userInfo = UserProfile.objects.get(id=user_id)
    except ObjectDoesNotExist as e:
        return render(request, '404.html', {'err_msg': u'该用户不存在'})
    article = Article.objects.filter(author_id=user_id).order_by('-publish_date')
    return render(request, 'account.html',{'userInfo':userInfo,'articles':article})


def upload_head_img(request):
    buf = request.FILES.get('image', None)
    data = buf.read()
    f = StringIO.StringIO(data)
    image = Image.open(f)
    image = image.convert('RGB')
    path = 'statics/head-image/'
    if not os.path.exists(path):
        os.mkdir(path)
    name =  path + (str)(request.user.userprofile.id)+'.jpg'  # 文件copy路径
    image.thumbnail((128, 128), Image.ANTIALIAS)
    image.save(file(name, 'wb'), 'PNG')

    aliases_path = '/static/head-image/'+(str)(request.user.userprofile.id)+'.jpg'
    userprofile = request.user.userprofile
    userprofile.img_path = aliases_path
    userprofile.save()
    return HttpResponseRedirect("/user/account/index")