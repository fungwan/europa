

var TaskDetail = React.createClass({displayName: "TaskDetail",

  render: function() {  
    return (
					React.createElement("div", {className: "fy-inbox-body ", style: {"position": "relative"}}, 
							React.createElement("div", {style: {'padding': '20px','border-bottom': '1px solid rgba(0,0,0,.1)'}}, 
								React.createElement("div", {className: "btn-group marginTB-xs"}, 
								  		React.createElement("button", {type: "button", className: "btn btn-info btn-xs dropdown-toggle", "data-toggle": "dropdown"}, 
								    		"中优先级 ", React.createElement("span", {className: "caret"})
								  		), 
								  		React.createElement("ul", {className: "dropdown-menu", role: "menu"}, 
								    		React.createElement("li", null, React.createElement("a", {href: "#"}, "低优先级")), 
								    		React.createElement("li", null, React.createElement("a", {href: "#"}, "中优先级")), 
								    		React.createElement("li", null, React.createElement("a", {href: "#"}, "高优先级"))
								  		)
								), 
								React.createElement("div", {className: "marginTB-xs pull-right"}, 
									React.createElement("button", {type: "button", className: "btn btn-info btn-xs "}, 
									React.createElement("i", {className: "fa fa-calendar-o m-right-xs"}), 
									"设置时间"
									)
								)
							), 
							React.createElement("div", {className: "padding-md"}, 
								React.createElement("div", {id: "task-caption", style: {"padding": "0px 14px 16px 0px"}}, 
									React.createElement("h4", null, "今天开发部build的版本有问题，需要大家测试一下")
								), 
								React.createElement("div", {className: "form-group"}, 
									React.createElement("p", null, "任务的描述部分...")	
								)					
							), 	
							React.createElement("div", {id: "task-footer", style: {"position": "absolute","bottom": "-10px","width":"100%","padding": "20px","border-top": "1px solid rgba(0,0,0,.1)"}}, 
								"任务末尾"
							)				
					)	   			
    );
  }
});

ReactDOM.render(

  React.createElement(TaskDetail, null),

  document.getElementById('task_detail')
);