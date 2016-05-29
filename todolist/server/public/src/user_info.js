
var UserInfo = React.createClass({

	render: function() {

	    return (
                <div className="user-block hidden-xs">
                    <a href="#" id="userToggle" data-toggle="dropdown">
                        <img src="images/profile/profile1.jpg" alt="" className="img-circle inline-block user-profile-pic"/>
                        <div className="user-detail inline-block">
                            冯云
                                <i className="fa fa-angle-down"></i>
                        </div>
                    </a>
                    <div className="panel border dropdown-menu user-panel">
                        <div className="panel-body paddingTB-sm">
                             <ul>
                                <li>
                                   <a href="signin.html">
                                      <i className="fa fa-power-off fa-lg"></i><span className="m-left-xs">Sign out</span>
                                   </a>
                                </li>
                             </ul>
                        </div>
                    </div>
                </div>
	    );
	  }
});


//alert(userInfo.name);
ReactDOM.render(

  <UserInfo  />,

  document.getElementById('header-right')
);