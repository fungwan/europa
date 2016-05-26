
var request = new ApiService();

var TaskDetail = React.createClass({displayName: "TaskDetail",


    taskDetail:{
        name: '',
        desc: ''
    },

    /*getInitialState: function() {

        //alert(this.props.task.id);

        /*return {
            taskDetail:{
                name: this.props.task.name,
                desc: this.props.task.desc
            }
        };
    },*/

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

                    if(result === 'Unauthorized')
                        document.location = '../singin.html'

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

    render: function() {
        var detail = this.taskDetail;
        return (
            React.createElement("div", {className: "fy-inbox-body ", style: { "position": "absolute"}}, 
                React.createElement("div", {style: { 'padding': '20px', 'border-bottom':
                    '1px solid rgba(0,0,0,.1)'}}, 
                    React.createElement("div", {className: "btn-group marginTB-xs"}, 
                        React.createElement("button", {type: "button", className: "btn btn-info btn-xs dropdown-toggle", 
                        "data-toggle": "dropdown"}, 
                        "中优先级", 
                            React.createElement("span", {className: "caret"}
                            )
                        ), 
                        React.createElement("ul", {className: "dropdown-menu", role: "menu"}, 
                            React.createElement("li", null, 
                                React.createElement("a", {href: "#"}, 
                                "低优先级"
                                )
                            ), 
                            React.createElement("li", null, 
                                React.createElement("a", {href: "#"}, 
                                "中优先级"
                                )
                            ), 
                            React.createElement("li", null, 
                                React.createElement("a", {href: "#"}, 
                                "高优先级"
                                )
                            )
                        )
                    ), 
                    React.createElement("div", {className: "marginTB-xs pull-right"}, 
                        React.createElement("button", {type: "button", className: "btn btn-info btn-xs "}, 
                            React.createElement("i", {className: "fa fa-calendar-o m-right-xs"}
                            ), 
                        "设置时间"
                        )
                    )
                ), 
                React.createElement("div", {className: "padding-md"}, 
                    React.createElement("div", {id: "task-caption", style: { "padding": "0px 14px 16px 0px"}}, 
                        React.createElement("h4", null, 
				this.props.task.name
                        )
                    ), 
                    React.createElement("div", {className: "form-group"}, 
                        React.createElement("div", {class: "col-lg-12"}, 
                            React.createElement("textarea", {class: "form-control", value: detail.desc, rows: "3", onChange: this.descHandleChange}

                            )
                        )
                    )
                ), 
                React.createElement("div", {id: "task-footer", style: { "position": "absolute", "bottom":
                    "50px", "width": "100%", "padding": "20px", "border-top":
                    "1px solid rgba(0,0,0,.1)"}}, 
                "任务末尾"
                )
            )
    );
  }
});

var Item = React.createClass({displayName: "Item",
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
            console.log('我点的是li'); //show
            var taskId = target.id;
            console.log(taskId);
            var url = '/api/tasks(' + taskId + ')';
            request.get(url,
                function(err, result) {
                    if (err === null) {

                        if (this.isMounted()) {

                            this.props.showItem(result);
                        }
                    } else {

                        if(result === 'Unauthorized')
                            document.location = '../singin.html'

                        alert(err + result);
                    }
                }.bind(this));
        } else if (target.nodeName.toLowerCase() == "input") {
            console.log('我点的是input'); //finished
            var taskId = target.parentNode.parentNode.id;
            console.log(taskId);
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

                        if(result === 'Unauthorized')
                            document.location = '../singin.html'

                        alert(err + result);
                    }
                }.bind(this));
        } else if (target.nodeName.toLowerCase() == "i") {
            console.log('我点的是i'); //del
            var taskId = target.parentNode.parentNode.id;
            console.log(taskId);
            var url = '/api/tasks(' + taskId + ')';
            request.delete(url,
                function(err, result) {
                    if (err === null) {

                        if (this.isMounted()) {

                            this.props.del(taskId);
                        }
                    } else {

                        if(result === 'Unauthorized')
                            document.location = '../singin.html'

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
			React.createElement("li", {onClick: this.handleClick, id: this.props.id, className: 'list-group-item ' + (this.props.status === 1 ? 'selected' : ''), draggable: "true"}, 
				React.createElement("div", {className: "custom-checkbox todo-checkbox"}, 
						React.createElement("input", {type: "checkbox", disabled: this.state.isDisabled, checked: this.state.isChecked, onChange: this.handleChangeChk, id: 'input-' + this.props.id}), 
						React.createElement("label", {htmlFor: 'input-' + this.props.id})
				), 
				this.props.name, 
				React.createElement("div", {className: "remove-list"}, React.createElement("i", {className: "ion-close"}))
			)
    );
  }
});

var TaskList = React.createClass({displayName: "TaskList",

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
			rows.push(React.createElement(Item, {finishedTask: that.finishedTask, del: that.delTask, showItem: that.props.showItem, status: task.status, id: task.id, key: task.id, name: task.name}));
	    });

	    return (
				React.createElement("ul", {className: "list-group to-do-list sortable-list no-border"}, 
					rows								
				) 
	    );
	  }
});

var TaskNew = React.createClass({displayName: "TaskNew",
  handleAdd: function (e) {
         e.preventDefault();
         // 通过 refs 获取dom元素，然后获取输入的内容
         console.log(this.refs.inputnew.value.trim());
         //var inputDom = this.refs.inputnew.getDOMNode();
         var newtask = this.refs.inputnew.value.trim();
         // 获取传入的todolist数据
         var rows = this.props.todo;
         if (newtask !== '') {
             // 更新数据，并使用 onAdd 更新到 TodoList 组件的 state 中            

            var tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo"));
            var ownerId = tokenInfo.owner_id;

            var content = {
                "level": 0,
                "status": 0,
                "desc": "",
                "name": newtask,
                "account_id": ownerId
            };


             var url = '/api/tasks';
             request.post(url,content,function(err,result){
                     if(err === null){

                         if (this.isMounted()) {
                             content.id = result.id;
                             rows.push(content);
                             this.props.onAdd(rows);
                         }
                     }else{

                         if(result === 'Unauthorized')
                             document.location = '../singin.html'

                         alert(err + result);
                     }
                 }.bind(this)
             );
         }
         this.refs.inputnew.value = '';
     },

     render: function () {
         return (
              React.createElement("form", {onSubmit: this.handleAdd}, 
                  React.createElement("input", {type: "text", placeholder: "添加任务至任务箱...", ref: "inputnew", 
                                className: "form-control", "data-slider-value": "4", 
                                id: "horizontalSlider1", "data-slider-handle": "round"})
              )
         );
     }
});

var TaskCollections = React.createClass({displayName: "TaskCollections",

    getInitialState: function() {
        return {
            todoItem: {
                id: '',
                name: '',
                desc: ''
            },
            todoList: []
        };
    },

    componentDidUpdate: function() {
        //alert('新的任务已经添加进来');
    },

    componentDidMount: function() {

        request.get(this.props.source,
            function(err, result) {
                if (err === null) {

                    if (this.isMounted()) {

                        this.setState({
                            todoList: result.value
                        });
                    }
                } else {
                    if(result === 'Unauthorized')
                        document.location = '../singin.html'

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
                React.createElement("div", null, 
                    React.createElement(TaskDetail, {task: this.state.todoItem, showItem:  this.showTaskDetail}), 
                    React.createElement("div", {className: "fy-inbox-menu padding-md"}, 
                        React.createElement("h3", {style:  { 'font-weight': 'bold', 'font-family': 'Microsoft YaHei'}}, 
                        "任务"
                        ), 
                        React.createElement("div", {className: "paddingTB-sm"}, 
                            React.createElement(TaskNew, {onAdd: this.handleChange, todo: this.state.todoList})
                        ), 
                        React.createElement("div", {className: "fy-section"}, 
                            React.createElement("div", null, 
                                React.createElement("h6", null, 
                                "全部"
                                ), 
                                React.createElement("div", {className: "fy-s-line"}
                                ), 
                                React.createElement(TaskList, {taskList: this.state.todoList, onFinished: this.handleChange, 
                                onDel: this.handleChange, showItem:  this.showTaskDetail})
                            )
                        )
                              /*<div className="fy-section">
                               <div>
                               <h6>已完成</h6>
                               <div className="fy-s-line" ></div>
                               <TaskList taskList={this.state.todoList} showItem = {this.showTaskDetail}/>
                               </div>
                               </div>}*/
                    )
                )
            );
    }

});

ReactDOM.render(

  React.createElement(TaskCollections, {source: "/api/tasks"}),

  document.getElementById('task_list')
);