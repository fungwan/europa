
var Project = React.createClass({

	render: function() {

	    return (
					<li className={'bg-palette3' }>
								<a href={this.props.name+this.props.projectId}>
									<span className="menu-content block">
										<span className="menu-icon"><i className="block fa fa-list fa-lg"></i></span>
										<span className="text m-left-sm">{this.props.name}</span>
									</span>
								</a>
					</li>
	    );
	  }
});

var ProjectList = React.createClass({

	render: function() {
    	//var project_list = [{'name':'工作','id':'1'},{'name':'家庭','id':'2'}];
    	var project_list = [];
    	var rows = [];
    	for (i = 0; i < project_list.length; i++) {

				rows.push(	 <Project  key={project_list[i].id} projectId={project_list[i].id} name={project_list[i].name}/>   			);
	    	}
	    return (
	    	<div>
	    		{rows}
	    	</div>	
	    );
	  }
});

var LeftBar = React.createClass({

  getInitialState: function() {
    return {liked: false};
  },

  render: function() {
    return (
    	<div  className="sidebar-inner scrollable-sidebar">
			<div className="main-menu">	
				<ul class="accordion">					
					<li className={'bg-palette1' + (this.props.sideBarSelect.firstClassSel === 'taskMgt' ? ' active' : '')}>
								<a href="#">
									<span className="menu-content block">
										<span className="menu-icon"><i className="block fa fa-list fa-lg"></i></span>
										<span className="text m-left-sm">所有</span>
									</span>
								</a>
					</li>
					<li className={'bg-palette2' + (this.props.sideBarSelect.firstClassSel === 'taskMgt2' ? ' active' : '')}>
								<a href="#">
									<span className="menu-content block">
										<span className="menu-icon"><i className="block fa fa-list fa-lg"></i></span>
										<span className="text m-left-sm">今天</span>
									</span>
								</a>
					</li>
					<li className={'bg-palette4' + (this.props.sideBarSelect.firstClassSel === 'taskMgt3' ? ' active' : '')}>
								<a href="#">
									<span className="menu-content block">
										<span className="menu-icon"><i className="block fa fa-list fa-lg"></i></span>
										<span className="text m-left-sm">收集箱</span>
									</span>
								</a>
					</li>
					<ProjectList/>

				</ul>		
			</div>	
			<div className="sidebar-fix-bottom clearfix">
				<div className="user-dropdown dropup pull-left">
							<a href="#" className="dropdwon-toggle font-18" data-toggle="dropdown"><i className="ion-person-add"></i>
							</a>
							<ul className="dropdown-menu">
								<li>
									<a href="inbox.html">
										Inbox
										<span className="badge badge-danger bounceIn animation-delay2 pull-right">1</span>
									</a>
								</li>			  
								<li>
									<a href="#">
										Notification
										<span className="badge badge-purple bounceIn animation-delay3 pull-right">2</span>
									</a>
								</li>			  
								<li>
									<a href="#" className="sidebarRight-toggle">
										Message
										<span className="badge badge-success bounceIn animation-delay4 pull-right">7</span>
									</a>
								</li>			  	  
								<li className="divider"></li>
								<li>
									<a href="#">Setting</a>
								</li>			  	  
							</ul>
				</div>
				<a href="lockscreen.html" className="pull-right font-18"><i className="ion-log-out"></i></a>
			</div>
		</div>
    );
  }
});


ReactDOM.render(

  <LeftBar sideBarSelect={sideBarSelect} />,

  document.getElementById('leftBar')
);