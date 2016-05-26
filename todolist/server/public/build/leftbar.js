
var Project = React.createClass({displayName: "Project",

	render: function() {

	    return (
					React.createElement("li", {className: 'bg-palette3' }, 
								React.createElement("a", {href: this.props.name+this.props.projectId}, 
									React.createElement("span", {className: "menu-content block"}, 
										React.createElement("span", {className: "menu-icon"}, React.createElement("i", {className: "block fa fa-list fa-lg"})), 
										React.createElement("span", {className: "text m-left-sm"}, this.props.name)
									)
								)
					)
	    );
	  }
});

var ProjectList = React.createClass({displayName: "ProjectList",

	render: function() {
    	//var project_list = [{'name':'工作','id':'1'},{'name':'家庭','id':'2'}];
    	var project_list = [];
    	var rows = [];
    	for (i = 0; i < project_list.length; i++) {

				rows.push(	 React.createElement(Project, {key: project_list[i].id, projectId: project_list[i].id, name: project_list[i].name})   			);
	    	}
	    return (
	    	React.createElement("div", null, 
	    		rows
	    	)	
	    );
	  }
});

var LeftBar = React.createClass({displayName: "LeftBar",

  getInitialState: function() {
    return {liked: false};
  },

  render: function() {
    return (
    	React.createElement("div", {className: "sidebar-inner scrollable-sidebar"}, 
			React.createElement("div", {className: "main-menu"}, 	
				React.createElement("ul", {class: "accordion"}, 					
					React.createElement("li", {className: 'bg-palette1' + (this.props.sideBarSelect.firstClassSel === 'taskMgt' ? ' active' : '')}, 
								React.createElement("a", {href: "#"}, 
									React.createElement("span", {className: "menu-content block"}, 
										React.createElement("span", {className: "menu-icon"}, React.createElement("i", {className: "block fa fa-list fa-lg"})), 
										React.createElement("span", {className: "text m-left-sm"}, "所有")
									)
								)
					), 
					React.createElement("li", {className: 'bg-palette2' + (this.props.sideBarSelect.firstClassSel === 'taskMgt2' ? ' active' : '')}, 
								React.createElement("a", {href: "#"}, 
									React.createElement("span", {className: "menu-content block"}, 
										React.createElement("span", {className: "menu-icon"}, React.createElement("i", {className: "block fa fa-list fa-lg"})), 
										React.createElement("span", {className: "text m-left-sm"}, "今天")
									)
								)
					), 
					React.createElement("li", {className: 'bg-palette4' + (this.props.sideBarSelect.firstClassSel === 'taskMgt3' ? ' active' : '')}, 
								React.createElement("a", {href: "#"}, 
									React.createElement("span", {className: "menu-content block"}, 
										React.createElement("span", {className: "menu-icon"}, React.createElement("i", {className: "block fa fa-list fa-lg"})), 
										React.createElement("span", {className: "text m-left-sm"}, "收集箱")
									)
								)
					), 
					React.createElement(ProjectList, null)

				)		
			), 	
			React.createElement("div", {className: "sidebar-fix-bottom clearfix"}, 
				React.createElement("div", {className: "user-dropdown dropup pull-left"}, 
							React.createElement("a", {href: "#", className: "dropdwon-toggle font-18", "data-toggle": "dropdown"}, React.createElement("i", {className: "ion-person-add"})
							), 
							React.createElement("ul", {className: "dropdown-menu"}, 
								React.createElement("li", null, 
									React.createElement("a", {href: "inbox.html"}, 
										"Inbox", 
										React.createElement("span", {className: "badge badge-danger bounceIn animation-delay2 pull-right"}, "1")
									)
								), 			  
								React.createElement("li", null, 
									React.createElement("a", {href: "#"}, 
										"Notification", 
										React.createElement("span", {className: "badge badge-purple bounceIn animation-delay3 pull-right"}, "2")
									)
								), 			  
								React.createElement("li", null, 
									React.createElement("a", {href: "#", className: "sidebarRight-toggle"}, 
										"Message", 
										React.createElement("span", {className: "badge badge-success bounceIn animation-delay4 pull-right"}, "7")
									)
								), 			  	  
								React.createElement("li", {className: "divider"}), 
								React.createElement("li", null, 
									React.createElement("a", {href: "#"}, "Setting")
								)			  	  
							)
				), 
				React.createElement("a", {href: "lockscreen.html", className: "pull-right font-18"}, React.createElement("i", {className: "ion-log-out"}))
			)
		)
    );
  }
});

ReactDOM.render(

  React.createElement(LeftBar, {sideBarSelect: sideBarSelect}),

  document.getElementById('leftBar')
);