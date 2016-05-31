
var request = new ApiService();

var UserInfo = React.createClass({

    getInitialState: function() {
        return {
            userInfo: {
                id: '',
                name: ''
            }
        };
    },

    componentDidMount: function() {

        request.get(this.props.source,
            function(err, result) {
                if (err === null) {

                    if (this.isMounted()) {

                        this.setState({
                            userInfo : result.content
                        });
                    }
                } else {
                    if(result === 'Unauthorized'){
                        document.location = '../singin.html';return;
                    }


                    alert(err +' : ' +result);
                }
            }.bind(this));
    },

    logout: function() {

        request.delete('/api/loginSessions',
            function(err, result) {
                if (err === null) {

                    if (this.isMounted()) {

                        document.location = '../singin.html';
                    }
                } else {
                    if(result === 'Unauthorized'){
                        document.location = '../singin.html';return;
                    }

                    alert(err +' : ' +result);
                }
            }.bind(this));

    },


	render: function() {

	    return (
                <div className="user-block hidden-xs">
                    <a href="#" id="userToggle" data-toggle="dropdown">
                        <img src="images/profile/coder.jpg" alt="" className="img-circle inline-block user-profile-pic"/>
                        <div className="user-detail inline-block">
                        {this.state.userInfo.name}
                                <i className="fa fa-angle-down"></i>
                        </div>
                    </a>
                    <div className="panel border dropdown-menu user-panel">
                        <div className="panel-body paddingTB-sm">
                             <ul>
                                <li>

                                    <a href="#"  >
                                      <i className="fa fa-power-off fa-lg"></i><span onClick={this.logout} className="m-left-xs">Sign out</span>
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

  <UserInfo  source="/api/loginSessions"/>,

  document.getElementById('header-right')
);