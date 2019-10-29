
import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    apiResponse: ""
  }

  componentDidMount() {
    this.callApi()
  }

  callApi = () => {
    fetch("http://localhost:5000/api/routeIndex")
      .then(res => res.text())
      .then(res => this.setState({apiResponse: res}))
      .catch(err => err);
  }

  
  render () {
    return (
      <div className="App">
        <header>
          <h1> Welcome to React </h1>
        </header>
        <UserRegisterComponent/>
      </div>
    )
  }
}

//user register component
class UserRegisterComponent extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    password2: "",
    dataReturned: null,
    apiLoginResponse: []
  }

  callLoginApi = () => {
    fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }, 
      body: JSON.stringify(this.state),
    })
      .then(res => res.json())
      .then(res => {
        console.log(res, "afterfetch state")
        
        // update state with the returned data and set data returned flag to true
        this.setState({apiLoginResponse: res, dataReturned: !this.state.dataReturned})
      })
      .catch(err => console.log(err))
  }
  handleSubmit = (event) => {
    //If handleSubmit was called by user clicking submit button in form
    if(event) {
      //Prevent default action
      event.preventDefault();
      //Reset skip to 0
      // if(event.target.type == undefined) {
      //   await this.setState({skip: 0});
      // }
    }
    // initialize data returned state to false:
    this.setState({dataReturned: false})
    this.callLoginApi();
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    
  }

  render() {
    return (
      // display register form or else success message and login form if registered
      <div className="register-form">
        <form onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Register Here</h3>
            <input id="inputName" type="text" name="name" placeholder="login name"/>
            <input id="inputEmail" type="text" name="email" placeholder="email"/>
            <input id="inputPass1" type="text" name="password" placeholder="password"/>
            <input id="inputPass2" type="text" name="password2" placeholder="enter password again"/>
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
          </form>
          {this.state.dataReturned===true
            ? <div>
                <ul>
                  <li><strong>Log Id:</strong>  {this.state.apiLoginResponse.name}</li>
                  <li><strong>Log Description:</strong> {this.state.apiLoginResponse.email}</li>
                </ul> 
              </div>
            : null
          }
      </div>
    ) 
  }
}

export default App;
