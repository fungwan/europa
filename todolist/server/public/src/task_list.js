
var request = new ApiService();

var TaskDetail = React.createClass({


    taskDetail:{
        name: '',
        desc: ''
    },

    /*componentDidUpdate: function() {
        if(this.props.task.id === ''){

        }
    },*/

    levelMgt:[
        {
            style:"btn btn-info btn-xs dropdown-toggle",
            desc:'低优先级'
        },
        {
            style:"btn btn-warning btn-xs dropdown-toggle",
            desc:'中优先级'
        },
        {
            style:"btn btn-danger btn-xs dropdown-toggle",
            desc:'高优先级'
        },
        {
            style:"btn btn-info btn-xs dropdown-toggle",
            desc:'无'
        }
    ],

    formatDate : function(unixOffset) {

        //alert(this.props.task.id);

        /*return {
            taskDetail:{
                name: this.props.task.name,
                desc: this.props.task.desc
            }
        };*/
        var newDate = new Date();
        newDate.setTime(unixOffset);
        return newDate.toLocaleString();
    },

    componentWillReceiveProps: function(nextProps){
        this.taskDetail = nextProps.task;
    },

    updateItem : function(newObj){

        var url = '/api/tasks(' +newObj.id + ')';
        request.put(url,newObj,function(err,result){
                if(err === null){

                    if (this.isMounted()) {
                        this.props.showItem(this.props.task);
                    }
                }else{

                    if(result === 'Unauthorized'){
                        document.location = '../singin.html';return;
                    }

                    alert(err + result);

                }
            }.bind(this)
        );
    },

    descHandleChange: function(event) {
        this.props.task['desc'] = event.target.value;
        this.setState({taskDetail: this.props.task});
        this.updateItem(this.props.task);
    },

    nameHandleChange: function(event) {
        this.props.task['name'] = event.target.value;
        this.setState({taskDetail: this.props.task});
        this.updateItem(this.props.task);
    },

    levelHandleChange: function(event) {
        this.props.task['level'] = event.target.value;
        this.setState({taskDetail: this.props.task});
        this.updateItem(this.props.task);
    },

    render: function() {
        var detail = this.taskDetail;
        return (
            <div id='taskDetail' className={this.props.task.id === '' ? 'fy-widget-hide' : 'fy-inbox-body'} >
                <div className="fy-task-header">
                    <div className="btn-group marginTB-xs taskHeader-margin-left ">
                        <button type="button" className={this.levelMgt[this.props.task.level].style}
                        data-toggle="dropdown">
                            {this.levelMgt[this.props.task.level].desc}
                            <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu" role="menu">
                            <li>
                                <a onClick={this.levelHandleChange} href="#" value={0} >
                                低优先级
                                </a>
                            </li>
                            <li>
                                <a onClick={this.levelHandleChange} href="#" value={1} >
                                中优先级
                                </a>
                            </li>
                            <li>
                                <a onClick={this.levelHandleChange} href="#" value={2} >
                                高优先级
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="marginTB-xs pull-right">
                    {/*<button type="button" className="btn btn-info btn-xs ">
                     <i className="fa fa-calendar-o m-right-xs">
                     </i>
                     设置时间
                     </button>*/}
                        <small className="block text-muted m-bottom-xs">
                        {/*<i className="fa fa-calendar"></i>*/}
                        {this.formatDate(this.props.task.time)}
                        </small>
                    </div>
                </div>
                <div className="padding-md">

                    <div>
                        <textarea className="fy-task-textarea-title " value={this.props.task.name} onChange={this.nameHandleChange}>

                        </textarea>

                        <textarea className="fy-task-textarea-content " value={detail.desc} onChange={this.descHandleChange}>

                        </textarea>
                    </div>

                </div>
                <div id="task-footer" className="fy-task-footer">
                任务末尾
                </div>
            </div>
    );
  }
});

var Item = React.createClass({
    getInitialState: function() {
        return {
            isChecked: this.props.status === 1 ? 'checked': '',
            isDisabled: this.props.status === 1 ? 'disabled': ''
        };
    },

    handleClick: function(ev) {
        var ev = ev || window.event;
        var target = ev.target || ev.srcElement;
        if (target.nodeName.toLowerCase() == "li") {

            var taskId = target.id;

            var url = '/api/tasks(' + taskId + ')';
            request.get(url,
                function(err, result) {
                    if (err === null) {

                        if (this.isMounted()) {

                            this.props.showItem(result);
                        }
                    } else {

                        if(result === 'Unauthorized'){
                            document.location = '../singin.html';return;
                        }

                        alert(err + result);
                    }
                }.bind(this));
        } else if (target.nodeName.toLowerCase() == "input") {

            var taskId = target.parentNode.parentNode.id;

            var content = {
                "status": 1
            };

            var url = '/api/tasks(' + taskId + ')';
            request.put(url, content,
                function(err, result) {
                    if (err === null) {

                        if (this.isMounted()) {
                            this.props.finishedTask(taskId);
                        }
                    } else {

                        if(result === 'Unauthorized'){
                            document.location = '../singin.html';return;
                        }

                        alert(err + result);
                    }
                }.bind(this));
        } else if (target.nodeName.toLowerCase() == "i") {

            var taskId = target.parentNode.parentNode.id;

            var url = '/api/tasks(' + taskId + ')';
            request.delete(url,
                function(err, result) {
                    if (err === null) {

                        if (this.isMounted()) {

                            this.props.del(taskId);

                            this.props.showItem({
                                id: '',
                                name: '',
                                desc: '',
                                level:3,
                                time:0
                            });
                        }
                    } else {

                        if(result === 'Unauthorized'){
                            document.location = '../singin.html';return;
                        }

                        alert(err + result);
                    }
                }.bind(this));
        }
        //this.props.showItem(target.nodeName.toLowerCase());
    },

    handleChangeChk: function() {
        this.setState({
                isChecked: !this.state.isChecked // flip boolean value
            },
            function() {
                //console.log(this.state);
            }.bind(this));
    },

    render: function() {
        return (
			<li  onClick={this.handleClick} id={this.props.id} className={'list-group-item ' + (this.props.status === 1 ? 'selected' : '')} draggable="true">
				<div className="custom-checkbox todo-checkbox">
						<input type="checkbox" disabled={this.state.isDisabled} checked={this.state.isChecked} onChange={this.handleChangeChk} id={'input-' + this.props.id} />
						<label htmlFor={'input-' + this.props.id}></label>
				</div>
				{this.props.name}
				<div className="remove-list"><i className="ion-close" ></i></div>
			</li>
    );
  }
});

var TaskList = React.createClass({

    delTask: function(id) {

        var rows = this.props.taskList;
        for(var index = 0; index < rows.length; index++){
            if(id === rows[index].id){
                rows.splice(index,1);
                break;
            }
        }

        this.props.onDel(rows);
    },

    finishedTask: function(id) {

        var rows = this.props.taskList;
        for(var index = 0; index < rows.length; index++){
            if(id === rows[index].id){
                rows[index].status = 1;;
                break;
            }
        }

        this.props.onFinished(rows);
    },

	render: function() {
    var that = this;
		var rows = [];
		this.props.taskList.forEach(function(task) {
			rows.push(<Item finishedTask = {that.finishedTask} del={that.delTask} showItem={that.props.showItem} status={task.status} id={task.id} key={task.id} name={task.name}/>);
	    });

	    return (
				<ul className="list-group to-do-list sortable-list no-border">
					{rows}								
				</ul> 
	    );
	  }
});

var TaskNew = React.createClass({
  handleAdd: function (e) {
         e.preventDefault();

         var newtask = this.refs.inputnew.value.trim();

         var rows = this.props.todo;
         if (newtask !== '') {

            var tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo"));
            var ownerId = tokenInfo.owner_id;

            var content = {
                "level": 0,
                "status": 0,
                "desc": "",
                "name": newtask,
                "time":Date.parse(new Date()),
                "account_id": ownerId
            };


             var url = '/api/tasks';
             request.post(url,content,function(err,result){
                     if(err === null){

                         if (this.isMounted()) {
                             content.id = result.id;
                             rows.splice(0, 0, content);
                             this.props.onAdd(rows);
                         }
                     }else{

                         if(result === 'Unauthorized'){
                             document.location = '../singin.html';return;
                         }

                         alert(err + result);
                     }
                 }.bind(this)
             );
         }
         this.refs.inputnew.value = '';
     },

     render: function () {
         return (
              <form onSubmit={this.handleAdd}>
                  <input type="text" placeholder="添加任务至任务箱..." ref="inputnew" 
                                className="form-control" data-slider-value="4" 
                                id="horizontalSlider1" data-slider-handle="round"/>
              </form>
         );
     }
});

var TaskCollections = React.createClass({

    getInitialState: function() {
        return {
            todoItem: {
                id: '',
                name: '',
                desc: '',
                level:3,
                time:0
            },
            todoList: []
        };
    },

    componentDidUpdate: function() {
        //alert('新的任务已经添加进来');
    },

    componentDidMount: function() {

        var tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo"));
        var ownerId = tokenInfo.owner_id;

        var url = this.props.source + '?$filter=account_id eq \'' + ownerId + '\'&$orderby=status asc';
        //alert(url);
        request.get(url,
            function(err, result) {
                if (err === null) {

                    if (this.isMounted()) {

                        this.setState({
                            todoList: result.value
                        });
                    }
                } else {
                    if(result === 'Unauthorized'){
                        document.location = '../singin.html';return;
                    }

                    alert(err + result);
                }
            }.bind(this));
    },

    showTaskDetail: function(item) {
        this.setState({
            todoItem: item
        });
    },

    handleChange: function(rows) {
        this.setState({
            todoList: rows
        });
    },

    render: function() {

        return (
                <div>

                    <div className="fy-inbox-menu padding-md">
                        <h3 style={ { 'font-weight': 'bold', 'font-family': 'Microsoft YaHei'}}>
                        任务
                        </h3>
                        <div className="paddingTB-sm">
                            <TaskNew onAdd={this.handleChange} todo={this.state.todoList}/>
                        </div>
                        <div className="fy-section">
                            <div>
                                <h6>
                                全部
                                </h6>
                                <div className="fy-s-line">
                                </div>
                                <TaskList taskList={this.state.todoList} onFinished={this.handleChange}
                                onDel={this.handleChange} showItem={ this.showTaskDetail}/>
                            </div>
                        </div>
                              {/*<div className="fy-section">
                               <div>
                               <h6>已完成</h6>
                               <div className="fy-s-line" ></div>
                               <TaskList taskList={this.state.todoList} showItem = {this.showTaskDetail}/>
                               </div>
                               </div>}*/}
                    </div>
                    <TaskDetail task={this.state.todoItem} showItem={ this.showTaskDetail}/>
                </div>
            );
    }

});

ReactDOM.render(

  <TaskCollections source= "/api/tasks" />,

  document.getElementById('task_list')
);